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
use \RevwsReview;
use \RevwsCriterion;
use \Db;

class GDPR implements GDPRInterface {
  private $settings;
  private $impl;

  public function __construct($module) {
    $this->settings = $module->getSettings();
    $pref = $this->settings->getGDPRPreference();
    if ($pref === 'basic') {
      $this->impl = new BasicGDPR();
    }
    if ($pref === 'psgdpr' && PrestashopGDRP::isAvailable()) {
      $this->impl = new PrestashopGDRP($module->id);
    }
  }

  public function getConsentMessage(Visitor $visitor) {
    if ($this->isEnabled($visitor)) {
      return $this->impl->getConsentMessage($visitor);
    }
    return '';
  }

  public function logConsent(Visitor $visitor) {
    if ($this->impl) {
      $this->impl->logConsent($visitor);
    }
  }

  public function isEnabled(Visitor $visitor) {
    if ($this->impl) {
      if ($visitor->isCustomer() && !$this->settings->isConsentRequiredForCustomers()) {
        return false;
      }
      return $this->impl->isEnabled($visitor);
    }
    return false;
  }

  public function deleteData($customerId, $email) {
    $conn = Db::getInstance();
    $cond = "email = '".pSQL($email)."'";
    if ($customerId) {
      $cond .= " OR id_customer = " . $customerId;
    }
    $subselect = "SELECT id_review FROM "._DB_PREFIX_."revws_review WHERE $cond";

    // delete ratings
    if (! $conn->execute("DELETE FROM "._DB_PREFIX_."revws_review_grade WHERE id_review IN ($subselect)")) {
      return $conn->getMsgError();
    }
    // delete reviews
    if (! $conn->execute("DELETE FROM "._DB_PREFIX_."revws_review WHERE $cond")) {
      return $conn->getMsgError();
    }
    // delete votes
    if ($customerId) {
      if (! $conn->execute("DELETE FROM "._DB_PREFIX_."revws_review_reaction WHERE id_customer = ".$customerId)) {
        return $conn->getMsgError();
      }
    }
    return true;
  }

  public function getData($customerId, $email) {
    $criteria = RevwsCriterion::getCriteria(\Context::getContext()->language->id);
    $query = [
      'allLanguages' => true,
      'entityInfo' => true,
      'customerInfo' => true
    ];

    // retrieve review's by email
    $reviewsByEmail = RevwsReview::findReviews($this->settings, array_merge($query, ['email' => $email]))['reviews'];
    $ret = [
      'reviews' => [],
      'reactions' => []
    ];
    foreach ($reviewsByEmail as $key => $review) {
      $ret['reviews'][] = self::encodeReview($review, $criteria);
    }
    if ($customerId) {
      // retrieve customer's review. They are probably all already in $ret array added via email search
      $reviewsByCustomer = RevwsReview::findReviews($this->settings, array_merge($query, ['customer' => $customerId]))['reviews'];
      foreach ($reviewsByCustomer as $key => $review) {
        if (! isset($reviewsByEmail[$key])) {
          $ret['reviews'][] = self::encodeReview($review, $criteria);
        }
      }

      // find any customer reactions
      $sql = "SELECT * FROM "._DB_PREFIX_."revws_review_reaction WHERE id_customer = " . $customerId;
      if ($res = Db::getInstance()->ExecuteS($sql)) {
        foreach ($res as $row) {
          $ret['reactions'][] = [
            'review' => $row['id_review'],
            'reaction' => $row['reaction_type']
          ];
        }
      }
    }
    return $ret;
  }

  private static function encodeReview($review, $criteria) {
    $data = $review->toJSData(EmployeePermissions::getInstance());
    $grades = $data['grades'];
    unset($data['canReport']);
    unset($data['canDelete']);
    unset($data['canEdit']);
    unset($data['canVote']);
    unset($data['grades']);
    $rating = [];
    foreach ($grades as $key => $value) {
      $label = isset($criteria[$key]['label']) ? $criteria[$key]['label'] : $key;
      $rating[] = "$label:$value";
    }
    $data['rating'] = implode(', ', $rating);
    return $data;
  }

}
