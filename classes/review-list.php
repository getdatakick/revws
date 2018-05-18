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

use \RevwsReview;
use \JsonSerializable;

class ReviewList implements JsonSerializable {
  private $entityType;
  private $entityId;
  private $list = null;

  public function __construct($module, $entityType, $entityId) {
    $this->module = $module;
    $this->entityType = $entityType;
    $this->entityId = $entityId;
  }

  public function jsonSerialize() {
    return $this->getData();
  }

  public function isEmpty() {
    $this->ensureLoaded();
    return $this->list['total'] == 0;
  }

  public function getReviews() {
    $this->ensureLoaded();
    return $this->list['reviews'];
  }

  public function getData() {
    $this->ensureLoaded();
    return $this->list;
  }

  private function ensureLoaded() {
    if (is_null($this->list)) {
      if ($this->entityType == 'product') {
        $this->list = self::getProductReviews($this->module, $this->entityId);
      } else {
        $this->list = self::getCustomerReviews($this->module, $this->entityId);
      }
    }
  }

  private static function getProductReviews($module, $productId) {
    $settings = $module->getSettings();
    $visitor = $module->getVisitor();
    $permissions = $module->getPermissions();
    $perPage = $settings->getReviewsPerPage();
    $order = $settings->getReviewOrder();
    $list = RevwsReview::getByProduct($productId, $settings, $visitor, $perPage, 0, $order);
    $list['reviews'] = RevwsReview::mapReviews($list['reviews'], $permissions);
    return $list;
  }

  private static function getCustomerReviews($module, $customerId) {
    $settings = $module->getSettings();
    $visitor = $module->getVisitor();
    $permissions = $module->getPermissions();
    $perPage = $settings->getCustomerReviewsPerPage();
    $list = RevwsReview::getByCustomer($customerId, $settings, $perPage, 0);
    $list['reviews'] = RevwsReview::mapReviews($list['reviews'], $permissions);
    return $list;
  }

}
