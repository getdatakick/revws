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
use \RevwsReview;
use \RevwsCriterion;
use \Context;
use \Customer;
use \Language;
use \Configuration;
use \Translate;
use \Validate;
use \Mail;
use \Exception;
use \Logger;
use \Hook;

class Notifications {
  private static $instance;
  private $allowed = true;
  private $queue = [];

  // cache
  private $review;
  private $customer;

  public static function getInstance() {
    if (! self::$instance) {
      self::$instance = new Notifications();
    }
    return self::$instance;
  }

  // close connection, flush output and continue
  // processing notifications on backend only
  public function closeConnectionAndProcess($module) {
    if ($this->queue) {
      if (ob_get_length() > 0 ) {
        ob_end_flush();
      }
      flush();
      ignore_user_abort(true);
      if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
      }
      $this->process($module);
    }
    // end request
    die();
  }


  /**
   * process work items
   */
  public function process($module) {
    if ($this->queue) {
      $module->clearCache();
      $settings = $module->getSettings();
      $krona = $module->getKrona();
      foreach ($this->queue as $workItem) {
        $type = $workItem['type'];
        $id = $workItem['id'];
        $actor = $workItem['actor'];
        try {
          call_user_func(array($this, $type), $id, $actor, $settings, $krona);
        } catch (Exception $e) {
          self::log("failed to process $type: " . $e->getMessage());
        }
      }
    }
  }

  private function processReviewCreated($id, $actor, $settings, $krona) {
    $review = $this->getReview($id);
    if ($actor === 'visitor') {

      // send notification to administrator
      if ($settings->emailAdminReviewCreated()) {
        $lang = $settings->getAdminEmailLanguage();
        $email = $settings->getAdminEmail();
        $data = $this->getCommonData($review, $lang);
        if (! Mail::Send($lang, 'revws-admin-review-created', Mail::l('New review has been created', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
          self::emailError('revws-admin-review-created', $id, $lang, $email);
        }
      }

      // send thank you email
      if ($settings->emailAuthorThankYou()) {
        $email = $this->getReviewerEmail($review);
        if ($email) {
          $lang = $this->getReviewerLanguage($review);
          $data = $this->getCommonData($review, $lang);
          if (! Mail::Send($lang, 'revws-author-thank-you', Mail::l('Thank you for your review', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
            self::emailError('revws-author-thank-you', $id, $lang, $email);
          }
        }
      }

      $krona->reviewCreated($review);
    }
    Hook::exec('actionRevwsReviewCreated', [
      'actor' => $actor,
      'review' => $review,
    ]);
  }

  private function processReviewUpdated($id, $actor, $settings) {
    $review = $this->getReview($id);
    if ($actor === 'visitor') {
      // send notification to administrator
      if ($settings->emailAdminReviewUpdated()) {
        $lang = $settings->getAdminEmailLanguage();
        $email = $settings->getAdminEmail();
        $data = $this->getCommonData($review, $lang);
        if (! Mail::Send($lang, 'revws-admin-review-updated', Mail::l('Review has been updated', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
          self::emailError('revws-admin-review-updated', $id, $lang, $email);
        }
      }
    }
    Hook::exec('actionRevwsReviewUpdated', [
      'actor' => $actor,
      'review' => $review,
    ]);
  }

  private function processReviewDeleted($id, $actor, $settings, $krona) {
    $review = $this->getReview($id);
    if ($actor === 'visitor') {
      // send notification to administrator
      if ($settings->emailAdminReviewDeleted()) {
        $lang = $settings->getAdminEmailLanguage();
        $email = $settings->getAdminEmail();
        $data = $this->getCommonData($review, $lang);
        if (! Mail::Send($lang, 'revws-admin-review-deleted', Mail::l('Review has been deleted', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
          self::emailError('revws-admin-review-deleted', $id, $lang, $email);
        }
      }
      $krona->reviewDeleted($review);
    }
    if ($actor === 'employee') {
      if ($settings->emailAuthorReviewDeleted()) {
        $email = $this->getReviewerEmail($review);
        if ($email) {
          $lang = $this->getReviewerLanguage($review);
          $data = $this->getCommonData($review, $lang);
          if (! Mail::Send($lang, 'revws-author-review-deleted', Mail::l('Your review has been deleted', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
            self::emailError('revws-author-review-deleted', $id, $lang, $email);
          }
        }
      }
      $krona->reviewRejected($review);
    }
    Hook::exec('actionRevwsReviewDeleted', [
      'actor' => $actor,
      'review' => $review,
    ]);
  }

  private function processReviewApproved($id, $actor, $settings, $krona) {
    $review = $this->getReview($id);
    if ($actor === 'employee') {
      if ($settings->emailAuthorReviewApproved()) {
        $email = $this->getReviewerEmail($review);
        if ($email) {
          $lang = $this->getReviewerLanguage($review);
          $data = $this->getCommonData($review, $lang);
          if (! Mail::Send($lang, 'revws-author-review-approved', Mail::l('Your review has been approved', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
            self::emailError('revws-author-review-approved', $id, $lang, $email);
          }
        }
      }
      $krona->reviewApproved($review);
    }
    Hook::exec('actionRevwsReviewApproved', [
      'actor' => $actor,
      'review' => $review,
    ]);
  }

  private function processNeedsApproval($id, $actor, $settings) {
    if ($actor === 'visitor') {
      if ($settings->moderationEnabled() && $settings->emailAdminReviewNeedsApproval()) {
        $review = $this->getReview($id);
        $lang = $settings->getAdminEmailLanguage();
        $email = $settings->getAdminEmail();
        $data = $this->getCommonData($review, $lang);
        $data['{approve_link}'] = $this->getApproveLink($review, $settings);
        $data['{reject_link}'] = $this->getRejectLink($review, $settings);
        if (! Mail::Send($lang, 'revws-admin-needs-approval', Mail::l('Review needs approval', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory())) {
          self::emailError('revws-admin-needs-approval', $id, $lang, $email);
        }
      }
    }
  }

  private function processReplied($id, $actor, $settings) {
    if ($actor === 'employee') {
      if ($settings->emailAuthorNotifyOnReply()) {
        $review = $this->getReview($id);
        $email = $this->getReviewerEmail($review);
        if ($email) {
          $lang = $this->getReviewerLanguage($review);
          $data = $this->getCommonData($review, $lang);
          if (! Mail::Send($lang, 'revws-author-review-replied', sprintf(Mail::l('%s replied to your review', $lang), $this->getShopName()), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
            self::emailError('revws-author-review-replied', $id, $lang, $email);
          }
        }
      }
    }
  }

  /**
   * public API
   */
  public function enableNotifications($allowed) {
    $this->allowed = $allowed;
  }

  public function reviewCreated($id, $actor) {
    $this->push('processReviewCreated', $id, $actor);
  }

  public function reviewUpdated($id, $actor) {
    $this->push('processReviewUpdated', $id, $actor);
  }

  public function reviewDeleted($id, $actor) {
    $this->push('processReviewDeleted', $id, $actor);
  }

  public function reviewApproved($id, $actor) {
    $this->push('processReviewApproved', $id, $actor);
  }

  public function needsApproval($id, $actor) {
    $this->push('processNeedsApproval', $id, $actor);
  }

  public function replied($id, $actor) {
    $this->push('processReplied', $id, $actor);
  }

  private function getCommonData(RevwsReview $review, $lang) {
    $ret = [];

    if ($review->entity_type === 'product') {
      $productData = FrontApp::getProductData($review->id_entity, $lang);
      $ret = [
        '{product_id}' => $productData['id'],
        '{product_name}' => $productData['name'],
        '{product_image}' => $productData['image'],
        '{product_url}' => $productData['url']
      ];
    }

    $authorName = $review->display_name;
    if ($review->isCustomer()) {
      $customer = $this->getCustomer($review);
      $customeName = $customer->firstname . ' ' .$customer->lastname;
    }

    $ret = array_merge($ret, [
      '{review_id}' => (int)$review->id,
      '{author_type}' => $review->getAuthorType(),
      '{author_email}' => $review->email,
      '{author_name}' => $authorName,
      '{display_name}' => $review->display_name,
      '{title}' => $review->title,
      '{content}' => $this->escapeContent($review->content),
      '{ratings}' => round(Utils::calculateAverage($review->grades), 1),
      '{reply}' => $this->escapeContent($review->reply),
      '{validated}' => $review->validated,
      '{deleted}' => $review->deleted
    ]);

    return $ret;
  }

  private function getReviewerEmail(RevwsReview $review) {
    if ($review->isCustomer()) {
      return $this->getCustomer($review)->email;
    } else {
      return $review->email;
    }
  }

  private function getReviewerLanguage(RevwsReview $review) {
    if ($review->isCustomer()) {
      return (int)$this->getCustomer($review)->id_lang;
    } else {
      return (int)$review->getLanguage();
    }
  }

  // utils
  private function push($type, $reviewId, $actor) {
    if ($this->allowed) {
      $this->queue[] = [
        'type' => $type,
        'id' => (int)$reviewId,
        'actor' => $actor
      ];
    }
  }

  private function getReview($id) {
    $id = (int)$id;
    if (! $this->review || !$this->review->id != $id) {
      $review = new RevwsReview($id);
      if (! Validate::isLoadedObject($review)) {
        throw new Exception("Review with id $id not found");
      }
      $review->loadGrades();
      $this->review = $review;
    }
    return $this->review;
  }

  private function getCustomer(RevwsReview $review) {
    if (! $review->isCustomer()) {
      throw new Exception("Review is by guest");
    }
    $id = (int)$review->getAuthorId();
    if (! $this->customer || $this->customer->id != $id) {
      $customer = new Customer($id);
      if (! Validate::isLoadedObject($customer)) {
        throw new Exception("Customer with id $id not found");
      }
      $this->customer = $customer;
    }
    return $this->customer;
  }

  private function getShopName() {
    return Configuration::get('PS_SHOP_NAME');
  }

  private static function emailError($template, $reviewId, $lang, $email) {
    $l = Language::getLanguage($lang)['iso_code'];
    self::log("failed to send email template $template in $l language");
  }

  private static function log($msg) {
    Logger::addLog("Revws module: $msg");
  }

  private function getActionLink($action, $data) {
    $context = Context::getContext();
    $data['action'] = $action;
    return $context->link->getModuleLink('revws', 'EmailAction', $data, true);
  }

  private function getApproveLink(RevwsReview $review, Settings $settings) {
    return $this->getActionLink('approve', [
      'review-id' => (int)$review->id,
      'secret' => $review->getSecretHash('approve', $settings)
    ]);
  }

  private function getRejectLink(RevwsReview $review, Settings $settings) {
    return $this->getActionLink('reject', [
      'review-id' => (int)$review->id,
      'secret' => $review->getSecretHash('reject', $settings)
    ]);
  }

  private function escapeContent($str) {
    if ($str) {
      return nl2br($str);
    }
    return $str;
  }
}
