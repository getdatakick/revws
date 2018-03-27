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

class FrontApp {
  private $module;

  public function __construct($module) {
    $this->module = $module;
  }

  public function getData($entityType, $entityId, $reviewProduct=null) {
    $entityId = (int)$entityId;
    $context = $this->getContext();
    $visitor = $this->getVisitor();
    $perms = $this->getPermissions();
    $set = $this->getSettings();
    $loginUrl;
    if ($entityType == 'product') {
      $products = [
        $entityId => self::getProductData($entityId, $this->getLanguage(), $this->getPermissions())
      ];
      $reviews = $this->getProductReviews($entityId);
      $canCreate = $products[$entityId]['canCreate'];
      $productsToReview = [];
      if (! $visitor->hasWrittenReview($entityId)) {
        $productsToReview[] = $entityId;
      }
      $loginUrl = $this->module->getLoginUrl($entityId);
    } else {
      $products = [];
      $reviews = $this->getCustomerReviews($entityId);
      $canCreate = false;
      $reviewedProducts = $visitor->getReviewedProducts();
      foreach ($reviewedProducts as $productId) {
        $productId = (int)$productId;
        if (! isset($products[$productId])) {
          $products[$productId] = self::getProductData($productId, $this->getLanguage(), $this->getPermissions());
        }
      }
      $productsToReview = $visitor->getProductsToReview();
      foreach ($productsToReview as $productId) {
        $productId = (int)$productId;
        if (! isset($products[$productId])) {
          $products[$productId] = self::getProductData($productId, $this->getLanguage(), $this->getPermissions());
        }
      }
      if ($reviewProduct) {
        $reviewProduct = (int)$reviewProduct;
        if (! isset($products[$reviewProduct])) {
          try {
            $products[$reviewProduct] = self::getProductData($reviewProduct, $this->getLanguage(), $this->getPermissions());
          } catch (Exception $ignore) {
          }
        }
      }
      $loginUrl = $this->module->getLoginUrl(null);
    }

    return [
      'shopName' => Configuration::get('PS_SHOP_NAME'),
      'translations' => $this->module->getFrontTranslations(),
      'entityType' => $entityType,
      'entityId' => $entityId,
      'products' => $products,
      'productsToReview' => $productsToReview,
      'reviews' => $reviews,
      'visitor' => [
        'type' => $visitor->getType(),
        'id' => $visitor->getId(),
        'firstName' => $visitor->getFirstName(),
        'lastName' => $visitor->getLastName(),
        'nameFormat' => $set->getNamePreference(),
        'email' => $visitor->getEmail()
      ],
      'api' => $context->link->getModuleLink('revws', 'api', [], true),
      'appJsUrl' => $set->getAppUrl($context, $this->module),
      'loginUrl' => $loginUrl,
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
        'displayCriteria' => $set->getDisplayCriteriaPreference()
      ],
      'canCreate' => $canCreate,
      'css' => $this->module->getCSSFile() . '?CACHE_CONTROL'
    ];
  }

  public function getShapeSettings() {
    return Shapes::getShape($this->getSettings()->getShape());
  }

  public function getProductReviews($productId) {
    $set = $this->getSettings();
    $perPage = $set->getReviewsPerPage();
    $order = $set->getReviewOrder();
    $reviews = RevwsReview::getByProduct($productId, $this->getVisitor(), $perPage, 0, $order);
    $reviews['reviews'] = RevwsReview::mapReviews($reviews['reviews'], $this->getPermissions());
    return $reviews;
  }

  public function getCustomerReviews($customerId) {
    $perPage = $this->getSettings()->getCustomerReviewsPerPage();
    $reviews = RevwsReview::getByCustomer($customerId, $perPage, 0);
    $reviews['reviews'] = RevwsReview::mapReviews($reviews['reviews'], $this->getPermissions());
    return $reviews;
  }

  public function getProduct($productId) {
    return [
      $productId => self::getProductData($productId, $this->getLanguage(), $this->getPermissions())
    ];
  }

  public static function getProductData($productId, $lang, Permissions $permissions) {
    $productId = (int)$productId;
    $lang = (int)$lang;
    $context = Context::getContext();
    $product = new Product($productId);
    if (! Validate::isLoadedObject($product)) {
      throw new Exception("Product $productId not found");
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
      'criteria' => RevwsCriterion::getByProduct($productId),
      'canCreate' => $permissions->canCreateReview($productId)
    ];
  }


  private function getLanguage() {
    return $this->getContext()->language->id;
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
