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

use \Context;
use \Configuration;
use \RevwsReview;
use \RevwsCriterion;
use \Product;
use \Validate;
use \Exception;
use \ImageType;
use \JsonSerializable;

class FrontApp implements JsonSerializable {
  private $module;
  private $lists = [];
  private $staticData = null;
  private $visitorData = null;
  private $entities = null;
  private $extraProducts = [];
  private $initActions = [];
  private $widgets = [];
  private $customCount = 0;

  public function __construct($module) {
    $this->module = $module;
  }

  public function addInitAction($action) {
    $this->initActions[] = $action;
  }

  public function addWidget($widget) {
    $this->widgets[] = $widget;
  }

  public function addEntityListWidget($entityType, $entityId) {
    $entityId = (int)$entityId;
    $id = strtolower($entityType) . '-reviews';
    $list = $this->getList($id);
    if (! $list) {
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
      $this->addWidget([
        'type' => 'entityList',
        'entityType' => $entityType,
        'entityId' => $entityId,
        'listId' => $list->getId()
      ]);
    }
    return $list;
  }

  public function addMyReviewsWidget() {
    $id = 'my-reviews';
    $list = $this->getList($id);
    if (! $list) {
      $customerId = $this->getVisitor()->getCustomerId();
      $settings = $this->getSettings();
      $conditions = [ 'customer' => (int)$customerId ];
      $pageSize = $this->getPageSize($id, $settings->getCustomerReviewsPerPage());
      $order = 'id';
      $page = $this->getPage($id, 0);
      $list = $this->addList(new ReviewList($this->module, $id, $conditions, $page, $pageSize, $order, 'desc'));
      $this->addWidget([
        'type' => 'myReviews',
        'customerId' => $customerId,
        'listId' => $list->getId()
      ]);
    }
    return $list;
  }

  public function addCustomListWidget($id, $conditions, $preferences=[], $pageSize=5, $order='date', $orderDir='desc') {
    $list = $this->getList($id);
    if (! $list) {
      $page = $this->getPage($id, 0);
      $pageSize = $this->getPageSize($id, $pageSize);
      $list = $this->addList(new ReviewList($this->module, $id, $conditions, $page, $pageSize, $order, $orderDir));
      $this->customCount++;
      $this->addWidget(array_merge([
        'type' => 'list',
        'listId' => $list->getId(),
        'reviewStyle' => 'item',
        'displayReply' => true,
        'displayCriteria' => $this->getSettings()->getDisplayCriteriaPreference(),
        'allowPaging' => true
      ], $preferences));
    }
    return $list;
  }

  public function jsonSerialize() {
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

  public function getVisitorData() {
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

  public function getStaticData() {
    if (is_null($this->staticData)) {
      $context = $this->getContext();
      $visitor = $this->getVisitor();
      $perms = $this->getPermissions();
      $set = $this->getSettings();
      $gdpr = $this->module->getGDPR();

      $this->staticData = [
        'version' => $this->module->version,
        'api' => $context->link->getModuleLink('revws', 'api', [], true),
        'appJsUrl' => $set->getAppUrl($context, $this->module),
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
          'allowEmptyReviews' => $set->allowEmptyReviews(),
          'allowReviewWithoutCriteria' => $set->allowReviewWithoutCriteria(),
          'allowGuestReviews' => $set->allowGuestReviews(),
          'allowImages' => $set->allowImages(),
          'allowNewImages' => $set->allowNewImages(),
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

  public function addEntity($type, $entityId) {
    if ($type == 'product') {
      $productId = (int)$entityId;
      $this->extraProducts[$productId] = $productId;
      if ($this->entities) {
        $this->entities = $this->loadEntities($this->entities);
      }
    }
  }

  public function getReviews() {
    $reviews = [];
    foreach ($this->lists as $list) {
      foreach ($list->getReviews() as $review) {
        $id = (int)$review['id'];
        if (! isset($reviews[$id])) {
          $reviews[$id] = $review;
        }
      }
    }
    return $reviews;
  }

  public function getLists() {
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

  public function getList($id) {
    return isset($this->lists[$id]) ? $this->lists[$id] : null;
  }

  public function getEntities() {
    if (is_null($this->entities)) {
      $this->entities = $this->loadEntities();
    }
    return $this->entities;
  }

  private function loadEntities($entities=null) {
    $products = is_null($entities) ? [] : $entities['products'];
    foreach ($this->lists as $list) {
      $products = $list->getProductEntities($products);
    }
    $visitorData = $this->getVisitorData();
    foreach ($visitorData['toReview']['product'] as $productId) {
      $productId = (int)$productId;
      if (! isset($products[$productId])) {
        $products[$productId] = self::getProductData($productId, $this->getLanguage());
      }
    }
    foreach ($this->extraProducts as $productId) {
      $productId = (int)$productId;
      if (! isset($products[$productId])) {
        $products[$productId] = self::getProductData($productId, $this->getLanguage());
      }
    }
    return [
      'product' => $products
    ];
  }


  public function getShapeSettings() {
    return Shapes::getShape($this->getSettings()->getShape());
  }

  public static function getProductData($productId, $lang) {
    $productId = (int)$productId;
    $lang = (int)$lang;
    $context = Context::getContext();
    $product = new Product($productId, false, $lang);
    if (! Validate::isLoadedObject($product)) {
      return [
        'id' => $productId,
        'name' => '',
        'url' => '',
        'image' => '',
        'criteria' => []
      ];
    }
    $productName = $product->name;
    $link = $context->link;
    $res = Product::getCover($productId, $context);
    $image = null;
    if ($res) {
      $imageId = (int)$res['id_image'];
      $rewrite = $product->link_rewrite;
      $image = $link->getImageLink($rewrite, $imageId, ImageType::getFormatedName('home'));
    }
    return [
      'id' => $productId,
      'name' => $productName,
      'url' => $product->getLink(),
      'image' => $image,
      'criteria' => RevwsCriterion::getByProduct($productId)
    ];
  }

  public function generateListId() {
    return 'custom-' . ($this->customCount + 1);
  }

  private function getLanguage() {
    return $this->getVisitor()->getLanguage();
  }

  private function getVisitor() {
    return $this->module->getVisitor();
  }

  private function getPermissions() {
    return $this->module->getPermissions();
  }

  private function getSettings() {
    return $this->module->getSettings();
  }

  private function getContext() {
    return $this->module->getContext();
  }

  private function addList($list) {
    $id = $list->getId();
    $this->lists[$id] = $list;
    if ($this->entities) {
      $this->entities = $this->loadEntities($this->entities);
    };
    return $list;
  }

  private function getPageSize($listId, $default) {
    return $this->getParameterValue($listId, 'page-size', $default);
  }

  private function getPage($listId, $default) {
    return $this->getParameterValue($listId, 'page', ($default+1)) - 1;
  }

  private function getParameterValue($listId, $name, $default) {
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

}
