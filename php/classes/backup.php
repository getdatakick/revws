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
use \DOMDocument;
use \Language;
use \Context;

class Backup {
  private $settings;
  private $options;

  public function __construct(Settings $settings, $options=[]) {
    $this->options = $options;
    $this->settings = $settings;
  }

  public function getXml() {
    $domtree = new DOMDocument('1.0', 'UTF-8');
    $domtree->formatOutput = true;
    $xmlRoot = $domtree->createElement("revws");
    $xmlRoot = $domtree->appendChild($xmlRoot);
    $version = $domtree->createAttribute('version');
    $version->value = '1.0';
    $xmlRoot->appendChild($version);

    $criteriaNode = $domtree->createElement("criteria");
    $criteriaNode = $xmlRoot->appendChild($criteriaNode);

    $reviewsNode = $domtree->createElement("reviews");
    $reviewsNode = $xmlRoot->appendChild($reviewsNode);

    foreach (RevwsCriterion::getFullCriteria() as $crit) {
      $criteriaNode->appendChild($this->addCriterion($crit, $domtree));
    }
    $data = RevwsReview::findReviews($this->settings, array_merge($this->options, [
      'entityInfo' => true,
      'customerInfo' => true,
      'allLanguages' => true,
      'order' => [
        'field' => 'id',
        'direction' => 'asc'
      ]
    ]));
    foreach ($data['reviews'] as $rev) {
      $reviewsNode->appendChild($this->addReview($rev, $domtree));
    }
    return $domtree->saveXML();
  }

  public function addCriterion($crit, $domtree) {
    $node = $domtree->createElement("criterion");

    $id = $domtree->createAttribute('id');
    $id->value = $crit->id;
    $node->appendChild($id);

    $active = $domtree->createAttribute('active');
    $active->value = $crit->active ? 'true' : 'false';
    $node->appendChild($active);

    $global = $domtree->createAttribute('global');
    $global->value = $crit->global ? 'true' : 'false';
    $node->appendChild($global);

    $label = $domtree->createAttribute('label');
    $curLang = self::getCurrentLanguage();
    $curLangLabel = isset($crit->label[$curLang]) ? $crit->label[$curLang] : "";
    $label->value = $curLangLabel;
    $node->appendChild($label);

    $labels = $domtree->createElement('translations');
    $hasTranslations = false;
    foreach ($crit->label as $key=>$value) {
      if ($key != $curLang && $value != $curLangLabel) {
        $hasTranslations = true;
        $lang = self::getLanguage($key);
        $label = $domtree->createElement($lang);
        $text = $domtree->createTextNode($value);
        $label->appendChild($text);
        $labels->appendChild($label);
      }
    }
    if ($hasTranslations) {
      $node->appendChild($labels);
    }

    if ($crit->products) {
      $products = $domtree->createElement('products');
      $node->appendChild($products);

      foreach ($crit->products as $productId) {
        $product = $domtree->createElement('product');
        $id = $domtree->createAttribute('id');
        $id->value = $productId;
        $product->appendChild($id);
        $products->appendChild($product);
      }
    }

    if ($crit->categories) {
      $categories = $domtree->createElement('categories');
      $node->appendChild($categories);

      foreach ($crit->categories as $categoryId) {
        $category = $domtree->createElement('category');
        $id = $domtree->createAttribute('id');
        $id->value = $categoryId;
        $category->appendChild($id);
        $categories->appendChild($category);
      }
    }

    return $node;
  }


  public function addReview($rev, $domtree) {
    $node = $domtree->createElement("review");

    $id = $domtree->createAttribute('id');
    $id->value = $rev->id;
    $node->appendChild($id);

    $lang = $domtree->createAttribute('language');
    $lang->value = self::getLanguage($rev->id_lang);
    $node->appendChild($lang);

    $approved = $domtree->createAttribute('approved');
    $approved->value = $rev->validated ? 'true' : 'false';
    $node->appendChild($approved);

    $deleted = $domtree->createAttribute('deleted');
    $deleted->value = $rev->deleted ? 'true' : 'false';
    $node->appendChild($deleted);

    $created = $domtree->createAttribute('created');
    $created->value = \date(\DateTime::ATOM, \strtotime($rev->date_add));
    $node->appendChild($created);

    if ($rev->entity_type === 'product') {
      $product = $domtree->createElement('product');
      $id = $domtree->createAttribute('id');
      $id->value = $rev->id_entity;
      $product->appendChild($id);
      $name = $domtree->createAttribute('name');
      $name->value = $rev->product;
      $product->appendChild($name);
      $node->appendChild($product);
    }

    $author = $domtree->createElement('author');
    $id = $domtree->createAttribute('id');
    $id->value = $rev->getAuthorId();
    $author->appendChild($id);
    $type = $domtree->createAttribute('type');
    $type->value = $rev->getAuthorType();
    $author->appendChild($type);
    $name = $domtree->createAttribute('name');
    $name->value = $rev->isCustomer() ? $rev->customer : $rev->display_name;
    $author->appendChild($name);
    $email = $domtree->createAttribute('email');
    $email->value = $rev->email;
    $author->appendChild($email);
    $verified = $domtree->createAttribute('verified');
    $verified->value = $rev->verified_buyer ? 'true' : 'false';
    $author->appendChild($verified);
    $node->appendChild($author);

    $title = $domtree->createElement('title');
    $title->appendChild($domtree->createTextNode($rev->title));
    $node->appendChild($title);

    $displayName = $domtree->createElement('display-name');
    $displayName->appendChild($domtree->createTextNode($rev->display_name));
    $node->appendChild($displayName);

    $content = $domtree->createElement('content');
    if ($rev->content) {
      $content->appendChild($domtree->createCDATASection($rev->content));
    }
    $node->appendChild($content);

    $reply = $domtree->createElement('reply');
    if ($rev->reply) {
      $reply->appendChild($domtree->createCDATASection($rev->reply));
    }
    $node->appendChild($reply);

    $ratings = $domtree->createElement('ratings');
    foreach ($rev->grades as $key => $value) {
      $rating = $domtree->createElement('rating');
      $crit = $domtree->createAttribute('criterion');
      $crit->value = $key;
      $rating->appendChild($crit);
      $val = $domtree->createAttribute('value');
      $val->value = $value;
      $rating->appendChild($val);
      $ratings->appendChild($rating);
    }
    $node->appendChild($ratings);

    return $node;
  }

  private static function getLanguage($id) {
    return Language::getLanguage($id)['iso_code'];
  }

  private static function getCurrentLanguage() {
    return Context::getContext()->language->id;
  }
}
