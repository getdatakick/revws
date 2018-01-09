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
use \Db;

class Review {
  private $id;
  private $grade;
  private $authorType;
  private $authorId;
  private $displayName;
  private $email;
  private $title;
  private $content;
  private $date;
  private $validated;
  private $hidden;

  private function __construct() {
  }

  public function isOwner(Visitor $visitor) {
    if ($this->authorType != $visitor->getType()) {
      return false;
    }
    return $this->authorId == $visitor->getId();
  }

  public static function getByProduct($productId, $visitor=null, $onlyValidated=true, $showHidden=false, $showDeleted=false) {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $id = (int)$productId;
    $review = _DB_PREFIX_ . 'revws_review';
    $query = "SELECT r.* FROM $review r WHERE r.id_product = $id AND ".self::getCondition('r', $onlyValidated, $showHidden, $showDeleted, $visitor);
    $dbData = $conn->executeS($query);
    if ($dbData) {
      return array_map(array('Revws\Review', 'mapDbData'), $dbData);
    }
    return [];
  }

  public static function getAverageGrade($productId) {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $id = (int)$productId;
    $review = _DB_PREFIX_ . 'revws_review';
    $query = "SELECT (SUM(r.grade) / COUNT(1)) AS grade, COUNT(1) as cnt FROM $review r WHERE r.id_product=$id AND ".self::getCondition('r', true, false, false);
    $row = $conn->getRow($query);
    if ($row) {
      return [$row['grade'], $row['cnt']];
    }
    return [0, 0];
  }

  private static function getCondition($alias, $onlyValidated, $showHidden, $showDeleted, $visitor=null) {
    $cond = [];
    if ($onlyValidated) {
      if ($visitor) {
        $ownerCond;
        $id = (int)$visitor->getId();
        if ($visitor->isCustomer()) {
          $ownerCond = "$alias.id_customer=$id";
        } else {
          $ownerCond = "$alias.id_guest=$id";
        }
        $cond[] = "($alias.validated=1 OR $ownerCond)";
      } else {
        $cond[] = "$alias.validated=1";
      }
    }
    if (! $showHidden) {
      $cond[] = "$alias.hidden=0";
    }
    if (! $showDeleted) {
      $cond[] = "$alias.deleted=0";
    }
    return $cond ? implode($cond, ' AND ') : '1';
  }

  public function toJSData(Permissions $permissions) {
    return [
      'id' => $this->id,
      'displayName' => $this->displayName,
      'date' => $this->date,
      'grade' => $this->grade,
      'title' => $this->title,
      'content' => $this->content,
      'underReview' => !$this->validated,
      'canReport' => $permissions->canReportAbuse($this),
      'canVote' => $permissions->canVote($this),
      'canEdit' => $permissions->canEdit($this),
      'canDelete' => $permissions->canDelete($this)
    ];
  }

  private static function mapDbData($dbData) {
    $review = new Review();
    $customerId = $dbData['id_customer'];
    if (is_null($customerId)) {
      $review->authorType = 'guest';
      $review->authorId = $dbData['id_guestd'];
    } else {
      $review->authorType = 'customer';
      $review->authorId = $customerId;
    }
    $review->id = $dbData['id_review'];
    $review->grade = $dbData['grade'];
    $review->displayName = $dbData['display_name'];
    $review->email = $dbData['email'];
    $review->title = $dbData['title'];
    $review->content = $dbData['content'];
    $review->date = $dbData['date_add'];
    $review->validated = $dbData['validated'];
    $review->hidden = $dbData['hidden'];
    return $review;
  }

}
