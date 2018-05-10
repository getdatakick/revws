<?php
namespace Revws;
use \RevwsReview;
use \RevwsCriterion;
use \Db;

class GDPR {
  private $settings;
  private $customerId;
  private $email;

  public function __construct($settings, $customerId, $email) {
    $this->settings = $settings;
    $this->customerId = (int)$customerId;
    $this->email = $email;
  }

  public function deleteData() {
    $conn = Db::getInstance();
    $cond = "email = '".pSQL($this->email)."'";
    if ($this->isCustomer()) {
      $cond .= " OR id_customer = " . $this->customerId;
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
    if ($this->isCustomer()) {
      if (! $conn->execute("DELETE FROM "._DB_PREFIX_."revws_review_reaction WHERE id_customer = ".$this->customerId)) {
        return $conn->getMsgError();
      }
    }
    return true;
  }

  public function getData() {
    $criteria = RevwsCriterion::getCriteria(\Context::getContext()->language->id);
    $query = [
      'allLanguages' => true,
      'productInfo' => true,
      'customerInfo' => true
    ];

    // retrieve review's by email
    $reviewsByEmail = RevwsReview::findReviews($this->settings, array_merge($query, ['email' => $this->email]))['reviews'];
    $ret = [
      'reviews' => [],
      'reactions' => []
    ];
    foreach ($reviewsByEmail as $key => $review) {
      $ret['reviews'][] = self::encodeReview($review, $criteria);
    }
    if ($this->isCustomer()) {
      // retrieve customer's review. They are probably all already in $ret array added via email search
      $reviewsByCustomer = RevwsReview::findReviews($this->settings, array_merge($query, ['customer' => $this->customerId]))['reviews'];
      foreach ($reviewsByCustomer as $key => $review) {
        if (! isset($reviewsByEmail[$key])) {
          $ret['reviews'][] = self::encodeReview($review, $criteria);
        }
      }

      // find any customer reactions
      $sql = "SELECT * FROM "._DB_PREFIX_."revws_review_reaction WHERE id_customer = " . $this->customerId;
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

  private function isCustomer() {
    return !! $this->customerId;
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
