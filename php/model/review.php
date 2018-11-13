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

use \Revws\Visitor;
use \Revws\Settings;
use \Revws\Permissions;
use \Revws\ReviewQuery;
use \Revws\Notifications;
use \Revws\Utils;
use \Revws\Actor;

class RevwsReview extends ObjectModel {

  public static $definition = [
    'table'   => 'revws_review',
    'primary' => 'id_review',
    'fields'  => [
      'entity_type'    => [ 'type' => self::TYPE_STRING, 'validate' => 'isString', 'required' => true ],
      'id_entity'      => [ 'type' => self::TYPE_INT, 'validate' => 'isUnsignedId', 'required' => true ],
      'id_customer'    => [ 'type' => self::TYPE_INT ],
      'id_guest'       => [ 'type' => self::TYPE_INT ],
      'id_lang'        => [ 'type' => self::TYPE_INT],
      'email'          => [ 'type' => self::TYPE_STRING ],
      'display_name'   => [ 'type' => self::TYPE_STRING, 'required' => true ],
      'title'          => [ 'type' => self::TYPE_STRING, 'required' => true ],
      'content'        => [ 'type' => self::TYPE_STRING, 'size' => 65535],
      'reply'          => [ 'type' => self::TYPE_STRING, 'size' => 65535],
      'validated'      => [ 'type' => self::TYPE_BOOL, 'validate' => 'isBool' ],
      'deleted'        => [ 'type' => self::TYPE_BOOL, 'validate' => 'isBool' ],
      'verified_buyer' => [ 'type' => self::TYPE_BOOL, 'validate' => 'isBool' ],
      'date_add'       => [ 'type' => self::TYPE_DATE ],
      'date_upd'       => [ 'type' => self::TYPE_DATE ],
    ],
  ];

  public $id;
  public $entity_type;
  public $id_entity;
  public $id_customer;
  public $id_guest;
  public $id_lang;
  public $email;
  public $display_name;
  public $title;
  public $content;
  public $validated = 0;
  public $deleted = 0;
  public $verified_buyer = 0;
  public $date_add;
  public $date_upd;
  public $reply;

  public $grades = [];
  public $images;
  public $entity;
  public $customer;

  private $deletedOrig;
  private $validatedOrig;
  private $replyOrig;

  public function __construct($id = null, $idLang = null, $idShop = null) {
    parent::__construct($id, $idLang, $idShop);
    $this->deletedOrig = $this->deleted;
    $this->validatedOrig = $this->validated;
    $this->replyOrig = $this->reply;
  }

  public function isOwner(Visitor $visitor) {
    if ($this->getAuthorType() != $visitor->getType()) {
      return false;
    }
    return $this->getAuthorId() == $visitor->getId();
  }

  public function save($nullValues = false, $autoDate = true) {
    $ret = parent::save($nullValues, $autoDate);
    $ret &= $this->saveGrades();
    $ret &= $this->saveImages();
    return $ret;
  }

  public function add($autoDate = true, $nullValues = false) {
    $ret = parent::add($autoDate, $nullValues);
    if ($ret) {
      $id = (int)$this->id;
      $actor = Actor::getActor();
      $notif = Notifications::getInstance();
      $notif->reviewCreated($id, $actor);
      $this->validated ? $notif->reviewApproved($id, $actor) : $notif->needsApproval($id, $actor);
    }
    return $ret;
  }

  public function update($nullValues = false) {
    $ret = parent::update($nullValues);
    if ($ret) {
      $id = (int)$this->id;
      $actor = Actor::getActor();
      $notif = Notifications::getInstance();
      $deleted = !!$this->deleted;
      $delOrig = !!$this->deletedOrig;
      $validated = !!$this->validated;
      $valOrig = !!$this->validatedOrig;
      if ($deleted) {
        if (! $delOrig) {
          $notif->reviewDeleted($id, $actor);
        } else {
          $notif->reviewUpdated($id, $actor);
        }
      } else {
        $notif->reviewUpdated($id, $actor);
        if ($validated != $valOrig) {
          $validated ? $notif->reviewApproved($id, $actor) : $notif->needsApproval($id, $actor);
        }
        if ($this->reply && !$this->replyOrig) {
          $notif->replied($id, $actor);
        }
      }
    }
    return $ret;
  }

  public function delete() {
    $ret = parent::delete();
    $ret &= $this->deleteGrades();
    $ret &= $this->deleteImages();
    $ret &= $this->deleteReactions();
    return $ret;
  }

