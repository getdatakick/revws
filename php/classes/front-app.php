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

use Configuration;
use Context;
use JsonSerializable;
use PrestaShopException;
use Product;
use Revws;
use RevwsCriterion;
use Validate;

class FrontApp implements JsonSerializable
{

    /**
     * @var Revws
     */
    private $module;

    /**
     * @var ReviewList[]
     */
    private $lists = [];

    /**
     * @var array
     */
    private $staticData = null;

    /**
     * @var array
     */
    private $visitorData = null;

    /**
     * @var
     */
    private $entities = null;

    /**
     * @var array
     */
    private $extraProducts = [];
    /**
     * @var array
     */
    private $initActions = [];
    /**
     * @var array
     */
    private $widgets = [];
    /**
     * @var int
     */
    private $customCount = 0;

    /**
     * FrontApp constructor.
     *
     * @param Revws $module
     */
    public function __construct($module)
    {
        $this->module = $module;
    }

    /**
     * @param array $action
     */
    public function addInitAction($action)
    {
        $this->initActions[] = $action;
    }

    /**
     * @param string $entityType
     * @param int $entityId
     * @param bool $microdata
     *
     * @return array
     * @throws PrestaShopException
     */
    public function addEntityListWidget($entityType, $entityId, $microdata)
    {
        $entityId = (int)$entityId;
        $id = strtolower($entityType) . '-reviews';
        $widget = $this->getWidget($id);
        if (!$widget) {
            $list = $this->getList($id);
            if (!$list) {
                $settings = $this->getSettings();
                $conditions = [
                    'entity' => [
                        'type' => $entityType,
                        'id' => $entityId
                    ]
                ];
                $pageSize = $this->getPageSize($id, $settings->getReviewsPerPage());
                $order = $settings->getReviewOrder();
                $page = $this->getPage($id, 0);
                $list = $this->addList(new ReviewList($this->module, $id, $conditions, $page, $pageSize, $order, 'desc'));
            }
            $widget = $this->addWidget($id, [
                'type' => 'entityList',
                'entityType' => $entityType,
                'entityId' => $entityId,
                'listId' => $list->getId(),
                'allowPaging' => true,
                'microdata' => $microdata
            ]);
        }
        return $widget;
    }

    /**
     * @param string $id
     *
     * @return array|null
     */
    public function getWidget($id)
    {
        return isset($this->widgets[$id]) ? $this->widgets[$id] : null;
    }

    /**
     * @param string $id
     *
     * @return ReviewList|null
     */
    public function getList($id)
    {
        return isset($this->lists[$id]) ? $this->lists[$id] : null;
    }

    /**
     * @return Settings
     * @throws PrestaShopException
     */
    private function getSettings()
    {
        return $this->module->getSettings();
    }

    /**
     * @param int $listId
     * @param int $default
     *
     * @return int
     */
    private function getPageSize($listId, $default)
    {
        return $this->getParameterValue($listId, 'page-size', $default);
    }

    /**
     * @param int $listId
     * @param string $name
     * @param int $default
     *
     * @return int
     */
    private function getParameterValue($listId, $name, $default)
    {
        $url = explode('?', $_SERVER['REQUEST_URI']);
        if (isset($url[1])) {
            $queryString = $url[1];
            parse_str($queryString, $queryStringParams);
            $id = "revws-$listId-$name";
            if (isset($queryStringParams[$id])) {
                return (int)$queryStringParams[$id];
            }
        }
        return $default;
    }

    /**
     * @param int $listId
     * @param int $default
     *
     * @return int
     */
    private function getPage($listId, $default)
    {
        return $this->getParameterValue($listId, 'page', ($default + 1)) - 1;
    }

    /**
     * @param ReviewList $list
     *
     * @return ReviewList
     * @throws PrestaShopException
     */
    private function addList($list)
    {
        $id = $list->getId();
        $this->lists[$id] = $list;
        if ($this->entities) {
            $this->entities = $this->loadEntities($this->entities);
        }
        return $list;
    }

    /**
     * @param int[] $entities
     *
     * @return array
     * @throws PrestaShopException
     */
    private function loadEntities($entities = null)
    {
        $products = is_null($entities) ? [] : $entities['product'];
        foreach ($this->lists as $list) {
            $products = $list->getProductEntities($products);
        }
        $visitorData = $this->getVisitorData();
        foreach ($visitorData['toReview']['product'] as $productId) {
            $productId = (int)$productId;
            if (!isset($products[$productId])) {
                $products[$productId] = self::getProductData($productId, $this->getLanguage(), $this->module->getPlatform());
            }
        }
        foreach ($this->extraProducts as $productId) {
            $productId = (int)$productId;
            if (!isset($products[$productId])) {
                $products[$productId] = self::getProductData($productId, $this->getLanguage(), $this->module->getPlatform());
            }
        }
        return [
            'product' => $products
        ];
    }

