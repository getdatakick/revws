<?php
/**
* Copyright (C) 2017-2019 Petr Hucik <petr@getdatakick.com>
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
* @copyright 2017-2019 Petr Hucik
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*/

namespace Revws;

use Configuration;
use Exception;
use DateTime;
use DateInterval;
use Db;
use DbQuery;
use PrestaShopException;
use Revws;

class Settings {
  const APP_URL = 'REVWS_APP_URL';
  const BACKEND_APP_URL = 'REVWS_BACK_APP_URL';
  const VERSION_URL = 'REVWS_VERSION_URL';
  const SALT = 'REVWS_SALT';
  const SETTINGS = 'REVWS_SETTINGS';
  const VERSION = 'REVWS_VERSION';
  const ACTIVATED = 'REVWS_ACTIVE';
  const REVIEWED = 'REVWS_REVIEWED';
  const CHECK_VERSION = 'REVWS_CHECK_VERSION';

  private $data;

  /**
   * Settings constructor.
   * @throws PrestaShopException
   */
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

  /**
   * @return array
   * @throws PrestaShopException
   */
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
        ],
        'allReviews' => [
          'reviewsPerPage' => 10
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
        'allowEmptyTitle' => false,
        'allowDelete' => true,
        'allowEdit' => true,
        'allowVoting' => true,
        'allowReporting' => true,
        'displayCriteria' => 'side',
        'allowMultipleReviews' => false,
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

  /**
   * @return bool
   * @throws PrestaShopException
   */
  public function init() {
    static::getInstallationDate();
    return $this->set(self::getDefaultSettings());
  }

  /**
   * @return bool
   * @throws PrestaShopException
   */
  public function reset() {
    return $this->remove() && $this->init();
  }

  /**
   * @param Revws $module
   * @return string
   */
  public function getAppUrl($module) {
    $url = Configuration::getGlobalValue(self::APP_URL);
    if (! $url) {
      $version = self::getUnderscoredVersion($module);
      $url = $module->getPath("/views/js/front-{$version}.js");
    }
    return $url;
  }

  /**
   * @param Revws $module
   * @return string
   */
  public function getBackendAppUrl($module) {
    $url = Configuration::getGlobalValue(self::BACKEND_APP_URL);
    if (! $url) {
      $version = self::getUnderscoredVersion($module);
      $url = $module->getPath("views/js/back-{$version}.js");
    }
    return $url;
  }

  /**
   * @return string|null
   */
  public function getVersionUrl() {
    $url = Configuration::getGlobalValue(self::VERSION_URL);
    return $url ? $url : null;
  }

  /**
   * @return string
   * @throws PrestaShopException
   */
  public function getSalt() {
    $salt = Configuration::getGlobalValue(self::SALT);
    if (! $salt) {
      $salt = Utils::getRandomData();
      Configuration::updateGlobalValue(self::SALT, $salt);
    }
    return $salt;
  }

  /**
   * @return string
   */
  public function getVersion() {
    return Configuration::getGlobalValue(self::VERSION);
  }

  /**
   * @param $version
   * @throws \PrestaShopDatabaseException
   * @throws PrestaShopException
   */
  public function setVersion($version) {
    Configuration::updateGlobalValue(self::VERSION, $version);
    Configuration::deleteByName(self::CHECK_VERSION);
  }

  /**
   * @return string
   */
  public function getPlacement() {
    return $this->toPlacement($this->get(['display', 'product', 'placement']));
  }

  /**
   * @return bool
   */
  public function allowGuestReviews() {
    return $this->toBool($this->get(['review', 'allowGuestReviews']));
  }

  /**
   * @return bool
   */
  public function allowReviewWithoutCriteria() {
    return $this->toBool($this->get(['review', 'allowReviewWithoutCriteria']));
  }

  /**
   * @return bool
   */
  public function isReportingAllowed() {
    return $this->toBool($this->get(['review', 'allowReporting']));
  }

  /**
   * @return bool
   */
  public function isVotingAllowed() {
    return $this->toBool($this->get(['review', 'allowVoting']));
  }

  /**
   * @return bool
   */
  public function isDeleteAllowed() {
    return $this->toBool($this->get(['review', 'allowDelete']));
  }

  /**
   * @return bool
   */
  public function isEditAllowed() {
    return $this->toBool($this->get(['review', 'allowEdit']));
  }

  /**
   * @return bool
   */
  public function allowImages() {
    return $this->toBool($this->get(['images', 'enabled']));
  }

  /**
   * @return bool
   */
  public function allowNewImages() {
    return $this->toBool($this->get(['images', 'allowNewImages']));
  }

  /**
   * @return float
   */
  public function getMaxImageSize() {
    return 1.0 * $this->get(['images', 'maxFileSize']);
  }

  /**
   * @return float
   */
  public function getImageWidth() {
    return 1.0 * $this->get(['images', 'width']);
  }

  /**
   * @return float
   */
  public function getImageHeight() {
    return 1.0 * $this->get(['images', 'height']);
  }

  /**
   * @return float
   */
  public function getImageThumbnailWidth() {
    return 1.0 * $this->get(['images', 'thumbWidth']);
  }

  /**
   * @return float
   */
  public function getImageThumbnailHeight() {
    return 1.0 * $this->get(['images', 'thumbHeight']);
  }

  /**
   * @return string
   */
  public function getAveragePlacement() {
    return $this->toAveragePlacement($this->get(['display', 'product', 'averagePlacement']));
  }

  /**
   * @return int
   */
  public function getReviewsPerPage() {
    $ret = (int)$this->get(['display', 'product', 'reviewsPerPage']);
    return $ret === 0 ? 5 : $ret;
  }

  /**
   * @return bool
   */
  public function showOnProductListing() {
    return $this->toBool($this->get(['display', 'productList', 'show']));
  }

  /**
   * @return array|mixed|string
   */
  public function productListNoReviewsBehavior() {
    if ($this->showOnProductListing()) {
      $val = $this->get(['display', 'productList', 'noReviews']);
      if ($val === 'hide' || $val === 'omit' || $val === 'show') {
        return $val;
      }
    }
    return 'omit';
  }

  /**
   * @return bool
   */
  public function moderationEnabled() {
    return $this->toBool($this->get(['moderation', 'enabled']));
  }

  /**
   * @return bool
   */
  public function validateNewReviews() {
    return $this->moderationEnabled() && $this->toBool($this->get(['moderation', 'needApprove', 'create']));
  }

  /**
   * @return bool
   */
  public function validateUpdatedReviews() {
    return $this->moderationEnabled() && $this->toBool($this->get(['moderation', 'needApprove', 'edit']));
  }

  /**
   * @return bool
   */
  public function validateReportedReviews() {
    return $this->moderationEnabled() && $this->toBool($this->get(['moderation', 'needApprove', 'reported']));
  }

  /**
   * @return bool
   */
  public function allowEmptyReviews() {
    return $this->toBool($this->get(['review', 'allowEmpty']));
  }

  /**
   * @return bool
   */
  public function allowEmptyTitle() {
    return $this->toBool($this->get(['review', 'allowEmptyTitle']));
  }

  /**
   * @return bool
   */
  public function showOnProductComparison() {
    return $this->toBool($this->get(['display', 'productComparison', 'show']));
  }

  /**
   * @return string
   */
  public function getNamePreference() {
    return $this->toNamePreference($this->get(['review', 'displayName']));
  }

  /**
   * @return bool
   */
  public function usePseudonym() {
    $namePref = $this->getNamePreference();
    return ($namePref === 'pseudonym' || $namePref === 'custom');
  }

  /**
   * @return string
   */
  public function getReviewOrder() {
    return $this->toOrderByPreference($this->get(['display', 'product', 'orderBy']));
  }

  /**
   * @return array|mixed
   */
  public function showSignInButton() {
    return $this->get(['display', 'product', 'showSignInButton']);
  }

  /**
   * @return array|mixed
   */
  public function hideEmptyReviews() {
    return $this->get(['display', 'product', 'hideEmptyReviews']);
  }

  /**
   * @return string
   */
  public function getShape() {
    return $this->toShape($this->get(['theme', 'shape']));
  }

  /**
   * @param string $type
   * @return int
   */
  public function getShapeSize($type='product') {
    return $this->validShapeSize($this->get(['theme', 'shapeSize', $type]));
  }

  /**
   * @return bool
   */
  public function showOnCustomerAccount() {
    return $this->toBool($this->get(['display', 'myReviews', 'show']));
  }

  /**
   * @return array|mixed
   */
  public function getCustomerAccountIcon() {
    return $this->get(['display', 'myReviews', 'iconClass']);
  }

  /**
   * @return int
   */
  public function getCustomerReviewsPerPage() {
    $ret = (int)$this->get(['display', 'myReviews', 'reviewsPerPage']);
    return $ret === 0 ? 5 : $ret;
  }

  /**
   * @return int
   */
  public function getAllReviewsPerPage() {
    $ret = (int)$this->get(['display', 'allReviews', 'reviewsPerPage']);
    return $ret === 0 ? 10 : $ret;
  }

  /**
   * @return int
   */
  public function getCustomerMaxRequests() {
    $ret = (int)$this->get(['display', 'myReviews', 'maxRequests']);
    return $ret === 0 ? 3 : $ret;
  }

  /**
   * @return bool
   */
  public function filterByLanguage() {
    return $this->toBool($this->get(['general', 'multilang']));
  }

  /**
   * @return int
   */
  public function getAdminEmailLanguage() {
    return (int)$this->get(['notifications', 'admin', 'language']);
  }

  /**
   * @return array|mixed
   */
  public function getAdminEmail() {
    return $this->get(['notifications', 'admin', 'email']);
  }

  /**
   * @return array|mixed
   */
  public function emailAdminReviewNeedsApproval() {
    return $this->get(['notifications', 'admin', 'needApprove']);
  }

  /**
   * @return array|mixed
   */
  public function emailAdminReviewCreated() {
    return $this->get(['notifications', 'admin', 'reviewCreated']);
  }

  /**
   * @return array|mixed
   */
  public function emailAdminReviewUpdated() {
    return $this->get(['notifications', 'admin', 'reviewUpdated']);
  }

  /**
   * @return array|mixed
   */
  public function emailAdminReviewDeleted() {
    return $this->get(['notifications', 'admin', 'reviewDeleted']);
  }

  /**
   * @return array|mixed
   */
  public function emailAuthorThankYou() {
    return $this->get(['notifications', 'author', 'thankYou']);
  }

  /**
   * @return array|mixed
   */
  public function emailAuthorReviewApproved() {
    return $this->get(['notifications', 'author', 'reviewApproved']);
  }

  /**
   * @return array|mixed
   */
  public function emailAuthorReviewDeleted() {
    return $this->get(['notifications', 'author', 'reviewDeleted']);
  }

  /**
   * @return array|mixed
   */
  public function emailAuthorNotifyOnReply() {
    return $this->get(['notifications', 'author', 'reply']);
  }

  /**
   * @return bool
   */
  public function emitRichSnippets() {
    return (bool)$this->get(['richSnippets', 'enabled']);
  }

  /**
   * @return array|mixed
   */
  public function getShapeColors() {
    return $this->get(['theme', 'colors']);
  }

  /**
   * @return string
   */
  public function getDisplayCriteriaPreference() {
    $ret = $this->get(['review', 'displayCriteria']);
    return $this->toDisplayCriteria($ret);
  }

  /**
   * @return array|mixed
   */
  public function getCheckModuleVersion() {
    $ret = Configuration::getGlobalValue(self::CHECK_VERSION);
    if ($ret) {
      return json_decode($ret, true);
    }
    return [ 'ts' => null, 'version' => null, 'notes' => null, 'paid' => null ];
  }

  /**
   * @return bool
   */
  public function isActivated() {
    return Configuration::getGlobalValue(self::ACTIVATED) == 'free';
  }

  /**
   * @throws PrestaShopException
   */
  public function setActivated() {
    Configuration::updateGlobalValue(self::ACTIVATED, 'free');
  }

  /**
   * @return bool
   * @throws Exception
   */
  public function shouldReview() {
    $reviewed = static::toBool(Configuration::getGlobalValue(self::REVIEWED));
    if ($reviewed) {
      return false;
    }
    $now = new DateTime();
    $threshold = static::getInstallationDate()->add(DateInterval::createfromdatestring('+1 day'));
    return $now > $threshold;
  }

  /**
   * @throws PrestaShopException
   */
  public function setReviewed() {
    Configuration::updateGlobalValue(self::REVIEWED, '1');
  }

  /**
   * @return DateTime
   * @throws PrestaShopException
   * @throws Exception
   */
  public function getInstallationDate() {
    $sql = (new DbQuery())
      ->select('MIN(date_add)')
      ->from('configuration')
      ->where('name LIKE "REVWS_%"');
    $date = Db::getInstance()->getValue($sql);
    return new DateTime($date);
  }

  /**
   * @param $version
   * @param $ts
   * @param $notes
   * @param $paid
   * @throws PrestaShopException
   */
  public function setCheckModuleVersion($version, $ts, $notes, $paid) {
    Configuration::updateGlobalValue(self::CHECK_VERSION, json_encode([
      'ts' => $ts,
      'version' => $version,
      'notes' => $notes,
      'paid' => $paid
    ]));
  }

  /**
   * @return array|mixed|string
   */
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

  /**
   * @return array|mixed
   */
  public function isConsentRequiredForCustomers() {
    return $this->get(['gdpr', 'requiredForCustomers']);
  }

  /**
   * @return array|mixed
   */
  public function getGDPRConsentMessage() {
    return $this->get(['gdpr', 'message']);
  }

  /**
   * @return bool
   */
  public function allowMultipleReviews()
  {
    return $this->toBool($this->get(['review', 'allowMultipleReviews']));
  }

  /**
   * @param $val
   * @return bool
   */
  private function toBool($val) {
    return !!$val;
  }

  /**
   * @param $in
   * @return string
   */
  private function toDisplayCriteria($in) {
    if (in_array($in, ['none', 'inline', 'side'])) {
      return $in;
    }
    return 'none';
  }

  /**
   * @param $placement
   * @return string
   */
  private function toPlacement($placement) {
    return $placement === 'tab' ? 'tab' : 'block';
  }

  /**
   * @param $placement
   * @return string
   */
  private function toAveragePlacement($placement) {
    if (in_array($placement, ['rightColumn', 'buttons', 'custom', 'none'])) {
      return $placement;
    }
    return 'extra';
  }

  /**
   * @param $shape
   * @return string
   */
  private function toShape($shape) {
    if (Shapes::hasShape($shape)) {
      return $shape;
    }
    return Shapes::getDefaultShape();
  }

  /**
   * @param $pref
   * @return string
   */
  private function toNamePreference($pref) {
    if (in_array($pref, ['fullName', 'firstName', 'lastName', 'initials', 'initialLastName', 'pseudonym', 'custom'])) {
      return $pref;
    }
    return 'fullName';
  }

  /**
   * @param $pref
   * @return string
   */
  private function toOrderByPreference($pref) {
    if (in_array($pref, ['date', 'grade', 'usefulness'])) {
      return $pref;
    }
    return 'date';
  }

  /**
   * @param $size
   * @return int
   */
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

  /**
   * @return bool
   * @throws \PrestaShopDatabaseException
   * @throws PrestaShopException
   */
  public function remove() {
    $this->data = null;
    Configuration::deleteByName(self::CHECK_VERSION);
    Configuration::deleteByName(self::SETTINGS);
    Configuration::deleteByName(self::ACTIVATED);
    Configuration::deleteByName(self::VERSION);
    return true;
  }

  /**
   * @param null $path
   * @return array|mixed
   */
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

  /**
   * @param $left
   * @param $right
   * @return array
   */
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

  /**
   * @param $value
   * @return bool
   * @throws PrestaShopException
   */
  public function set($value) {
    $this->data = $value;
    return Configuration::updateGlobalValue(self::SETTINGS, json_encode($value));
  }

  /**
   * @return string
   */
  private static function getDefaultGDPR() {
    if (PrestashopGDRP::isAvailable()) {
      return 'psgdpr';
    }
    return 'basic';
  }

  /**
   * @param $module
   * @return mixed
   */
  private static function getUnderscoredVersion($module) {
    return str_replace('.', '_', $module->version);
  }
}
