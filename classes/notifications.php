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
use \RevwsCriterion;
use \Customer;
use \Language;
use \Configuration;
use \Translate;
use \Validate;
use \Mail;
use \Exception;
use \Logger;

class Notifications {
  private static $instance;
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

  private function __construct() {
    // noop
  }

  // close connection, flush output and continue
  // processing notifications on backend only
  public function closeConnectionAndProcess() {
    if ($this->queue) {
      if (ob_get_length() > 0 ) {
        ob_end_flush();
      }
      flush();
      ignore_user_abort(true);
      if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
      }
      $this->process();
    }
    // end request
    die();
  }


  /**
   * process work items
   */
  public function process() {
    foreach ($this->queue as $workItem) {
      $type = $workItem['type'];
      $id = $workItem['id'];
      $actor = $workItem['actor'];
      try {
        call_user_func(array($this, $type), $id, $actor);
      } catch (Exception $e) {
        self::log("failed to process $type: " . $e->getMessage());
      }
    }
  }

  private function processReviewCreated($id, $actor) {
    if ($actor === 'visitor') {

      // send notification to administrator
      if ($this->getSettings()->emailAdminReviewCreated()) {
        $lang = $this->getAdminEmailLanguage();
        $email = $this->getAdminEmail();
        $data = $this->getCommonData($this->getReview($id), $lang);
        if (! Mail::Send($lang, 'revws-admin-review-created', Mail::l('New review has been created', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
          self::emailError('revws-admin-review-created', $id, $lang, $email);
        }
      }

      // send thank you email
      if ($this->getSettings()->emailAuthorThankYou()) {
        $review = $this->getReview($id);
        $lang = $this->getReviewerLanguage($review);
        $email = $this->getReviewerEmail($review);
        $data = $this->getCommonData($review, $lang);
        if (! Mail::Send($lang, 'revws-author-thank-you', Mail::l('Thank you for your review', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
          self::emailError('revws-author-thank-you', $id, $lang, $email);
        }
      }
    }
  }

  private function processReviewUpdated($id, $actor) {
    if ($actor === 'visitor') {
      // send notification to administrator
      if ($this->getSettings()->emailAdminReviewUpdated()) {
        $lang = $this->getAdminEmailLanguage();
        $email = $this->getAdminEmail();
        $data = $this->getCommonData($this->getReview($id), $lang);
        if (! Mail::Send($lang, 'revws-admin-review-updated', Mail::l('Review has been updated', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
          self::emailError('revws-admin-review-updated', $id, $lang, $email);
        }
      }
    }
  }

  private function processReviewDeleted($id, $actor) {
    if ($actor === 'visitor') {
      // send notification to administrator
      if ($this->getSettings()->emailAdminReviewDeleted()) {
        $lang = $this->getAdminEmailLanguage();
        $email = $this->getAdminEmail();
        $data = $this->getCommonData($this->getReview($id), $lang);
        if (! Mail::Send($lang, 'revws-admin-review-deleted', Mail::l('Review has been deleted', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
          self::emailError('revws-admin-review-deleted', $id, $lang, $email);
        }
      }
    }
    if ($actor === 'employee') {
      if ($this->getSettings()->emailAuthorReviewDeleted()) {
        $review = $this->getReview($id);
        $lang = $this->getReviewerLanguage($review);
        $email = $this->getReviewerEmail($review);
        $data = $this->getCommonData($review, $lang);
        if (! Mail::Send($lang, 'revws-author-review-deleted', Mail::l('Your review has been deleted', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
          self::emailError('revws-author-review-deleted', $id, $lang, $email);
        }
      }
    }
  }

  private function processReviewApproved($id, $actor) {
    if ($actor === 'employee') {
      if ($this->getSettings()->emailAuthorReviewApproved()) {
        $review = $this->getReview($id);
        $lang = $this->getReviewerLanguage($review);
        $email = $this->getReviewerEmail($review);
        $data = $this->getCommonData($review, $lang);
        if (! Mail::Send($lang, 'revws-author-review-approved', Mail::l('Your review has been approved', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
          self::emailError('revws-author-review-approved', $id, $lang, $email);
        }
      }
    }
  }

  private function processNeedsApproval($id, $actor) {
    if ($actor === 'visitor') {
      $settings = $this->getSettings();
      if ($settings->moderationEnabled() && $settings->emailAdminReviewNeedsApproval()) {
        $lang = $this->getAdminEmailLanguage();
        $email = $this->getAdminEmail();
        $data = $this->getCommonData($this->getReview($id), $lang);
        if (! Mail::Send($lang, 'revws-admin-needs-approval', Mail::l('Review needs approval', $lang), $data, $email, null, null, null, null, null, Utils::getMailsDirectory())) {
          self::emailError('revws-admin-needs-approval', $id, $lang, $email);
        }
      }
    }
  }

  private function processReplied($id, $actor) {
    if ($actor === 'employee') {
      $settings = $this->getSettings();
      if ($settings->emailAuthorNotifyOnReply()) {
        $review = $this->getReview($id);
        $lang = $this->getReviewerLanguage($review);
        $email = $this->getReviewerEmail($review);
        $data = $this->getCommonData($review, $lang);
        if (! Mail::Send($lang, 'revws-author-review-replied', sprintf(Mail::l('%s replied to your review', $lang), $this->getShopName()), $data, $email, null, null, null, null, null, Utils::getMailsDirectory(), false)) {
          self::emailError('revws-author-review-replied', $id, $lang, $email);
        }
      }
    }
  }

  /**
   * public API
   */
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
    $productData = Utils::getProductData($review->id_product, $lang);
    $authorName = $review->display_name;
    if ($review->isCustomer()) {
      $customer = $this->getCustomer($review);
      $customeName = $customer->firstname . ' ' .$customer->lastname;
    }

    return [
      '{product_id}' => $productData['id'],
      '{product_name}' => $productData['name'],
      '{product_image}' => $productData['image'],
      '{product_url}' => $productData['url'],
      '{review_id}' => (int)$review->id,
      '{author_type}' => $review->getAuthorType(),
      '{author_email}' => $review->email,
      '{author_name}' => $authorName,
      '{display_name}' => $review->display_name,
      '{title}' => $review->title,
      '{content}' => $review->content,
      '{ratings}' => Utils::calculateAverage($review->grades),
      '{reply}' => $review->reply,
      '{validated}' => $review->validated,
      '{deleted}' => $review->deleted
    ];
  }

  private function getAdminEmailLanguage() {
    return $this->getSettings()->getAdminEmailLanguage();
  }

  private function getAdminEmail() {
    return $this->getSettings()->getAdminEmail();
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
    $this->queue[] = [
      'type' => $type,
      'id' => (int)$reviewId,
      'actor' => $actor
    ];
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

  private function getSettings() {
    return Settings::getInstance();
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

}
