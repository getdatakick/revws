<?php
/**
 * Copyright (C) 2017-2023 Petr Hucik <petr@getdatakick.com>
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Academic Free License (AFL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/afl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@getdatakick.com so we can send you a copy immediately.
 *
 * @author    Petr Hucik <petr@getdatakick.com>
 * @copyright 2017-2023 Petr Hucik
 * @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 */

namespace Revws;

use Context;
use Customer;
use Db;
use InvalidArgumentException;
use PrestaShopException;
use RevwsReview;
use Shop;

class Visitor
{
    const GUEST = 'guest';
    const CUSTOMER = 'customer';

    /**
     * @var Settings
     */
    private $settings;

    /**
     * @var string
     */
    private $type;

    /**
     * @var int
     */
    private $id;

    /**
     * @var string
     */
    private $firstName = '';

    /**
     * @var string
     */
    private $lastName = '';

    /**
     * @var string
     */
    private $pseudonym = '';

    /**
     * @var string
     */
    private $email = '';

    /**
     * @var array
     */
    private $reactions = null;

    /**
     * @var int[]
     */
    private $reviewedProducts = null;

    /**
     * @var int
     */
    private $language;

    /**
     * @param Context $context
     * @param Settings $settings
     * @param KronaIntegration $krona
     *
     * @throws PrestaShopException
     */
    public function __construct(Context $context, Settings $settings, KronaIntegration $krona)
    {
        $this->settings = $settings;
        $this->language = (int)$context->language->id;
        if ($context->customer->isLogged()) {
            $this->type = self::CUSTOMER;
            $this->id = (int)$context->customer->id;
            $customer = new Customer($this->id);
            $this->email = $customer->email;
            $this->firstName = $customer->firstname;
            $this->lastName = $customer->lastname;
            $this->pseudonym = $settings->usePseudonym() ? $krona->getPseudonym($this->id) : '';
        } else {
            $this->type = self::GUEST;
            if (!(int)$context->cookie->id_guest) {
                $context->cookie->makeNewLog();
            }
            $this->id = (int)$context->cookie->id_guest;
        }
    }

    /**
     * @return string
     */
    public function getPseudonym()
    {
        return $this->pseudonym;
    }

    /**
     * @return string
     */
    public function getFirstName()
    {
        return $this->firstName;
    }

    /**
     * @return string
     */
    public function getLastName()
    {
        return $this->lastName;
    }

    /**
     * @return string
     */
    public function getEmail()
    {
        return trim($this->email);
    }

    /**
     * @param int $reviewId
     * @param string $reactionType
     *
     * @return bool
     * @throws PrestaShopException
     */
    public function hasReacted($reviewId, $reactionType)
    {
        $this->loadReactions();
        return isset($this->reactions[(int)$reviewId][$reactionType]);
    }

    /**
     * @return void
     * @throws PrestaShopException
     */
    private function loadReactions()
    {
        if (is_null($this->reactions)) {
            $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
            $table = _DB_PREFIX_ . 'revws_review_reaction';
            $this->reactions = [];
            $query = "SELECT * FROM $table WHERE id_customer = {$this->getCustomerId()} AND id_guest = {$this->getGuestId()}";
            foreach ($conn->executeS($query) as $row) {
                $review = (int)$row['id_review'];
                $type = $row['reaction_type'];
                $this->reactions[$review][$type] = true;
            }
        }
    }

    /**
     * @return int
     */
    public function getCustomerId()
    {
        return $this->isCustomer() ? $this->id : 0;
    }

    /**
     * @return bool
     */
    public function isCustomer()
    {
        return $this->type == self::CUSTOMER;
    }

    /**
     * @return int
     */
    public function getGuestId()
    {
        return $this->isGuest() ? $this->id : 0;
    }

    /**
     * @return bool
     */
    public function isGuest()
    {
        return $this->type == self::GUEST;
    }

    /**
     * @param string $entityType
     * @param int $entityId
     *
     * @return bool
     * @throws PrestaShopException
     */
    public function hasWrittenReview($entityType, $entityId)
    {
        $this->loadReviews();
        if ($entityType === 'product') {
            return isset($this->reviewedProducts[$entityId]);
        }
        throw new InvalidArgumentException("Invalid entity type $entityType");
    }

    /**
     * @return void
     * @throws PrestaShopException
     */
    private function loadReviews()
    {
        if (is_null($this->reviewedProducts)) {
            $this->reviewedProducts = [];
            $visitorType = $this->getType();
            $visitorId = $this->getId();
            $reviews = RevwsReview::findReviews($this->settings, [
                'deleted' => false,
                $visitorType => (int)$visitorId
            ]);
            foreach ($reviews['reviews'] as $rev) {
                if ($rev->entity_type === 'product') {
                    $this->reviewedProducts[(int)$rev->id_entity] = true;
                }
            }
        }
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return int[]
     * @throws PrestaShopException
     */
    public function getReviewedProducts()
    {
        $this->loadReviews();
        return array_keys($this->reviewedProducts);
    }

    /**
     * @return int[]
     * @throws PrestaShopException
     */
    public function getProductsToReview()
    {
        if ($this->isGuest()) {
            return [];
        }
        $customer = (int)$this->getCustomerId();
        $shop = (int)Shop::getContextShopID();
        $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
        $sql = ("
          SELECT d.product_id, o.date_add
            FROM " . _DB_PREFIX_ . "orders o
            INNER JOIN " . _DB_PREFIX_ . "order_detail d ON (o.id_order = d.id_order AND o.id_shop=d.id_shop)
            INNER JOIN " . _DB_PREFIX_ . "product_shop p ON (p.id_product = d.product_id and p.id_shop = d.id_shop)
            LEFT JOIN  " . _DB_PREFIX_ . "revws_review r ON (r.entity_type = 'product' AND r.id_entity = p.id_product AND r.id_customer = o.id_customer)
            WHERE o.id_customer = $customer
              AND o.id_shop = $shop
              AND r.id_review IS NULL
            ORDER BY o.date_add DESC
        ");
        $data = [];
        foreach ($conn->executeS($sql) as $row) {
            $productId = (int)$row['product_id'];
            if (!isset($data[$productId])) {
                $data[$productId] = true;
            }
        }
        return array_keys($data);
    }

    /**
     * @param int $productId
     *
     * @return bool
     * @throws PrestaShopException
     */
    public function hasPurchasedProduct($productId)
    {
        if ($this->isGuest()) {
            return false;
        }
        return self::hasCustomerPurchasedProduct($this->getCustomerId(), $productId);
    }

    /**
     * @param int $customerId
     * @param int $productId
     *
     * @return bool
     * @throws PrestaShopException
     */
    public static function hasCustomerPurchasedProduct($customerId, $productId)
    {
        $customerId = (int)$customerId;
        $shop = (int)Shop::getContextShopID();
        $productId = (int)$productId;
        $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
        $sql = ("
      SELECT 1
        FROM " . _DB_PREFIX_ . "orders o
        INNER JOIN " . _DB_PREFIX_ . "order_detail d ON (o.id_order = d.id_order AND o.id_shop=d.id_shop)
        INNER JOIN " . _DB_PREFIX_ . "product_shop p ON (p.id_product = d.product_id and p.id_shop = d.id_shop)
        WHERE o.id_customer = $customerId
          AND o.id_shop = $shop
          AND o.delivery_date IS NOT NULL
          AND p.id_product = $productId
    ");
        $res = $conn->executeS($sql);
        return !empty($res);
    }

    /**
     * @return int
     */
    public function getLanguage()
    {
        return $this->language;
    }

}
