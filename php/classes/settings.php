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
use \Configuration;
use \Language;
use \Exception;

class Settings {
  const APP_URL = 'REVWS_APP_URL';
  const BACKEND_APP_URL = 'REVWS_BACK_APP_URL';
  const VERSION_URL = 'REVWS_VERSION_URL';
  const SALT = 'REVWS_SALT';
  const SETTINGS = 'REVWS_SETTINGS';
  const VERSION = 'REVWS_VERSION';
  const ACTIVATED = 'REVWS_ACTIVATED';
  const CHECK_VERSION = 'REVWS_CHECK_VERSION';

  private $data;

  public function __construct() {
    $this->data = self::getDefaultSettings();
    $stored = Configuration::getGlobalValue(self::SETTINGS);
    if ($stored) {
      $stored = json_decode($stored, true);
      if ($stored) {
        $this->data = self::mergeSettings($this->data, $stored);
      }
    }
  }

  private static function getDefaultSettings() {
    return [
      'general' => [
        'multilang' => true
      ],
      'theme' => [
        'shape' => Shapes::getDefaultShape(),
        'shapeSize' => [
          'product' => 16,
          'list' => 16,
          'create' => 80
        ],
        'colors' => [
          'fillColor' => '#ffd055',
          'borderColor' => '#ffd055',
          'fillColorOff' => 'transparent',
          'borderColorOff' => '#d5d5d5'
        ]
      ],
      'display' => [
        'product' => [
          'placement' => 'block',
          'reviewsPerPage' => 5,
          'orderBy' => 'date',
          'averagePlacement' => 'rightColumn',
          'hideEmptyReviews' => false,
          'showSignInButton' => true,
        ],
        'productList' => [
          'show' => true,
          'noReviews' => 'omit'
        ],
        'productComparison' => [
          'show' => true,
        ],
        'myReviews' => [
          'show' => true,
          'iconClass' => 'icon icon-star',
          'reviewsPerPage' => 5,
          'maxRequests' => 3
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
        'displayCriteria' => 'side'
      ],
      'notifications' => [
        'admin' => [
          'email' => Configuration::get('PS_SHOP_EMAIL'),
          'language' => (int)Configuration::get('PS_LANG_DEFAULT'),
          'reviewCreated' => false,
          'reviewUpdated' => false,
          'reviewDeleted' => false,
          'needApprove' => true,
        ],
        'author' => [
          'thankYou' => true,
          'reviewApproved' => true,
          'reviewDeleted' => true,
          'reply' => true
        ]
      ],
      'richSnippets' => [
        'enabled' => true
      ],
      'images' => [
        'enabled' => true,
        'allowNewImages' => true,
        'maxFileSize' => 3,
        'width' => 800,
        'height' => 800,
        'thumbWidth' => 100,
        'thumbHeight' => 100
      ],
      'gdpr' => [
        'implementation' => self::getDefaultGDPR(),
        'requiredForCustomers' => true
      ]
    ];
  }

  public function init() {
    return $this->set(self::getDefaultSettings());
  }

  public function reset() {
    return $this->remove() && $this->init();
  }

  public function getAppUrl($context, $module) {
    $url = Configuration::getGlobalValue(self::APP_URL);
    if (! $url) {
      $version = self::getUnderscoredVersion($module);
      $url = $module->getPath("/views/js/front-{$version}.js");
    }
    return $url;
  }

  public function getBackendAppUrl($module) {
    $url = Configuration::getGlobalValue(self::BACKEND_APP_URL);
    if (! $url) {
      $version = self::getUnderscoredVersion($module);
      $url = $module->getPath("views/js/back-{$version}.js");
    }
    return $url;
  }

  public function getVersionUrl() {
    $url = Configuration::getGlobalValue(self::VERSION_URL);
    return $url ? $url : 'https://version.getdatakick.com/version';
  }

  public function getSalt() {
    $salt = Configuration::getGlobalValue(self::SALT);
    if (! $salt) {
      $salt = Utils::getRandomData();
      Configuration::updateGlobalValue(self::SALT, $salt);
    }
    return $salt;
  }

  public function getVersion() {
    return Configuration::getGlobalValue(self::VERSION);
  }

  public function setVersion($version) {
    Configuration::updateGlobalValue(self::VERSION, $version);
    Configuration::deleteByName(self::CHECK_VERSION);
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

  public function allowImages() {
    return $this->toBool($this->get(['images', 'enabled']));
  }

  public function allowNewImages() {
    return $this->toBool($this->get(['images', 'allowNewImages']));
  }

  public function getMaxImageSize() {
    return 1.0 * $this->get(['images', 'maxFileSize']);
  }

  public function getImageWidth() {
    return 1.0 * $this->get(['images', 'width']);
  }

  public function getImageHeight() {
    return 1.0 * $this->get(['images', 'height']);
  }

  public function getImageThumbnailWidth() {
    return 1.0 * $this->get(['images', 'thumbWidth']);
  }

  public function getImageThumbnailHeight() {
    return 1.0 * $this->get(['images', 'thumbHeight']);
  }

  public function getAveragePlacement() {
    return $this->toAveragePlacement($this->get(['display', 'product', 'averagePlacement']));
  }

  public function getReviewsPerPage() {
    $ret = (int)$this->get(['display', 'product', 'reviewsPerPage']);
    return $ret === 0 ? 5 : $ret;
  }

  public function showOnProductListing() {
    return $this->toBool($this->get(['display', 'productList', 'show']));
  }

  public function productListNoReviewsBehavior() {
    if ($this->showOnProductListing()) {
      $val = $this->get(['display', 'productList', 'noReviews']);
      if ($val === 'hide' || $val === 'omit' || $val === 'show') {
        return $val;
      }
    }
    return 'omit';
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

  public function usePseudonym() {
    $namePref = $this->getNamePreference();
    return ($namePref === 'pseudonym' || $namePref === 'custom');
  }

  public function getReviewOrder() {
    return $this->toOrderByPreference($this->get(['display', 'product', 'orderBy']));
  }

  public function showSignInButton() {
    return $this->get(['display', 'product', 'showSignInButton']);
  }

  public function hideEmptyReviews() {
    return $this->get(['display', 'product', 'hideEmptyReviews']);
  }

  public function getShape() {
    return $this->toShape($this->get(['theme', 'shape']));
  }

  public function getShapeSize($type='product') {
    return $this->validShapeSize($this->get(['theme', 'shapeSize', $type]));
  }

  public function showOnCustomerAccount() {
    return $this->toBool($this->get(['display', 'myReviews', 'show']));
  }

  public function getCustomerAccountIcon() {
    return $this->get(['display', 'myReviews', 'iconClass']);
  }

  public function getCustomerReviewsPerPage() {
    $ret = (int)$this->get(['display', 'myReviews', 'reviewsPerPage']);
    return $ret === 0 ? 5 : $ret;
  }

  public function getCustomerMaxRequests() {
    $ret = (int)$this->get(['display', 'myReviews', 'maxRequests']);
    return $ret === 0 ? 3 : $ret;
  }

  public function filterByLanguage() {
    return $this->toBool($this->get(['general', 'multilang']));
  }

  public function getAdminEmailLanguage() {
    return (int)$this->get(['notifications', 'admin', 'language']);
  }

  public function getAdminEmail() {
    return $this->get(['notifications', 'admin', 'email']);
  }

  public function emailAdminReviewNeedsApproval() {
    return $this->get(['notifications', 'admin', 'needApprove']);
  }

  public function emailAdminReviewCreated() {
    return $this->get(['notifications', 'admin', 'reviewCreated']);
  }

  public function emailAdminReviewUpdated() {
    return $this->get(['notifications', 'admin', 'reviewUpdated']);
  }

  public function emailAdminReviewDeleted() {
    return $this->get(['notifications', 'admin', 'reviewDeleted']);
  }

  public function emailAuthorThankYou() {
    return $this->get(['notifications', 'author', 'thankYou']);
  }

  public function emailAuthorReviewApproved() {
    return $this->get(['notifications', 'author', 'reviewApproved']);
  }

  public function emailAuthorReviewDeleted() {
    return $this->get(['notifications', 'author', 'reviewDeleted']);
  }

  public function emailAuthorNotifyOnReply() {
    return $this->get(['notifications', 'author', 'reply']);
  }

  public function emitRichSnippets() {
    return (bool)$this->get(['richSnippets', 'enabled']);
  }

  public function getShapeColors() {
    return $this->get(['theme', 'colors']);
  }

  public function getDisplayCriteriaPreference() {
    $ret = $this->get(['review', 'displayCriteria']);
    return $this->toDisplayCriteria($ret);
  }

  public function getCheckModuleVersion() {
    $ret = Configuration::getGlobalValue(self::CHECK_VERSION);
    if ($ret) {
      return json_decode($ret, true);
    }
    return [ 'ts' => null, 'version' => null, 'notes' => null, 'paid' => null ];
  }

  public function isActivated() {
    if (Configuration::getGlobalValue(self::VERSION_URL)) {
      return true;
    }
    return Configuration::getGlobalValue(self::ACTIVATED) == 'free';
  }

  public function setActivated() {
    Configuration::updateGlobalValue(self::ACTIVATED, 'free');
  }

  public function setCheckModuleVersion($version, $ts, $notes, $paid) {
    Configuration::updateGlobalValue(self::CHECK_VERSION, json_encode([
      'ts' => $ts,
      'version' => $version,
      'notes' => $notes,
      'paid' => $paid
    ]));
  }

  public function getGDPRPreference() {
    $ret = $this->get(['gdpr', 'implementation']);
    if ($ret === 'basic') {
      return $ret;
    }
    if ($ret === 'psgdpr' && PrestashopGDRP::isAvailable()) {
      return $ret;
    }
    return 'none';
  }

  public function isConsentRequiredForCustomers() {
    return $this->get(['gdpr', 'requiredForCustomers']);
  }

  public function getGDPRConsentMessage() {
    return $this->get(['gdpr', 'message']);
  }

  private function toBool($val) {
    return !!$val;
  }

  private function toDisplayCriteria($in) {
    if (in_array($in, ['none', 'inline', 'side'])) {
      return $in;
    }
    return 'none';
  }

  private function toPlacement($placement) {
    return $placement === 'tab' ? 'tab' : 'block';
  }

  private function toAveragePlacement($placement) {
    if (in_array($placement, ['rightColumn', 'buttons', 'none'])) {
      return $placement;
    }
    return 'extra';
  }

  private function toShape($shape) {
    if (Shapes::hasShape($shape)) {
      return $shape;
    }
    return Shapes::getDefaultShape();
  }

  private function toNamePreference($pref) {
    if (in_array($pref, ['fullName', 'firstName', 'lastName', 'initials', 'initialLastName', 'pseudonym', 'custom'])) {
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
    $this->data = null;
    Configuration::deleteByName(self::CHECK_VERSION);
    Configuration::deleteByName(self::SETTINGS);
    Configuration::deleteByName(self::ACTIVATED);
    Configuration::deleteByName(self::VERSION);
    return true;
  }

  public function get($path=null) {
    $value = $this->data;
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
    $this->data = $value;
    return Configuration::updateGlobalValue(self::SETTINGS, json_encode($value));
  }

  private static function getDefaultGDPR() {
    if (PrestashopGDRP::isAvailable()) {
      return 'psgdpr';
    }
    return 'basic';
  }

  private static function getUnderscoredVersion($module) {
    return str_replace('.', '_', $module->version);
  }
}
