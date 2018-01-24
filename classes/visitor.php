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
use \Customer;
use \Db;
use \RevwsReview;

class Visitor {
  const GUEST = 'guest';
  const CUSTOMER = 'customer';

  private $settings;
  private $type;
  private $id;
  private $firstName='';
  private $lastName='';
  private $email='';
  private $reactions = null;
  private $reviewedProducts = null;

  public function __construct($context, Settings $settings) {
    $this->settings = $settings;
    if ($context->customer->isLogged()) {
      $this->type = self::CUSTOMER;
      $this->id = $context->customer->id;
      $customer = new Customer($this->id);
      $this->email = $customer->email;
      $this->firstName = $customer->firstname;
      $this->lastName = $customer->lastname;
    } else {
      $this->type = self::GUEST;
      $this->id = $context->cookie->id_guest;
    }
  }

  public function isGuest() {
    return $this->type == self::GUEST;
  }

  public function isCustomer() {
    return $this->type == self::CUSTOMER;
  }

  public function getId() {
    return $this->id;
  }

  public function getType() {
    return $this->type;
  }

  public function getFirstName() {
    return $this->firstName;
  }

  public function getLastName() {
    return $this->lastName;
  }

  public function getEmail() {
    return trim($this->email);
  }

  public function hasReacted($reviewId, $reactionType) {
    $this->loadReactions();
    return isset($this->reactions[(int)$reviewId][$reactionType]);
  }

  public function getCustomerId() {
    return $this->isCustomer() ? (int)$this->id : 0;
  }

  public function getGuestId() {
    return $this->isGuest() ? (int)$this->id : 0;
  }

  public function hasWrittenReview($productId) {
    $this->loadReviews();
    return isset($this->reviewedProducts[$productId]);
  }

  public function getReviewedProducts() {
    $this->loadReviews();
    return array_keys($this->reviewedProducts);
  }

  private function loadReactions() {
    if (is_null($this->reactions)) {
      $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
      $table = _DB_PREFIX_ . 'revws_review_reaction';
      $this->reactions = [];
      $query = "SELECT * FROM $table WHERE id_customer = {$this->getCustomerId()} AND id_guest = {$this->getGuestId()}";
      foreach ($conn->executeS($query) as $row) {
        $review = (int)$row['id_review'];
        $type = $row['reaction_type'];
        $this->reactions[$review][$type] = true;
      }
    }
  }

  private function loadReviews() {
    if (is_null($this->reviewedProducts)) {
      $this->reviewedProducts = [];
      $visitorType = $this->getType();
      $visitorId = $this->getId();
      $reviews = RevwsReview::findReviews([
        'deleted' => false,
        $visitorType => (int)$visitorId
      ]);
      foreach($reviews['reviews'] as $rev) {
        $this->reviewedProducts[(int)$rev->id_product] = true;
      }
    }
  }

  public function getProductsToReview() {
    // TODO
    return [];
  }

}
