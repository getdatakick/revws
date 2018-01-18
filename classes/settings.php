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
use \Configuration;
use \Exception;

class Settings {
  const APP_URL = 'REVWS_APP_URL';
  const BACKEND_APP_URL = 'REVWS_BACK_APP_URL';
  const SETTINGS = 'REVWS_SETTINGS';

  private static function getDefaultSettings() {
    return [
      'theme' => [
        'shape' => Shapes::getDefaultShape(),
        'shapeSize' => [
          'product' => 16,
          'list' => 16,
          'create' => 80
        ]
      ],
      'display' => [
        'product' => [
          'placement' => 'block',
          'reviewsPerPage' => 5,
          'orderBy' => 'date',
          'showAverage' => true,
        ],
        'productList' => [
          'show' => true,
        ],
        'productComparison' => [
          'show' => true,
        ]
      ],
      'moderation' => [
        'enabled' => true,
        'needApprove' => [
          'create' => true,
          'edit' => true,
          'reported' => false,
        ]
      ],
      'review' => [
        'displayName' => 'fullName',
        'allowGuestReviews' => true,
        'allowReviewWithoutCriteria' => false,
        'allowEmpty' => true,
        'allowDelete' => true,
        'allowEdit' => true,
        'allowVoting' => true,
        'allowReporting' => true,
      ]
    ];
  }

  public function init() {
    return $this->set(self::getDefaultSettings());
  }

  public function reset() {
    return $this->remove && $this->init();
  }

  public function getAppUrl($context, $moduleName) {
    $url = Configuration::get(self::APP_URL);
    if (! $url) {
      $url = $context->shop->getBaseURI() . "modules/{$moduleName}/views/js/front_app.js";
    }
    return $url;
  }

  public function getBackendAppUrl($moduleName) {
    $url = Configuration::get(self::BACKEND_APP_URL);
    if (! $url) {
      $url = _PS_MODULE_DIR_ . $moduleName . '/views/js/back_app.js';
    }
    return $url;
  }

  public function getPlacement() {
    return $this->toPlacement($this->get(['display', 'product', 'placement']));
  }

  public function allowGuestReviews() {
    return $this->toBool($this->get(['review', 'allowGuestReviews']));
  }

  public function allowReviewWithoutCriteria() {
    return $this->toBool($this->get(['review', 'allowReviewWithoutCriteria']));
  }

  public function isReportingAllowed() {
    return $this->toBool($this->get(['review', 'allowReporting']));
  }

  public function isVotingAllowed() {
    return $this->toBool($this->get(['review', 'allowVoting']));
  }

  public function isDeleteAllowed() {
    return $this->toBool($this->get(['review', 'allowDelete']));
  }

  public function isEditAllowed() {
    return $this->toBool($this->get(['review', 'allowEdit']));
  }

  public function showAverageOnProductPage() {
    return $this->toBool($this->get(['display', 'product', 'showAverage']));
  }

  public function getReviewsPerPage() {
    $ret = (int)$this->get(['display', 'product', 'reviewsPerPage']);
    return $ret === 0 ? 5 : $ret;
  }

  public function showOnProductListing() {
    return $this->toBool($this->get(['display', 'productList', 'show']));
  }

  public function moderationEnabled() {
    return $this->toBool($this->get(['moderation', 'enabled']));
  }

  public function validateNewReviews() {
    return $this->moderationEnabled() && $this->toBool($this->get(['moderation', 'needApprove', 'create']));
  }

  public function validateUpdatedReviews() {
    return $this->moderationEnabled() && $this->toBool($this->get(['moderation', 'needApprove', 'edit']));
  }

  public function validateReportedReviews() {
    return $this->moderationEnabled() && $this->toBool($this->get(['moderation', 'needApprove', 'reported']));
  }

  public function allowEmptyReviews() {
    return $this->toBool($this->get(['review', 'allowEmpty']));
  }

  public function showOnProductComparison() {
    return $this->toBool($this->get(['display', 'productComparison', 'show']));
  }

  public function getNamePreference() {
    return $this->toNamePreference($this->get(['review', 'displayName']));
  }

  public function getReviewOrder() {
    return $this->toOrderByPreference($this->get(['display', 'product', 'orderBy']));
  }

  public function getShape() {
    return $this->toShape($this->get(['theme', 'shape']));
  }

  public function getShapeSize($type='product') {
    return $this->validShapeSize($this->get(['theme', 'shapeSize', $type]));
  }

  private function toBool($val) {
    return !!$val;
  }

  private function toPlacement($placement) {
    return $placement === 'tab' ? 'tab' : 'block';
  }

  private function toShape($shape) {
    if (Shapes::hasShape($shape)) {
      return $shape;
    }
    return Shapes::getDefaultShape();
  }

  private function toNamePreference($pref) {
    if (in_array($pref, ['fullName', 'firstName', 'lastName', 'initials', 'initialLastName'])) {
      return $pref;
    }
    return 'fullName';
  }

  private function toOrderByPreference($pref) {
    if (in_array($pref, ['date', 'grade', 'usefulness'])) {
      return $pref;
    }
    return 'date';
  }

  private function validShapeSize($size) {
    $ret = (int)$size;
    if ($ret < 8) {
      return 8;
    }
    if ($ret > 64) {
      return 64;
    }
    return $ret;
  }

  public function remove() {
    return Configuration::deleteByName(self::SETTINGS);
  }

  public function get($path=null) {
    $value = self::getDefaultSettings();
    $stored = Configuration::get(self::SETTINGS);
    if ($stored) {
      $stored = json_decode($stored, true);
      if ($stored) {
        $value = self::mergeSettings($value, $stored);
      }
    }
    if (is_null($path)) {
      return $value;
    }
    foreach ($path as $key) {
      if (isset($value[$key])) {
        $value = $value[$key];
      } else {
        die('Revws: setting not found: '.implode($path, '>'));
      }
    }
    return $value;
  }

  private static function mergeSettings($left, $right) {
    $ret = [];
    foreach ($left as $key => $value) {
      if (isset($right[$key])) {
        if (is_array($value)) {
          $value = self::mergeSettings($value, $right[$key]);
        } else {
          $value = $right[$key];
        }
      }
      $ret[$key] = $value;
    }
    return $ret;
  }

  public function set($value) {
    return Configuration::updateValue(self::SETTINGS, json_encode($value));
  }
}