    /**
     * @return array
     * @throws PrestaShopException
     */
    public function getVisitorData()
    {
        if (is_null($this->visitorData)) {
            $settings = $this->getSettings();
            $visitor = $this->getVisitor();
            $this->visitorData = [
                'type' => $visitor->getType(),
                'id' => $visitor->getId(),
                'firstName' => $visitor->getFirstName(),
                'lastName' => $visitor->getLastName(),
                'pseudonym' => $visitor->getPseudonym(),
                'nameFormat' => $settings->getNamePreference(),
                'email' => $visitor->getEmail(),
                'language' => $visitor->getLanguage(),
                'toReview' => [
                    'product' => $visitor->getProductsToReview(),
                ],
                'reviewed' => [
                    'product' => $visitor->getReviewedProducts(),
                ]
            ];
        }
        return $this->visitorData;
    }

    /**
     * @return Visitor
     * @throws PrestaShopException
     */
    private function getVisitor()
    {
        return $this->module->getVisitor();
    }

    /**
     * @return int
     * @throws PrestaShopException
     */
    private function getLanguage()
    {
        return $this->getVisitor()->getLanguage();
    }

    /**
     * @param int $productId
     * @param int $lang
     * @param Platform $platform
     *
     * @return array
     * @throws PrestaShopException
     */
    public static function getProductData($productId, $lang, $platform)
    {
        $productId = (int)$productId;
        $lang = (int)$lang;
        $context = Context::getContext();
        $product = new Product($productId, false, $lang);
        if (!Validate::isLoadedObject($product)) {
            return [
                'id' => $productId,
                'name' => '',
                'url' => '',
                'image' => '',
                'criteria' => []
            ];
        }
        $productName = $product->name;
        $res = Product::getCover($productId, $context);
        $image = null;
        if ($res) {
            $imageId = (int)$res['id_image'];
            $rewrite = $product->link_rewrite;
            $image = $platform->getImageLink($imageId, $rewrite, 'home');
        }
        return [
            'id' => $productId,
            'name' => $productName,
            'url' => $product->getLink(),
            'image' => $image,
            'criteria' => RevwsCriterion::getByProduct($productId)
        ];
    }

    /**
     * @return Context
     */
    private function getContext()
    {
        return $this->module->getContext();
    }

    /**
     * @param int $id
     * @param array $widget
     *
     * @return array
     */
    public function addWidget($id, $widget)
    {
        $widget['id'] = $id;
        $this->widgets[$id] = $widget;
        return $widget;
    }

    /**
     * @return array
     * @throws PrestaShopException
     */
    public function addMyReviewsWidget()
    {
        $id = 'my-reviews';
        $widget = $this->getWidget($id);
        if (!$widget) {
            $customerId = $this->getVisitor()->getCustomerId();
            $list = $this->getList($id);
            if (!$list) {
                $settings = $this->getSettings();
                $conditions = [
                    'customer' => (int)$customerId,
                    'allLanguages' => true
                ];
                $pageSize = $this->getPageSize($id, $settings->getCustomerReviewsPerPage());
                $order = 'id';
                $page = $this->getPage($id, 0);
                $list = $this->addList(new ReviewList($this->module, $id, $conditions, $page, $pageSize, $order, 'desc'));
            }
            $widget = $this->addWidget($id, [
                'type' => 'myReviews',
                'customerId' => $customerId,
                'listId' => $list->getId()
            ]);
        }
        return $widget;
    }

    /**
     * @param int $id
     * @param array $conditions
     * @param array $preferences
     * @param int $pageSize
     * @param string $order
     * @param string $orderDir
     *
     * @return array
     * @throws PrestaShopException
     */
    public function addCustomListWidget($id, $conditions, $preferences = [], $pageSize = 5, $order = 'date', $orderDir = 'desc')
    {
        $widget = $this->getWidget($id);
        if (!$widget) {
            $list = $this->getList($id);
            if (!$list) {
                $page = $this->getPage($id, 0);
                $pageSize = $this->getPageSize($id, $pageSize);
                $list = $this->addList(new ReviewList($this->module, $id, $conditions, $page, $pageSize, $order, $orderDir));
                $this->customCount++;
            }
            $widget = $this->addWidget($id, array_merge([
                'type' => 'list',
                'listId' => $list->getId(),
                'reviewStyle' => 'item',
                'displayReply' => true,
                'displayCriteria' => $this->getSettings()->getDisplayCriteriaPreference(),
                'allowPaging' => true,
                'microdata' => false
            ], $preferences));
        }
        return $widget;
    }

