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

class VisitorPermissions implements Permissions {
  private $settings;
  private $visitor;

  public function __construct(Settings $settings, Visitor $visitor) {
    $this->settings = $settings;
    $this->visitor = $visitor;
  }

  public function canCreateReview($entityType, $entityId) {
    $visitor = $this->visitor;
    if ($visitor->isGuest() && !$this->settings->allowGuestReviews()) {
      return false;
    }

    if ($visitor->hasWrittenReview($entityType, $entityId)) {
      return false;
    }

    if (! $this->settings->allowReviewWithoutCriteria()) {
      $criteria = RevwsCriterion::getByEntity($entityType, $entityId);
      if (count($criteria) === 0) {
        return false;
      }
    }
    return true;
  }

  public function canReportAbuse(RevwsReview $review) {
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

  public function canVote(RevwsReview $review) {
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

  public function canDelete(RevwsReview $review) {
    if (! $this->settings->isDeleteAllowed()) {
      return false;
    }
    return $review->isOwner($this->visitor);
  }

  public function canEdit(RevwsReview $review) {
    if (! $this->settings->isEditAllowed()) {
      return false;
    }
    return $review->isOwner($this->visitor);
  }

  private function reportedBy($review, $visitor) {
    return $visitor->hasReacted($review->id, 'report_abuse');
  }

  private function hasVoted($review, $visitor) {
    return $visitor->hasReacted($review->id, 'vote_up') || $visitor->hasReacted($review->id, 'vote_down');
  }

}
