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

namespace Revws;
use \Context;
use \Category;

class ReviewQuery {
  private $settings;
  private $options;

  public function __construct(Settings $settings, $queryOptions) {
    $this->settings = $settings;
    $this->options = $queryOptions;
  }

  public function getSql() {
    return "
      SELECT {$this->getFields()}
        FROM {$this->getTables()}
        WHERE {$this->getConditions()}
        ORDER BY {$this->getOrder()}
        {$this->getLimit()}
    ";
  }

  public function getCountSql() {
    return "
      SELECT COUNT(1) AS `cnt`
        FROM {$this->getTables()}
        WHERE {$this->getConditions()}
    ";
  }

  public function getAverageGradeSql() {
    return "
      SELECT (SUM(ra.grade) / COUNT(1)) AS grade, COUNT(distinct r.id_review) as cnt
        FROM " . _DB_PREFIX_ . "revws_review r
        LEFT JOIN " . _DB_PREFIX_ . "revws_review_grade ra ON (r.id_review = ra.id_review)
        WHERE {$this->getConditions()}
    ";
  }

  private function getFields() {
    $fields = [
      'id_review' => 'r.id_review',
      'id_guest' => 'r.id_guest',
      'id_customer' => 'r.id_customer',
      'entity_type' => 'r.entity_type',
      'id_entity' => 'r.id_entity',
      'id_lang' => 'r.id_lang',
      'display_name' => 'r.display_name',
      'email' => 'r.email',
      'title' => 'r.title',
      'content' => 'r.content',
      'reply' => 'r.reply',
      'date_add' => 'r.date_add',
      'date_upd' => 'r.date_upd',
      'validated' => 'r.validated',
      'deleted' => 'r.deleted',
      'verified_buyer' => 'r.verified_buyer'
    ];
    if ($this->includeEntityInfo()) {
      $fields['entity'] = 'pl.name';
    }
    if ($this->includeCustomerInfo()) {
      $fields['customer'] = "CONCAT(cust.firstname,' ', cust.lastname)";
    }

    $ret = [];
    foreach ($fields as $alias => $expr) {
      $ret[] = "$expr AS `$alias`";
    }
    return implode($ret, ", ");
  }

  private function getTables() {
    $from = _DB_PREFIX_ . 'revws_review r';
    $shop = $this->getShop();
    $lang = $this->getLanguage();
    if ($this->hasOption('shop')) {
      $from .= ' LEFT JOIN '. _DB_PREFIX_ ."product_shop ps ON (r.entity_type = 'product' AND r.id_entity = ps.id_product AND ps.id_shop = $shop)";
    }
    if ($this->includeEntityInfo()) {
      $from .= ' LEFT JOIN ' . _DB_PREFIX_ . "product_lang pl ON (r.entity_type = 'product' AND r.id_entity = pl.id_product AND pl.id_shop = $shop AND pl.id_lang = $lang)";
    }
    if ($this->includeCustomerInfo()) {
      $from .= ' LEFT JOIN ' . _DB_PREFIX_ . 'customer cust ON (r.id_customer = cust.id_customer)';
    }
    if ($this->hasOption('category')) {
      $category = $this->getInt('category');
      $from .= ' INNER JOIN '. _DB_PREFIX_ . "category_product cp ON (r.entity_type = 'product' AND r.id_entity = cp.id_product AND cp.id_category = $category)";
    }
    if ($this->hasOption('categoryTree')) {
      $category = $this->getInt('categoryTree');
      $categories = Category::getChildren($category, $lang);
      $cats = [ $category ];
      if ($categories) {
        foreach ($categories as $cat) {
          $cats[] = (int)$cat['id_category'];
        }
      }
      $cats = implode(',', $cats);
      $from .= ' INNER JOIN '. _DB_PREFIX_ . "category_product cpr ON (r.entity_type = 'product' AND r.id_entity = cpr.id_product AND cpr.id_category in ($cats))";
    }
    if ($this->hasOption('manufacturer')) {
      $manufacturer = $this->getInt('manufacturer');
      $from .= ' INNER JOIN '. _DB_PREFIX_ ."product p ON (r.entity_type = 'product' AND r.id_entity = p.id_product AND p.id_manufacturer = $manufacturer)";
    }
    return $from;
  }

