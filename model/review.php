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
use \Revws\Visitor;
use \Revws\Settings;
use \Revws\Permissions;

class RevwsReview extends ObjectModel {

  public static $definition = [
    'table'   => 'revws_review',
    'primary' => 'id_review',
    'fields'  => [
      'id_product'    => [ 'type' => self::TYPE_INT, 'validate' => 'isUnsignedId', 'required' => true],
      'id_customer'   => [ 'type' => self::TYPE_INT ],
      'id_guest'      => [ 'type' => self::TYPE_INT ],
      'email'         => [ 'type' => self::TYPE_STRING, 'required' => true ],
      'display_name'  => [ 'type' => self::TYPE_STRING, 'required' => true ],
      'title'         => [ 'type' => self::TYPE_STRING, 'required' => true ],
      'content'       => [ 'type' => self::TYPE_STRING, 'size' => 65535],
      'validated'     => [ 'type' => self::TYPE_BOOL, 'validate' => 'isBool' ],
      'hidden'        => [ 'type' => self::TYPE_BOOL, 'validate' => 'isBool' ],
      'deleted'       => [ 'type' => self::TYPE_BOOL, 'validate' => 'isBool' ],
      'date_add'      => [ 'type' => self::TYPE_DATE ],
      'date_upd'      => [ 'type' => self::TYPE_DATE ],
    ],
  ];

  public $id;
  public $id_product;
  public $id_customer;
  public $id_guest;
  public $email;
  public $display_name;
  public $title;
  public $content;
  public $validated = 0;
  public $hidden = 0;
  public $deleted = 0;
  public $date_add;
  public $date_upd;

  public $grades = [];

  public function isOwner(Visitor $visitor) {
    if ($this->getAuthorType() != $visitor->getType()) {
      return false;
    }
    return $this->getAuthorId() == $visitor->getId();
  }

  public function save() {
    $ret = parent::save();
    $ret &= $this->saveGrades();
    return $ret;
  }

  public function delete() {
    $ret = parent::delete();
    $ret &= $this->deleteGrades();
    return $ret;
  }

  public function deleteGrades() {
    $conn = Db::getInstance();
    $id = (int)$this->id;
    return $conn->delete('revws_review_grade', "id_review = $id ");
  }

  public static function getByProduct($productId, $visitor=null, $onlyValidated=true, $showHidden=false, $showDeleted=false) {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $id = (int)$productId;
    $review = _DB_PREFIX_ . 'revws_review';
    $grade = _DB_PREFIX_ . 'revws_review_grade';
    $query = "
      SELECT r.*, g.id_criterion, g.grade
      FROM $review r
      LEFT JOIN $grade g ON (r.id_review = g.id_review)
      WHERE r.id_product = $id
        AND ".self::getCondition('r', $onlyValidated, $showHidden, $showDeleted, $visitor);
    $dbData = $conn->executeS($query);
    if ($dbData) {
      return array_reduce($dbData, function($ret, $item) {
        $id = (int)$item['id_review'];
        $crit = (int)$item['id_criterion'];
        $value = (int)$item['grade'];
        if (! isset($ret[$id])) {
          $ret[$id] = self::mapDbData($item);
        }
        if ($crit) {
          $ret[$id]->grades[$crit] = $value;
        }
        return $ret;
      }, []);
    }
    return [];
  }

  public function setValidated($validated) {
    $this->validated = $validated;
  }

  public function vote($up=true, Settings $settings) {
    // TODO
    return true;
  }

  public function reportAbuse($reason, Settings $settings) {
    // TODO
    if ($settings->validateReportedReviews()) {
      $this->setValidated(false);
      $this->save();
    }
    return true;
  }

  private function saveGrades() {
    if ($this->grades) {
      $conn = Db::getInstance();
      $id = (int)$this->id;
      if ($id) {
        $this->deleteGrades();
        foreach ($this->grades as $key => $value) {
          $conn->insert('revws_review_grade',
            [
              'id_review' => $id,
              'id_criterion' => (int)$key,
              'grade' => (int)$value
            ]
          );
        }
      }
    }
    return true;
  }

