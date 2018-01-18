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
use \Revws\ReviewQuery;

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
  public $deleted = 0;
  public $date_add;
  public $date_upd;

  public $grades = [];
  public $product;
  public $customer;

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
    $ret &= $this->deleteReactions();
    return $ret;
  }

  public function markDelete() {
    $id = (int)$this->id;
    return Db::getInstance()->update('revws_review', [
      'deleted' => true,
      'date_upd' => date('Y-m-d H:i:s')
    ], "id_review = $id");
  }

  public function deleteGrades() {
    $conn = Db::getInstance();
    $id = (int)$this->id;
    return $conn->delete('revws_review_grade', "id_review = $id ");
  }

  public function deleteReactions() {
    $conn = Db::getInstance();
    $id = (int)$this->id;
    return $conn->delete('revws_review_reaction', "id_review = $id ");
  }

  public static function findReviews($options, $lang=null, $shop=null) {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $query = new ReviewQuery($options, $lang, $shop);

    // load reviews
    $reviews = [];
    foreach ($conn->executeS($query->getSql()) as $item) {
      $id = (int)$item['id_review'];
      $reviews[$id] = self::mapDbData($item);
    }
    $count = $conn->getRow('SELECT FOUND_ROWS() AS r')['r'];

    // load ratings
    if ($count) {
      $keys = implode(array_keys($reviews), ', ');
      $grade = _DB_PREFIX_ . 'revws_review_grade';
      $sql = "SELECT id_review, id_criterion, grade FROM $grade WHERE id_review IN ($keys) ORDER by id_review, id_criterion";
      foreach ($conn->executeS($sql) as $row) {
        $id = (int)$row['id_review'];
        $key = (int)$row['id_criterion'];
        $value = (int)$row['grade'];
        $reviews[$id]->grades[$key] = $value;
      }
    }

    $page = $query->getPage();
    $pageSize = $query->getPageSize();
    return [
      'total' => (int)$count,
      'page' => $page,
      'pages' => $pageSize > 0 ? ceil($count / $pageSize) : 1,
      'pageSize' => $pageSize,
      'reviews' => $reviews
    ];
  }

  public static function getByProduct($productId, Visitor $visitor, $pageSize, $page, $order) {
    return self::findReviews([
      'product' => $productId,
      'visitor' => $visitor,
      'validated' => true,
      'deleted' => false,
      'pageSize' => $pageSize,
      'page' => $page,
      'order' => [
        'field' => $order,
        'direction' => 'desc'
      ]
    ]);
  }

  public function setValidated($validated) {
    $this->validated = $validated;
  }

  public function vote($up=true, Settings $settings, Visitor $visitor) {
    $conn = Db::getInstance();
    return $conn->insert('revws_review_reaction',
      [
        'id_review' => (int)$this->id,
        'id_customer' => (int)$visitor->getCustomerId(),
        'id_guest' => (int)$visitor->getGuestId(),
        'reaction_type' => $up ? 'vote_up' : 'vote_down'
      ]
    );
  }

  public function reportAbuse($reason, Settings $settings, Visitor $visitor) {
    if ($settings->validateReportedReviews()) {
      $this->setValidated(false);
      $this->save();
    }
    $conn = Db::getInstance();
    return $conn->insert('revws_review_reaction',
      [
        'id_review' => (int)$this->id,
        'id_customer' => (int)$visitor->getCustomerId(),
        'id_guest' => (int)$visitor->getGuestId(),
        'reaction_type' => 'report_abuse'
      ]
    );
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
    $query = new ReviewQuery([
      'product' => (int)$productId,
      'validated' => true,
      'deleted' => false
    ]);
    $row = Db::getInstance(_PS_USE_SQL_SLAVE_)->getRow($query->getAverageGradeSql());
    if ($row) {
      return [$row['grade'], $row['cnt']];
    }
    return [0, 0];
  }

  public function toJSData(Permissions $permissions) {
    $canEdit = $permissions->canEdit($this);
    return [
      'id' => (int)$this->id,
      'productId' => (int)$this->id_product,
      'product' => $this->product,
      'authorType' => $this->getAuthorType(),
      'authorId' => $this->getAuthorId(),
      'customer' => $this->customer,
      'displayName' => $this->display_name,
      'date' => $this->date_add,
      'email' => $canEdit ? $this->email : '',
      'grades' => $this->grades,
      'grade' => self::calculateAverage($this->grades),
      'title' => $this->title,
      'content' => $this->content,
      'underReview' => !$this->validated,
      'deleted' => !!$this->deleted,
      'canReport' => $permissions->canReportAbuse($this),
      'canVote' => $permissions->canVote($this),
      'canEdit' => $canEdit,
      'canDelete' => $permissions->canDelete($this)
    ];
  }

  public static function mapReviews($reviews, Permissions $perm) {
    $ret = [];
    foreach ($reviews as $review) {
      $ret[] = $review->toJSData($perm);
    }
    return $ret;
  }

  private static function mapDbData($dbData) {
    $review = new RevwsReview();
    $review->id = (int)$dbData['id_review'];
    $review->id_guest = (int)$dbData['id_guest'];
    $review->id_customer = (int)$dbData['id_customer'];
    $review->id_product = (int)$dbData['id_product'];
    $review->display_name = $dbData['display_name'];
    $review->email = $dbData['email'];
    $review->title = $dbData['title'];
    $review->content = $dbData['content'];
    $review->date_add = $dbData['date_add'];
    $review->date_upd = $dbData['date_add'];
    $review->validated = !!$dbData['validated'];
    $review->deleted = !!$dbData['deleted'];
    if (isset($dbData['product'])) {
      $review->product = $dbData['product'];
    }
    if (isset($dbData['customer'])) {
      $review->customer = $dbData['customer'];
    }
    $review->grades = [];
    return $review;
  }

  public static function fromRequest(Visitor $visitor) {
    $id = (int)Tools::getValue('id');
    if ($id === -1) {
      $id = null;
    }
    $review = new RevwsReview($id);
    $review->id_guest = $visitor->getGuestId();
    $review->id_customer = $visitor->getCustomerId();
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
    return (int)($this->isCustomer() ? $this->id_customer : $this->id_guest);
  }
}