  private function getConditions() {
    $cond = [];
    if ($this->hasOption('id')) {
      $cond[] = "r.id_review = " . $this->getInt('id');
    }
    if ($this->hasOption('shop')) {
      $cond[] = "ps.id_shop IS NOT NULL";
    }
    if ($this->hasOption('product')) {
      $cond[] = "r.entity_type = 'product' AND r.id_entity = " . $this->getInt('product');
    }
    if ($this->hasOption('entityType')) {
      $entityType = psql($this->getOption('entityType'));
      $cond[] = "r.entity_type = '$entityType'";
    }
    if ($this->hasOption('entity')) {
      $entity = $this->getOption('entity');
      $entityType = psql($entity['type']);
      $entityId = (int)$entity['id'];
      $cond[] = "r.entity_type = '$entityType' AND r.id_entity = $entityId";
    }
    if ($this->hasOption('customer')) {
      $cond[] = "r.id_customer = " . $this->getInt('customer');
    }
    if ($this->hasOption('email')) {
      $cond[] = "r.email = '" . psql($this->getOption('email', '')) . "'";
    }
    if ($this->hasOption('guest')) {
      $cond[] = "r.id_guest = " . $this->getInt('guest');
    }
    if ($this->hasOption('grade')) {
      $cond[] = $this->getAverageGradeSubselect() . " = " . $this->getInt('grade');
    }
    if ($this->hasOption('deleted')) {
      $cond[] = "r.deleted = " . $this->getBool('deleted');
    }
    if ($this->settings->filterByLanguage() && !$this->hasOption('allLanguages')) {
      $cond[] = "r.id_lang = " . $this->getLanguage();
    }
    if ($this->hasOption('validated')) {
      $validated = $this->getBool('validated');
      if ($validated && $this->hasOption('visitor')) {
        $ownerCond;
        $visitor = $this->getOption('visitor');
        $id = (int)$visitor->getId();
        if ($visitor->isCustomer()) {
          $ownerCond = "r.id_customer = $id";
        } else {
          $ownerCond = "r.id_guest = $id";
        }
        $cond[] = "(r.validated = $validated OR $ownerCond)";
      } else {
        $cond[] = "r.validated = $validated";
      }
    }
    if ($cond) {
      return implode($cond, ' AND ');
    }
    return '1';
  }

  public function getOrderField() {
    if ($this->hasOption('order')) {
      return $this->getOption('order')['field'];
    }
    return 'id';
  }

  public function getOrderDirection() {
    if ($this->hasOption('order')) {
      return $this->getOption('order')['direction'];
    }
    return 'desc';
  }

  private function getOrder() {
    $fieldId = $this->getOrderField();
    $field = $this->getOrderByField($fieldId);
    $dir = strtoupper($this->getOrderDirection());
    if ($field != 'id') {
      return "$field $dir, r.id_review DESC";
    }
    return "$field $dir";
  }

  private function getOrderByField($order) {
    switch ($order) {
      case 'date':
        return 'r.date_add';
      case 'usefulness':
        return $this->getUsefulnessSubselect();
      case 'author':
        return $this->includeCustomerInfo() ? "(CASE WHEN r.id_customer != 0 THEN TRIM(CONCAT(cust.firstname,' ', cust.lastname)) ELSE r.display_name END)" : 'r.display_name';
      case 'entityType':
        return 'r.entity_type';
      case 'entity':
        return 'pl.name';
      case 'title':
        return 'r.title';
      case 'content':
        return 'r.content';
      case 'grade':
        return $this->getAverageGradeSubselect();
      case 'id':
      default:
        return 'r.id_review';
    }
  }

  private function getAverageGradeSubselect() {
    return "(SELECT (SUM(ra.grade) / COUNT(1)) FROM " . _DB_PREFIX_ . "revws_review_grade ra WHERE ra.id_review = r.id_review)";
  }

  private function getUsefulnessSubselect() {
    return "(
      SELECT (SUM(CASE WHEN react.reaction_type = 'vote_up' THEN 1 ELSE 0 END) - SUM(CASE WHEN react.reaction_type = 'vote_down' THEN 1 ELSE 0 END))
        FROM " . _DB_PREFIX_ . "revws_review_reaction react
        WHERE react.id_review = r.id_review
          AND react.reaction_type IN ('vote_up', 'vote_down')
    )";
  }


  private function getLimit() {
    if ($this->hasOption('pageSize') && $this->hasOption('page')) {
      $pageSize = $this->getInt('pageSize');
      $page = $this->getInt('page');
      $offset = $page * $pageSize;
      return " LIMIT $pageSize OFFSET $offset";
    }
    return '';
  }

  public function getPage() {
    if ($this->hasOption('page')) {
      return $this->getInt('page');
    }
    return 0;
  }

  public function getPageSize() {
    if ($this->hasOption('pageSize')) {
      return $this->getInt('pageSize');
    }
    return -1;
  }

  private function includeEntityInfo() {
    if ($this->getOption('entityInfo', false)) {
      return true;
    }
    if ($this->getOption('productInfo', false)) {
      return true;
    }
    return $this->getOrderField() === 'entity';
  }

  private function includeCustomerInfo() {
    return $this->getOption('customerInfo', false);
  }

  private function hasOption($name) {
    return ($this->options && array_key_exists($name, $this->options));
  }

  private function getOption($name, $default=null) {
    if ($this->hasOption($name)) {
      return $this->options[$name];
    }
    return $default;
  }

  private function getInt($name) {
    return (int)$this->getOption($name, 0);
  }

  private function getBool($name) {
    return $this->getOption($name, false) ? 1 : 0;
  }

  private function getLanguage() {
    if ($this->hasOption('language')) {
      return $this->getInt('language');
    }
    return (int)Context::getContext()->language->id;
  }

  private function getShop() {
    if ($this->hasOption('shop')) {
      return $this->getInt('shop');
    }
    return (int)Context::getContext()->shop->id;
  }

}
