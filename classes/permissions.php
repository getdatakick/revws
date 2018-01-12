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

class Permissions {
  private $settings;

  public function __construct(Settings $settings, Visitor $visitor) {
    $this->settings = $settings;
    $this->visitor = $visitor;
  }

  public function canCreateReview($productId) {
    if ($this->visitor->isGuest()) {
      return $this->settings->allowGuestReviews();
    }
    // TODO: check product id
    return true;
  }

  public function canReportAbuse(Review $review) {
    if (! $this->settings->isReportingAllowed()) {
      return false;
    }
    if ($review->isOwner($this->visitor)) {
      return false;
    }
    if ($this->reportedBy($review, $this->visitor)) {
      return false;
    }
    return true;
  }

  public function canVote(Review $review) {
    if (! $this->settings->isVotingAllowed()) {
      return false;
    }
    if ($review->isOwner($this->visitor)) {
      return false;
    }
    if ($this->hasVoted($review, $this->visitor)) {
      return false;
    }
    return true;
  }

  public function canDelete(Review $review) {
    if (! $this->settings->isDeleteAllowed()) {
      return false;
    }
    return $review->isOwner($this->visitor);
  }

  public function canEdit(Review $review) {
    if (! $this->settings->isEditAllowed()) {
      return false;
    }
    return $review->isOwner($this->visitor);
  }

  private function reportedBy($review, $visitor) {
    // TODO
    return false;
  }

  private function hasVoted($review, $visitor) {
    // TODO
    return false;
  }
}
