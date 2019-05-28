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

use \Revws\Utils;

class RevwsCriterion extends ObjectModel {

  public static $definition = [
    'table'   => 'revws_criterion',
    'primary' => 'id_criterion',
    'multilang' => true,
    'fields'  => [
      'global'      => [ 'type' => self::TYPE_BOOL, 'validate' => 'isBool' ],
      'active'      => [ 'type' => self::TYPE_BOOL, 'validate' => 'isBool' ],
      'entity_type' => [ 'type' => self::TYPE_STRING, 'validate' => 'isString', 'required' => true ],
      'label'       => ['type' => self::TYPE_STRING, 'lang' => true, 'validate' => 'isGenericName', 'required' => true, 'size' => 128]
    ],
  ];

  public $global;
  public $active;
  public $label;
  public $entity_type;
  public $products = [];
  public $categories = [];

  public static function getCriteria($idLang) {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $idLang = (int)$idLang;
    $criterion = _DB_PREFIX_ . 'revws_criterion';
    $lang = _DB_PREFIX_ . 'revws_criterion_lang';
    $query = ("
      SELECT c.id_criterion, c.global, c.active, l.label, c.entity_type
      FROM $criterion c
      INNER JOIN $lang l ON (c.id_criterion = l.id_criterion AND l.id_lang=$idLang)
      WHERE c.active = 1
      ORDER BY c.entity_type, c.id_criterion
    ");
    $dbData = $conn->executeS($query);
    $criteria = [];
    if ($dbData) {
      foreach ($dbData as $row) {
        $id = (int)$row['id_criterion'];
        $criteria[$id] = [
          'id' => $id,
          'entityType' => $row['entity_type'],
          'global' => !!$row['global'],
          'active' => !!$row['active'],
          'label' => $row['label'],
        ];
      }
    }
    return $criteria;
  }

  public static function getFullCriteria() {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $criterion = _DB_PREFIX_ . 'revws_criterion';
    $lang = _DB_PREFIX_ . 'revws_criterion_lang';
    $query = ("
      SELECT c.id_criterion, c.global, c.active, l.id_lang, l.label, c.entity_type
      FROM $criterion c
      INNER JOIN $lang l ON (c.id_criterion = l.id_criterion)
    ");
    $dbData = $conn->executeS($query);
    $criteria = [];
    if ($dbData) {
      foreach ($dbData as $row) {
        $id = (int)$row['id_criterion'];
        $label = $row['label'];
        $lang = $row['id_lang'];
        if (isset($criteria[$id])) {
          $criteria[$id]->label[$lang] = $label;
        } else {
          $crit = new RevwsCriterion();
          $crit->id = $id;
          $crit->global = (bool)$row['global'];
          $crit->active = (bool)$row['active'];
          $crit->entity_type = $row['entity_type'];
          $crit->label = [ $lang => $label ];
          $criteria[$id] = $crit;
        }
      }
    }
    // load product / category associations
    self::addProductAssociations($criteria);
    self::addCategoryAssociations($criteria);
    return $criteria;
  }

  public static function getByEntity($entityType, $entityId) {
    if ($entityType === 'product') {
      return static::getByProduct($entityId);
    }
    throw new Exception("Invalid entity type: $entityType");
  }

  public static function getByProduct($productId) {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $id = (int)$productId;
    $shop = (int)Shop::getContextShopID();
    $product = _DB_PREFIX_ . 'product_shop';
    $criterion = _DB_PREFIX_ . 'revws_criterion';
    $cc = _DB_PREFIX_ . 'revws_criterion_category';
    $cp = _DB_PREFIX_ . 'revws_criterion_product';
    $query = "
      SELECT c.id_criterion AS id
        FROM $criterion c WHERE c.active=1 AND c.global=1 AND c.entity_type='product'
      UNION
      SELECT DISTINCT c.id_criterion
        FROM $product ps
        INNER JOIN $cc cc ON (cc.id_category = ps.id_category_default)
        INNER JOIN $criterion c ON (cc.id_criterion = c.id_criterion)
        WHERE c.active=1 AND ps.id_product=$id AND ps.id_shop=$shop
      UNION
      SELECT DISTINCT c.id_criterion
        FROM $product ps
        INNER JOIN $cp cp ON (cp.id_product = ps.id_product)
        INNER JOIN $criterion c ON (cp.id_criterion = c.id_criterion)
        WHERE c.active=1 AND ps.id_product=$id AND ps.id_shop=$shop" ;
    $dbData = $conn->executeS($query);
    $criterions = [];
    if ($dbData) {
      foreach ($dbData as $row) {
        $criterions[] = (int)$row['id'];
      }
    }
    return $criterions;
  }

  public function delete() {
    $ret = parent::delete();
    $ret &= $this->deleteProductAssociation();
    $ret &= $this->deleteCategoryAssociation();
    $ret &= $this->deleteReviews();
    return $ret;
  }

  public function save($nullValues = false, $autoDate = true) {
    $ret = parent::save($nullValues, $autoDate);
    $ret &= $this->saveProductAssociations();
    $ret &= $this->saveCategoryAssociations();
    return $ret;
  }

  public function saveProductAssociations() {
    $this->deleteProductAssociation();
    $id = (int)$this->id;
    $conn = Db::getInstance();
    foreach ($this->products as $productId) {
      $conn->insert('revws_criterion_product', [
        'id_criterion' => $id,
        'id_product' => (int)$productId,
      ]);
    }
    return true;
  }

  public function saveCategoryAssociations() {
    $this->deleteCategoryAssociation();
    $id = (int)$this->id;
    $conn = Db::getInstance();
    foreach ($this->categories as $categoryId) {
      $conn->insert('revws_criterion_category', [
        'id_criterion' => $id,
        'id_category' => (int)$categoryId,
      ]);
    }
    return true;
  }

  public function deleteProductAssociation($id=null) {
    $id = (int)(is_null($id) ? $this->id : $id);
    return Db::getInstance()->delete('revws_criterion_product', "id_criterion = $id");
  }

  public function deleteCategoryAssociation($id=null) {
    $id = (int)(is_null($id) ? $this->id : $id);
    return Db::getInstance()->delete('revws_criterion_category', "id_criterion = $id");
  }

  public function deleteReviews($id=null) {
    $id = (int)(is_null($id) ? $this->id : $id);
    return Db::getInstance()->delete('revws_review_grade', "id_criterion = $id");
  }

  public static function fromJson($json) {
    $id = isset($json['id']) ? (int)$json['id'] : null;
    if ($id === -1) {
      $id = null;
    }
    $crit = new RevwsCriterion($id);
    $crit->label = $json['label'];
    $crit->active = (bool)$json['active'];
    $crit->global = (bool)$json['global'];
    $crit->entity_type = $json['entityType'];
    $crit->products = isset($json['products']) ? $json['products'] : [];
    $crit->categories = isset($json['categories']) ? $json['categories'] : [];
    return $crit;
  }

  public function toJson() {
    return self::toJSData($this);
  }

  public static function toJSData($crit) {
    return [
      'id' => (int)$crit->id,
      'global' => (bool)$crit->global,
      'active' => (bool)$crit->active,
      'label' => Utils::toKeyValue($crit->label),
      'entityType' => $crit->entity_type,
      'products' => Utils::toIntArray($crit->products),
      'categories' => Utils::toIntArray($crit->categories)
    ];
  }

  private static function addProductAssociations($crits) {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $shop = (int)Shop::getContextShopID();
    $ps = _DB_PREFIX_ . 'product_shop';
    $pl = _DB_PREFIX_ . 'product_lang';
    $cp = _DB_PREFIX_ . 'revws_criterion_product';
    $query = "
      SELECT cp.id_criterion, ps.id_product
        FROM $ps ps
        INNER JOIN $cp cp ON (cp.id_product = ps.id_product)
        WHERE ps.id_shop=$shop";
    $dbData = $conn->executeS($query);
    if ($dbData) {
      foreach ($dbData as $row) {
        $id = (int)$row['id_criterion'];
        $productId = (int)$row['id_product'];
        if (isset($crits[$id])) {
          $crit = $crits[$id];
          $crit->products[] = $productId;
        }
      }
    }
  }

  private static function addCategoryAssociations($crits) {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $shop = (int)Shop::getContextShopID();
    $cs = _DB_PREFIX_ . 'category_shop';
    $cc = _DB_PREFIX_ . 'revws_criterion_category';
    $query = "
      SELECT cc.id_criterion, cs.id_category
        FROM $cs cs
        INNER JOIN $cc cc ON (cc.id_category = cs.id_category)
        WHERE cs.id_shop=$shop";
    $dbData = $conn->executeS($query);
    if ($dbData) {
      foreach ($dbData as $row) {
        $id = (int)$row['id_criterion'];
        $catId = (int)$row['id_category'];
        if (isset($crits[$id])) {
          $crit = $crits[$id];
          $crit->categories[] = $catId;
        }
      }
    }
  }

}