  public function markDelete() {
    if ($this->id) {
      $this->deleted = true;
      $this->validated = false;
      return $this->save();
    }
    return false;
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

  public function deleteImages() {
    $conn = Db::getInstance();
    $id = (int)$this->id;
    return $conn->delete('revws_review_image', "id_review = $id ");
  }

  public static function findReviews(Settings $settings, $options) {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $query = new ReviewQuery($settings, $options);

    // load reviews
    $reviews = [];
    $res = $conn->executeS($query->getSql());
    if ($res) {
      foreach ($res as $item) {
        $id = (int)$item['id_review'];
        $reviews[$id] = self::mapDbData($item);
      }
    }
    $count = (int)$conn->getRow('SELECT FOUND_ROWS() AS r')['r'];

    if ($reviews) {
      $keys = implode(array_keys($reviews), ', ');

      // load ratings
      $grade = _DB_PREFIX_ . 'revws_review_grade';
      $sql = "SELECT id_review, id_criterion, grade FROM $grade WHERE id_review IN ($keys) ORDER by id_review, id_criterion";
      foreach ($conn->executeS($sql) as $row) {
        $id = (int)$row['id_review'];
        $key = (int)$row['id_criterion'];
        $value = (int)$row['grade'];
        $reviews[$id]->grades[$key] = $value;
      }

      // load images
      if ($settings->allowImages()) {
        $reviews[$id]->images = [];
        $image = _DB_PREFIX_ . 'revws_review_image';
        $sql = "SELECT id_review, image FROM $image WHERE id_review IN ($keys) ORDER by id_review, pos";
        foreach ($conn->executeS($sql) as $row) {
          $id = (int)$row['id_review'];
          $image = $row['image'];
          $reviews[$id]->images[] = $image;
        }
      }
    }

    $page = $query->getPage();
    $pageSize = $query->getPageSize();
    return [
      'total' => (int)$count,
      'page' => $page,
      'pages' => $pageSize > 0 ? ceil($count / $pageSize) : 1,
      'pageSize' => $pageSize,
      'order' => $query->getOrderField(),
      'orderDir' => $query->getOrderDirection(),
      'reviews' => $reviews
    ];
  }

  public static function getByProduct($productId, Settings $settings, Visitor $visitor, $pageSize, $page, $order, $orderDir) {
    return self::findReviews($settings, [
      'product' => $productId,
      'deleted' => false,
      'visitor' => $visitor,
      'validated' => true,
      'pageSize' => $pageSize,
      'page' => $page,
      'order' => [
        'field' => $order,
        'direction' => $orderDir
      ]
    ]);
  }

  public static function getByCustomer($customerId, Settings $settings, $pageSize, $page, $order, $orderDir) {
    return self::findReviews($settings, [
      'customer' => $customerId,
      'deleted' => false,
      'visitor' => $visitor,
      'validated' => true,
      'pageSize' => $pageSize,
      'page' => $page,
      'order' => [
        'field' => $order,
        'direction' => $orderDir
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

  public function loadImages(Settings $settings) {
    if ($settings->allowImages()) {
      $this->images = [];
      $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
      $image = _DB_PREFIX_ . 'revws_review_image';
      $id = (int)$this->id;
      if ($id) {
        $query = "SELECT image FROM $image WHERE id_review = $id ORDER by pos";
        $dbData = $conn->executeS($query);
        if ($dbData) {
          foreach ($dbData as $row) {
            $this->images[] = $row['image'];
          }
        }
      }
    }
  }

  private function saveImages() {
    $conn = Db::getInstance();
    $id = (int)$this->id;
    if ($id && is_array($this->images)) {
      $this->deleteImages();
      $pos = 1;
      foreach ($this->images as $image) {
        $conn->insert('revws_review_image',
          [
            'id_review' => $id,
            'image' => $image,
            'pos' => $pos++
          ]
        );
      }
    }
    return true;
  }

  public static function getAverageGrade(Settings $settings, $productId) {
    $query = new ReviewQuery($settings, [
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
    $images = is_array($this->images) ? $this->images : [];
    $ret = [
      'id' => (int)$this->id,
      'entityType' => $this->entity_type,
      'entityId' => (int)$this->id_entity,
      'authorType' => $this->getAuthorType(),
      'authorId' => $this->getAuthorId(),
      'displayName' => $this->display_name,
      'date' => $this->date_add,
      'email' => $canEdit ? $this->email : '',
      'grades' => $this->grades,
      'grade' => round(Utils::calculateAverage($this->grades)),
      'images' => $images,
      'title' => $this->title,
      'language' => (int)$this->id_lang,
      'content' => $this->content,
      'underReview' => !$this->validated,
      'reply' => $this->reply ? $this->reply : null,
      'deleted' => !!$this->deleted,
      'verifiedBuyer' => $this->isVerifiedBuyer(),
      'canReport' => $permissions->canReportAbuse($this),
      'canVote' => $permissions->canVote($this),
      'canEdit' => $canEdit,
      'canDelete' => $permissions->canDelete($this)
    ];
    if ($this->customer) {
      $ret['customer'] = $this->customer;
    }
    if ($this->entity) {
      $ret['entity'] = $this->entity;
    }
    return $ret;
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
    $review->id_lang = (int)$dbData['id_lang'];
    $review->display_name = $dbData['display_name'];
    $review->entity_type = $dbData['entity_type'];
    $review->id_entity = (int)$dbData['id_entity'];
    $review->email = $dbData['email'];
    $review->title = $dbData['title'];
    $review->content = $dbData['content'];
    $review->date_add = $dbData['date_add'];
    $review->date_upd = $dbData['date_add'];
    $review->validated = !!$dbData['validated'];
    $review->deleted = !!$dbData['deleted'];
    $review->verified_buyer = !!$dbData['verified_buyer'];
    $review->reply = $dbData['reply'];
    if (isset($dbData['entity'])) {
      $review->entity = $dbData['entity'];
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
    $review->entity_type = Tools::getValue('entityType');
    $review->id_entity = (int)Tools::getValue('entityId');
    $review->id_lang = $visitor->getLanguage();
    $review->display_name = Tools::getValue('displayName');
    $review->email = Tools::getValue('email');
    $review->title = Tools::getValue('title');
    $review->content = Tools::getValue('content');
    $review->date_upd = new \DateTime();
    $review->grades = [];
    $review->verified_buyer = $review->entity_type === 'product' && $visitor->hasPurchasedProduct($review->id_entity);
    $grades = Tools::getValue('grades');
    if (is_array($grades)) {
      foreach ($grades as $key => $value) {
        $review->grades[(int)$key] = (int)$value;
      }
    }
    $images = Tools::getValue('images');
    if (is_array($images)) {
      $review->images = [];
      $images = array_unique(array_values($images));
      foreach ($images as $image) {
        if (file_exists(_PS_ROOT_DIR_.$image)) {
          $review->images[] = $image;
        }
      }
    }
    return $review;
  }

  public static function fromJson($json, $settings) {
    $moderation = $settings->moderationEnabled();
    $id = (int)$json['id'];
    if ($id === -1) {
      $id = null;
    }
    $review = new RevwsReview($id);
    $review->display_name = $json['displayName'];
    $review->title = $json['title'];
    $review->content = $json['content'];
    $review->date_upd = new \DateTime();
    $review->entity = isset($json['entity']) ? $json['entity'] : null;
    $review->customer = isset($json['customer']) ? $json['customer'] : null;
    $review->email = $json['email'];
    $review->reply = $json['reply'] ? str_replace('\\', '\\\\', $json['reply']) : null;
    $review->validated = !$json['underReview'];
    $review->deleted = $json['deleted'];
    $review->verified_buyer = !!$json['verifiedBuyer'];
    $review->id_lang = (int)$json['language'];
    $review->grades = [];
    foreach ($json['grades'] as $key => $value) {
      $review->grades[(int)$key] = (int)$value;
    }
    if (! $id) {
      $review->entity_type  = $json['entityType'];
      $review->id_entity = (int)$json['entityId'];
      $review->id_customer = (int)$json['authorId'];
      $review->validated = true;
    }
    return $review;
  }

  public function isVerifiedBuyer() {
    return !! $this->verified_buyer;
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

  public function getLanguage() {
    return (int)$this->id_lang;
  }

  private function getSignature($action, $settings) {
    $salt = $settings->getSalt();
    return (
      (int)$this->id .
      $action .
      $this->display_name .
      (int)$this->deleted .
      $this->title .
      $salt .
      Utils::calculateAverage($this->grades) .
      $this->content .
      (int)$this->validated
    );
  }

  public function getSecretHash($action, $settings) {
    return md5($this->getSignature($action, $settings));
  }

  public function verifySecretHash($action, $hash, $settings) {
    return $this->getSecretHash($action, $settings) === $hash;
  }
}
