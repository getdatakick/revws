<?php
/**
* Copyright (C) 2017-2018 Petr Hucik <petr@getdatakick.com>
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
* @copyright 2017-2018 Petr Hucik
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*/

namespace Revws;
use \Customer;
use \Db;
use \Exception;
use \Shop;
use \RevwsReview;

class Visitor {
  const GUEST = 'guest';
  const CUSTOMER = 'customer';

  private $settings;
  private $type;
  private $id;
  private $firstName='';
  private $lastName='';
  private $pseudonym='';
  private $email='';
  private $reactions = null;
  private $reviewedProducts = null;
  private $language;

  public function __construct($context, Settings $settings, $krona) {
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
      if (! (int)$context->cookie->id_guest) {
        $context->cookie->makeNewLog();
      }
      $this->id = (int)$context->cookie->id_guest;
    }
  }

  public function isGuest() {
    return $this->type == self::GUEST;
  }

  public function isCustomer() {
    return $this->type == self::CUSTOMER;
  }

  public function getId() {
    return $this->id;
  }

  public function getType() {
    return $this->type;
  }

  public function getFirstName() {
    return $this->firstName;
  }

  public function getLastName() {
    return $this->lastName;
  }

  public function getPseudonym() {
    return $this->pseudonym;
  }

  public function getEmail() {
    return trim($this->email);
  }

  public function hasReacted($reviewId, $reactionType) {
    $this->loadReactions();
    return isset($this->reactions[(int)$reviewId][$reactionType]);
  }

  public function getCustomerId() {
    return $this->isCustomer() ? $this->id : 0;
  }

  public function getGuestId() {
    return $this->isGuest() ? $this->id : 0;
  }

  public function hasWrittenReview($entityType, $entityId) {
    $this->loadReviews();
    if ($entityType === 'product') {
      return isset($this->reviewedProducts[$entityId]);
    }
    throw new Exception("Invalid entity type $entityType");
  }

  public function getReviewedProducts() {
    $this->loadReviews();
    return array_keys($this->reviewedProducts);
  }

  private function loadReactions() {
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

  private function loadReviews() {
    if (is_null($this->reviewedProducts)) {
      $this->reviewedProducts = [];
      $visitorType = $this->getType();
      $visitorId = $this->getId();
      $reviews = RevwsReview::findReviews($this->settings, [
        'deleted' => false,
        $visitorType => (int)$visitorId
      ]);
      foreach($reviews['reviews'] as $rev) {
        if ($rev->entity_type === 'product') {
          $this->reviewedProducts[(int)$rev->id_entity] = true;
        }
      }
    }
  }

  public function getProductsToReview() {
    if ($this->isGuest()) {
      return [];
    }
    $customer = (int)$this->getCustomerId();
    $shop = (int)Shop::getContextShopID();
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $sql = ("
      SELECT d.product_id, o.date_add
        FROM "._DB_PREFIX_."orders o
        INNER JOIN "._DB_PREFIX_."order_detail d ON (o.id_order = d.id_order AND o.id_shop=d.id_shop)
        INNER JOIN "._DB_PREFIX_."product_shop p ON (p.id_product = d.product_id and p.id_shop = d.id_shop)
        LEFT JOIN  "._DB_PREFIX_."revws_review r ON (r.entity_type = 'product' AND r.id_entity = p.id_product AND r.id_customer = o.id_customer)
        WHERE o.id_customer = $customer
          AND o.id_shop = $shop
          AND r.id_review IS NULL
        ORDER BY o.date_add DESC
    ");
    $data = [];
    foreach ($conn->executeS($sql) as $row) {
      $productId = (int)$row['product_id'];
      if (! isset($data[$productId])) {
        $data[$productId] = true;
      }
    }
    return array_keys($data);
  }

  public function hasPurchasedProduct($productId) {
    if ($this->isGuest()) {
      return false;
    }
    return self::hasCustomerPurchasedProduct($this->getCustomerId(), $productId);
  }

  public function getLanguage() {
    return $this->language;
  }

  public static function hasCustomerPurchasedProduct($customerId, $productId) {
    $customerId = (int)$customerId;
    $shop = (int)Shop::getContextShopID();
    $productId = (int)$productId;
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $sql = ("
      SELECT 1
        FROM "._DB_PREFIX_."orders o
        INNER JOIN "._DB_PREFIX_."order_detail d ON (o.id_order = d.id_order AND o.id_shop=d.id_shop)
        INNER JOIN "._DB_PREFIX_."product_shop p ON (p.id_product = d.product_id and p.id_shop = d.id_shop)
        WHERE o.id_customer = $customerId
          AND o.id_shop = $shop
          AND o.delivery_date IS NOT NULL
          AND p.id_product = $productId
    ");
    $res = $conn->executeS($sql);
    return !empty($res);
  }

}
