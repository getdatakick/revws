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
use JsonSerializable;
use PrestaShopException;
use Revws;
use RevwsReview;

class ReviewList implements JsonSerializable
{

    /** @var Revws */
    private $module;

    /**
     * @var int
     */
    private $id;

    /**
     * @var array
     */
    private $conditions;

    /**
     * @var int
     */
    private $page;

    /**
     * @var int
     */
    private $pageSize;

    /**
     * @var string
     */
    private $order;

    /**
     * @var string
     */
    private $orderDir;

    /**
     * @var array
     */
    private $list = null;

    /**
     * @param Revws $module
     * @param int $id
     * @param array $conditions
     * @param int $page
     * @param int $pageSize
     * @param string $order
     * @param string $orderDir
     */
    public function __construct($module, $id, $conditions, $page, $pageSize, $order, $orderDir)
    {
        $this->module = $module;
        $this->id = $id;
        $this->conditions = $conditions;
        $this->page = $page;
        $this->pageSize = $pageSize;
        $this->order = $order;
        $this->orderDir = $orderDir;
    }

    /**
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @return array
     * @throws PrestaShopException
     */
    #[\ReturnTypeWillChange]
    public function jsonSerialize()
    {
        return $this->getData();
    }

    /**
     * @return array
     * @throws PrestaShopException
     */
    public function getData()
    {
        $this->ensureLoaded();
        $list = $this->list;
        $list['id'] = $this->id;
        $list['conditions'] = $this->conditions;
        return $list;
    }

    /**
     * @return void
     * @throws PrestaShopException
     */
    private function ensureLoaded()
    {
        if (is_null($this->list)) {
            $settings = $this->module->getSettings();
            $visitor = $this->module->getVisitor();
            $permissions = $this->module->getPermissions();
            $options = array_merge($this->conditions, [
                'shop' => Context::getContext()->shop->id,
                'deleted' => false,
                'visitor' => $visitor,
                'validated' => true,
                'pageSize' => $this->pageSize,
                'page' => $this->page,
                'order' => [
                    'field' => $this->order,
                    'direction' => $this->orderDir
                ]
            ]);
            $list = RevwsReview::findReviews($settings, $options);
            $list['reviews'] = RevwsReview::mapReviews($list['reviews'], $permissions);
            $this->list = $list;
        }
    }

    /**
     * @return bool
     * @throws PrestaShopException
     */
    public function isEmpty()
    {
        $this->ensureLoaded();
        return $this->list['total'] == 0;
    }

    /**
     * @return int
     * @throws PrestaShopException
     */
    public function getTotal()
    {
        $this->ensureLoaded();
        return (int)$this->list['total'];
    }

    /**
     * @return array[]
     * @throws PrestaShopException
     */
    public function getEntities()
    {
        return [
            'product' => $this->getProductEntities()
        ];
    }

    /**
     * @param int[] $products
     *
     * @return array
     * @throws PrestaShopException
     */
    public function getProductEntities($products = [])
    {
        $reviews = $this->getReviews();
        $language = $this->module->getVisitor()->getLanguage();
        foreach ($reviews as $review) {
            if ($review['entityType'] === 'product') {
                $productId = (int)$review['entityId'];
                if (!isset($products[$productId])) {
                    $products[$productId] = FrontApp::getProductData($productId, $language, $this->module->getPlatform());
                }
            }
        }
        return $products;
    }

    /**
     * @return array[]
     * @throws PrestaShopException
     */
    public function getReviews()
    {
        $this->ensureLoaded();
        return $this->list['reviews'];
    }
}