  public function loadGrades() {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $grade = _DB_PREFIX_ . 'revws_review_grade';
    $id = (int)$this->id;
    $this->grades = [];
    if ($id) {
      $query = "SELECT g.* FROM $grade g WHERE g.id_review = $id";
      $dbData = $conn->executeS($query);
      if ($dbData) {
        foreach ($dbData as $row) {
          $key = (int)$row['id_criterion'];
          $value = (int)$row['grade'];
          $this->grades[$key] = $value;
        }
      }
    }
  }

  public static function getAverageGrade($productId) {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $id = (int)$productId;
    $review = _DB_PREFIX_ . 'revws_review';
    $rating = _DB_PREFIX_ . 'revws_review_grade';
    $query = "SELECT (SUM(ra.grade) / COUNT(1)) AS grade, COUNT(distinct r.id_review) as cnt FROM $review r LEFT JOIN $rating ra ON (r.id_review = ra.id_review) WHERE r.id_product=$id AND ".self::getCondition('r', true, false, false);
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
    $canEdit = $permissions->canEdit($this);
    return [
      'id' => (int)$this->id,
      'productId' => (int)$this->id_product,
      'displayName' => $this->display_name,
      'date' => $this->date_add,
      'email' => $canEdit ? $this->email : '',
      'grades' => $this->grades,
      'grade' => self::calculateAverage($this->grades),
      'title' => $this->title,
      'content' => $this->content,
      'underReview' => !$this->validated,
      'canReport' => $permissions->canReportAbuse($this),
      'canVote' => $permissions->canVote($this),
      'canEdit' => $canEdit,
      'canDelete' => $permissions->canDelete($this)
    ];
  }

  private static function mapDbData($dbData) {
    $review = new RevwsReview();
    $review->id = $dbData['id_review'];
    $review->id_guest = $dbData['id_guest'];
    $review->id_customer = $dbData['id_customer'];
    $review->id_product = (int)$dbData['id_product'];
    $review->display_name = $dbData['display_name'];
    $review->email = $dbData['email'];
    $review->title = $dbData['title'];
    $review->content = $dbData['content'];
    $review->date_add = $dbData['date_add'];
    $review->date_upd = $dbData['date_add'];
    $review->validated = $dbData['validated'];
    $review->hidden = $dbData['hidden'];
    $review->grades = [];
    return $review;
  }

  public static function fromRequest(Visitor $visitor) {
    $id = (int)Tools::getValue('id');
    if ($id === -1) {
      $id = null;
    }
    $review = new RevwsReview($id);
    $review->id_guest = $visitor->isCustomer() ? 0 : $visitor->getId();
    $review->id_customer = $visitor->isCustomer() ? $visitor->getId() : 0;
    $review->id_product = (int)Tools::getValue('productId');
    $review->display_name = Tools::getValue('displayName');
    $review->email = Tools::getValue('email');
    $review->title = Tools::getValue('title');
    $review->content = Tools::getValue('content');
    $review->date_upd = new \DateTime();
    $review->grades = [];
    $grades = Tools::getValue('grades');
    if (is_array($grades)) {
      foreach (Tools::getValue('grades') as $key => $value) {
        $review->grades[(int)$key] = (int)$value;
      }
    }
    return $review;
  }

  private function calculateAverage($grades) {
    $cnt = count($grades);
    if ($cnt) {
      return array_sum($grades) / $cnt;
    }
    return 0;
  }

  public function isCustomer() {
    return $this->id_customer > 0;
  }

  public function getAuthorType() {
    return $this->isCustomer() ? 'customer' : 'guest';
  }

  public function getAuthorId() {
    return $this->isCustomer() ? $this->id_customer : $this->id_guest;
  }
}
