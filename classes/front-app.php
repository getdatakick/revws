<?php
/**
* Copyright (C) 2017 Petr Hucik <petr@getdatakick.com>
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
* @copyright 2018 Petr Hucik
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

  public function __construct($module) {
    $this->module = $module;
  }

  public function addList($type, $entity) {
    $id = "$type-$entity";
    $settings = $this->getSettings();
    if ($type === 'product') {
      $pageSize = $settings->getReviewsPerPage();
      $order = $settings->getReviewOrder();
    } else if ($type === 'customer') {
      $pageSize = $settings->getCustomerReviewsPerPage();
      $order = 'id';
    } else {
      throw new Exception("Invalid entity type $type");
    }
    $conditions = [ $type => (int)$entity ];
    $list = new ReviewList($this->module, $id, $conditions, 0, $pageSize, $order, 'desc');
    $this->lists[$id] = $list;
    if ($this->entities) {
      $this->entities = $this->loadEntities($this->entities);
    };
    return $list;
  }

  public function addInitAction($action) {
    $this->initActions[] = $action;
  }

  public function addWidget($widget) {
    $this->widgets[] = $widget;
  }

  public function addProductListWidget($productId) {
    $list = $this->addList('product', $productId);
    $this->addWidget([
      'type' => 'productList',
      'productId' => $productId,
      'listId' => $list->getId()
    ]);
    return $list;
  }

  public function addMyReviewsWidget() {
    $customerId = $this->getVisitor()->getCustomerId();
    $list = $this->addList('customer', $customerId);
    $this->addWidget([
      'type' => 'myReviews',
      'customerId' => $customerId,
      'listId' => $list->getId()
    ]);
    return $list;
  }

  public function jsonSerialize() {
    return [
      'visitor' => $this->getVisitorData(),
      'settings' => $this->getStaticData(),
      'reviews' => $this->getReviews(),
      'entities' => $this->getEntitites(),
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
        'productsToReview' => $visitor->getProductsToReview(),
        'reviewedProducts' => $visitor->getReviewedProducts(),
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
        'criteria' => RevwsCriterion::getCriteria($this->getLanguage()),
        'preferences' => [
          'allowEmptyReviews' => $set->allowEmptyReviews(),
          'allowReviewWithoutCriteria' => $set->allowReviewWithoutCriteria(),
          'allowGuestReviews' => $set->allowGuestReviews(),
          'customerReviewsPerPage' => $set->getCustomerReviewsPerPage(),
          'customerMaxRequests' => $set->getCustomerMaxRequests(),
          'showSignInButton' => $set->showSignInButton(),
          'placement' => $set->getPlacement(),
          'displayCriteria' => $set->getDisplayCriteriaPreference(),
          'microdata' => $set->emitRichSnippets()
        ],
        'gdpr' => [
          'mode' => $set->getGDPRPreference(),
          'active' => $gdpr->isEnabled(),
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

  public function getEntitites() {
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
    foreach ($visitorData['productsToReview'] as $productId) {
      $productId = (int)$productId;
      if (! isset($products[$productId])) {
        $products[$productId] = self::getProductData($productId, $this->getLanguage(), $this->getPermissions());
      }
    }
    foreach ($this->extraProducts as $productId) {
      $productId = (int)$productId;
      if (! isset($products[$productId])) {
        $products[$productId] = self::getProductData($productId, $this->getLanguage(), $this->getPermissions());
      }
    }
    return [
      'products' => $products
    ];
  }


  public function getShapeSettings() {
    return Shapes::getShape($this->getSettings()->getShape());
  }

  public static function getProductData($productId, $lang, Permissions $permissions) {
    $productId = (int)$productId;
    $lang = (int)$lang;
    $context = Context::getContext();
    $product = new Product($productId);
    if (! Validate::isLoadedObject($product)) {
      return [
        'id' => $productId,
        'name' => '',
        'url' => '',
        'image' => '',
        'criteria' => []
      ];
    }
    $productName = $product->name[$lang];
    $link = $context->link;
    $res = Product::getCover($productId, $context);
    $image = null;
    if ($res) {
      $imageId = (int)$res['id_image'];
      $rewrite = $product->link_rewrite[$lang];
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

}