    /**
     * @return array
     * @throws PrestaShopException
     */
    #[\ReturnTypeWillChange]
    public function jsonSerialize()
    {
        return [
            'visitor' => $this->getVisitorData(),
            'settings' => $this->getStaticData(),
            'reviews' => $this->getReviews(),
            'entities' => $this->getEntities(),
            'lists' => $this->getLists(),
            'widgets' => $this->widgets,
            'translations' => $this->module->getFrontTranslations(),
            'initActions' => $this->initActions
        ];
    }

    /**
     * @return array
     * @throws PrestaShopException
     */
    public function getStaticData()
    {
        if (is_null($this->staticData)) {
            $context = $this->getContext();
            $visitor = $this->getVisitor();
            $set = $this->getSettings();
            $gdpr = $this->module->getGDPR();

            $this->staticData = [
                'version' => $this->module->version,
                'api' => $context->link->getModuleLink('revws', 'api', [], true),
                'appJsUrl' => $set->getAppUrl($this->module),
                'loginUrl' => $this->module->getLoginUrl(),
                'csrf' => $this->module->csrf()->getToken(),
                'shopName' => Configuration::get('PS_SHOP_NAME'),
                'theme' => [
                    'shape' => $this->getShapeSettings(),
                    'shapeSize' => [
                        'product' => $set->getShapeSize(),
                        'list' => $set->getShapeSize(),
                        'create' => $set->getShapeSize() * 5
                    ]
                ],
                'dateFormat' => $context->language->date_format_lite,
                'criteria' => RevwsCriterion::getCriteria($this->getLanguage()),
                'preferences' => [
                    'allowEmptyTitle' => $set->allowEmptyTitle(),
                    'allowEmptyReviews' => $set->allowEmptyReviews(),
                    'allowReviewWithoutCriteria' => $set->allowReviewWithoutCriteria(),
                    'allowGuestReviews' => $set->allowGuestReviews(),
                    'allowImages' => $set->allowImages(),
                    'allowNewImages' => $set->allowNewImages(),
                    'allowMultipleReviews' => $set->allowMultipleReviews(),
                    'customerReviewsPerPage' => $set->getCustomerReviewsPerPage(),
                    'customerMaxRequests' => $set->getCustomerMaxRequests(),
                    'showSignInButton' => $set->showSignInButton(),
                    'placement' => $set->getPlacement(),
                    'displayCriteria' => $set->getDisplayCriteriaPreference(),
                    'microdata' => $set->emitRichSnippets()
                ],
                'gdpr' => [
                    'mode' => $set->getGDPRPreference(),
                    'active' => $gdpr->isEnabled($visitor),
                    'text' => $gdpr->getConsentMessage($visitor)
                ]
            ];
        }
        return $this->staticData;
    }

    /**
     * @return array
     * @throws PrestaShopException
     */
    public function getShapeSettings()
    {
        return Shapes::getShape($this->getSettings()->getShape());
    }

    /**
     * @return array
     * @throws PrestaShopException
     */
    public function getReviews()
    {
        $reviews = [];
        foreach ($this->lists as $list) {
            foreach ($list->getReviews() as $review) {
                $id = (int)$review['id'];
                if (!isset($reviews[$id])) {
                    $reviews[$id] = $review;
                }
            }
        }
        return $reviews;
    }

    /**
     * @return array
     * @throws PrestaShopException
     */
    public function getEntities()
    {
        if (is_null($this->entities)) {
            $this->entities = $this->loadEntities();
        }
        return $this->entities;
    }

    /**
     * @return array
     * @throws PrestaShopException
     */
    public function getLists()
    {
        $lists = [];
        foreach ($this->lists as $key => $list) {
            $data = $list->getData();
            $copy = $data;
            $copy['reviews'] = [];
            foreach ($data['reviews'] as $review) {
                $copy['reviews'][] = (int)$review['id'];
            }
            $lists[$key] = $copy;
        }
        return $lists;
    }

    /**
     * @param string $type
     * @param int $entityId
     *
     * @throws PrestaShopException
     */
    public function addEntity($type, $entityId)
    {
        if ($type == 'product') {
            $productId = (int)$entityId;
            $this->extraProducts[$productId] = $productId;
            if ($this->entities) {
                $this->entities = $this->loadEntities($this->entities);
            }
        }
    }

    /**
     * @return string
     */
    public function generateListId()
    {
        return 'custom-' . ($this->customCount + 1);
    }

}
