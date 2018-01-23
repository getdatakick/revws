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
use \Product;
use \Validate;
use \Exception;
use \ImageType;
use \Context;
use \RevwsCriterion;

class Utils {

  public static function toKeyValue($arr) {
    return self::mapKeyValue('@key', '@identity', $arr);
  }

  public static function mapKeyValue($keyField, $valueField, $arr) {
    $ret = [];
    foreach ($arr as $key => $fields) {
      if ($keyField === '@key') {
        $id = (int)$key;
      } else {
        $id = (int)$fields[$keyField];
      }
      if ($valueField === '@identity') {
        $value = $fields;
      } else {
        $value = $fields[$valueField];
      }
      $ret[$id] = $value;
    }
    return $ret;
  }


  public static function toIntArray($arr) {
    return array_map('intval', $arr);
  }

  public static function getMailsDirectory() {
    return REVWS_MODULE_DIR . DIRECTORY_SEPARATOR . 'mails' . DIRECTORY_SEPARATOR;
  }

  public static function calculateAverage($grades) {
    $cnt = count($grades);
    if ($cnt) {
      return array_sum($grades) / $cnt;
    }
    return 0;
  }

  public static function getProductData($productId, $lang) {
    $productId = (int)$productId;
    $lang = (int)$lang;
    $context = Context::getContext();
    $product = new Product($productId);
    if (! Validate::isLoadedObject($product)) {
      throw new Exception("Product $productId not found");
    }
    $productName = $product->name[$lang];
    $link = $context->link;
    $res = Product::getCover($productId, $context);
    $image = null;
    if ($res) {
      $imageId = (int)$res['id_image'];
      $rewrite = $product->link_rewrite[$lang];
      $image = $link->getImageLink($rewrite, $imageId, ImageType::getFormatedName('home'));
    }
    return [
      'id' => $productId,
      'name' => $productName,
      'url' => $product->getLink(),
      'image' => $image,
      'criteria' => RevwsCriterion::getByProduct($productId)
    ];
  }

  public static function getRandomData() {
    if (function_exists('random_bytes'))
      return bin2hex(random_bytes(16));
    if (function_exists('openssl_random_pseudo_bytes'))
      return bin2hex(openssl_random_pseudo_bytes(16));
    return bin2hex(substr(hex2bin(sha1(uniqid('rd'.rand(), true))), 0, 16));
  }
}
