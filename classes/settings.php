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

class Settings {
  const APP_URL = 'REVWS_APP_URL';
  const PLACEMENT = 'REVWS_PLACEMENT';
  const ALLOW_GUEST_REVIEWS = 'REVWS_ALLOW_GUEST_REVIEWS';
  const DISPLAY_NAME_PREFERENCE = 'REVWS_DISPLAY_NAME_PREFERENCE';
  const VOTING_ALLOWED = 'REVWS_VOTING_ALLOWED';
  const REPORTING_ALLOWED = 'REVWS_REPORTING_ALLOWED';
  const DELETE_ALLOWED = 'REVWS_DELETE_ALLOWED';
  const EDIT_ALLOWED = 'REVWS_EDIT_ALLOWED';
  const SHOW_AVERAGE_ON_PRODUCT_PAGE = 'REVWS_SHOW_AVERAGE_ON_PRODUCT_PAGE';
  const SHOW_ON_PRODUCT_LISTING = 'REVWS_SHOW_ON_PRODUCT_LISTING';
  const SHOW_ON_PRODUCT_COMPARISON = 'REVWS_SHOW_ON_PRODUCT_COMPARISON';
  const SHAPE_PREFERENCE = 'REVWS_SHAPE';
  const SHAPE_SIZE = 'REVWS_SHAPE_SIZE';
  const ALLOW_EMPTY_REVIEWS = 'REVWS_ALLOW_EMPTY_REVIEWS';

  public function init() {
    $this->setPlacement('block');
    $this->setAllowGuestReviews(true);
    $this->setDisplayNamePreference('fullName');
    $this->setVotingAllowed(true);
    $this->setReportingAllowed(true);
    $this->setDeleteAllowed(true);
    $this->setEditAllowed(true);
    $this->setShowAverageOnProductPage(true);
    $this->setShowOnProductListing(true);
    $this->setShowOnProductComparison(true);
    $this->setAllowEmptyReviews(true);
    $this->setShape(Shapes::getDefaultShape());
    $this->setShapeSize(16);
    return true;
  }

  public function reset() {
    $this->remove(self::PLACEMENT);
    $this->remove(self::ALLOW_GUEST_REVIEWS);
    $this->remove(self::DISPLAY_NAME_PREFERENCE);
    $this->remove(self::VOTING_ALLOWED);
    $this->remove(self::REPORTING_ALLOWED);
    $this->remove(self::DELETE_ALLOWED);
    $this->remove(self::EDIT_ALLOWED);
    $this->remove(self::SHOW_AVERAGE_ON_PRODUCT_PAGE);
    $this->remove(self::SHOW_ON_PRODUCT_LISTING);
    $this->remove(self::SHOW_ON_PRODUCT_COMPARISON);
    $this->remove(self::SHAPE_PREFERENCE);
    $this->remove(self::SHAPE_SIZE);
    $this->remove(self::ALLOW_EMPTY_REVIEWS);
    return true;
  }

  public function getAppUrl($context, $moduleName) {
    $url = $this->get(self::APP_URL);
    if (! $url) {
      $url = $context->shop->getBaseURI() . "modules/{$moduleName}/views/js/front_app.js";
    }
    return $url;
  }

  public function getPlacement() {
    return $this->toPlacement($this->get(self::PLACEMENT));
  }

  public function setPlacement($placement) {
    $this->set(self::PLACEMENT, $this->toPlacement($placement));
  }

  public function allowGuestReviews() {
    return $this->toBool($this->get(self::ALLOW_GUEST_REVIEWS));
  }

  public function setAllowGuestReviews($allow) {
    return $this->set(self::ALLOW_GUEST_REVIEWS, $allow ? 1 : 0);
  }

  public function isReportingAllowed() {
    return $this->toBool($this->get(self::REPORTING_ALLOWED));
  }

  public function setReportingAllowed($allow) {
    return $this->set(self::REPORTING_ALLOWED, $allow ? 1 : 0);
  }

  public function isVotingAllowed() {
    return $this->toBool($this->get(self::VOTING_ALLOWED));
  }

  public function setVotingAllowed($allow) {
    return $this->set(self::VOTING_ALLOWED, $allow ? 1 : 0);
  }

  public function isDeleteAllowed() {
    return $this->toBool($this->get(self::DELETE_ALLOWED));
  }

  public function setDeleteAllowed($allow) {
    return $this->set(self::DELETE_ALLOWED, $allow ? 1 : 0);
  }

  public function isEditAllowed() {
    return $this->toBool($this->get(self::EDIT_ALLOWED));
  }

  public function setEditAllowed($allow) {
    return $this->set(self::EDIT_ALLOWED, $allow ? 1 : 0);
  }

  public function showAverageOnProductPage() {
    return $this->toBool($this->get(self::SHOW_AVERAGE_ON_PRODUCT_PAGE));
  }

  public function setShowAverageOnProductPage($allow) {
    return $this->set(self::SHOW_AVERAGE_ON_PRODUCT_PAGE, $allow ? 1 : 0);
  }

  public function showOnProductListing() {
    return $this->toBool($this->get(self::SHOW_ON_PRODUCT_LISTING));
  }

  public function setShowOnProductListing($allow) {
    return $this->set(self::SHOW_ON_PRODUCT_LISTING, $allow ? 1 : 0);
  }

  public function allowEmptyReviews() {
    return $this->toBool($this->get(self::ALLOW_EMPTY_REVIEWS));
  }

  public function setAllowEmptyReviews($allow) {
    return $this->set(self::ALLOW_EMPTY_REVIEWS, $allow ? 1 : 0);
  }

  public function showOnProductComparison() {
    return $this->toBool($this->get(self::SHOW_ON_PRODUCT_COMPARISON));
  }

  public function setShowOnProductComparison($allow) {
    return $this->set(self::SHOW_ON_PRODUCT_COMPARISON, $allow ? 1 : 0);
  }

  public function getNamePreference() {
    return $this->toNamePreference($this->get(self::DISPLAY_NAME_PREFERENCE));
  }

  public function setDisplayNamePreference($pref) {
    $this->set(self::DISPLAY_NAME_PREFERENCE, $this->toNamePreference($pref));
  }

  public function getShape() {
    return $this->toShape($this->get(self::SHAPE_PREFERENCE));
  }

  public function setShape($shape) {
    $this->set(self::SHAPE_PREFERENCE, $this->toShape($shape));
  }

  public function getShapeSize() {
    return $this->validShapeSize($this->get(self::SHAPE_SIZE));
  }

  public function setShapeSize($size) {
    $this->set(self::SHAPE_SIZE, $this->validShapeSize($size));
  }

  private function remove($key) {
    Configuration::deleteByName($this->getKey($key));
  }

  private function get($key) {
    return Configuration::get($this->getKey($key));
  }

  private function set($key, $value) {
    return Configuration::updateValue($this->getKey($key), $value);
  }

  private function getKey($key) {
    return $key;
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
}
