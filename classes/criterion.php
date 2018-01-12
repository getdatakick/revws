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
use \Shop;

class Criterion {
  private $id;
  private $label;

  private function __construct($id, $label) {
    $this->id = $id;
    $this->label = $label;
  }

  public static function getCriteria($idLang) {
    $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
    $id = (int)$idLang;
    $criterion = _DB_PREFIX_ . 'revws_criterion';
    $lang = _DB_PREFIX_ . 'revws_criterion_lang';
    $query = "SELECT c.id_criterion, l.label FROM $criterion c INNER JOIN $lang l ON (c.id_criterion = l.id_criterion AND l.id_lang=$id)";
    $dbData = $conn->executeS($query);
    $criteria = [];
    if ($dbData) {
      foreach ($dbData as $row) {
        $criteria[] = [
          'id' => (int)$row['id_criterion'],
          'label' => $row['label']
        ];
      }
    }
    return $criteria;
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
        FROM $criterion c WHERE c.active=1 AND c.global=1
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

}
