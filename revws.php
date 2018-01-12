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
require_once __DIR__.'/classes/settings.php';
require_once __DIR__.'/classes/visitor.php';
require_once __DIR__.'/classes/permissions.php';
require_once __DIR__.'/classes/review.php';
require_once __DIR__.'/classes/criterion.php';
require_once __DIR__.'/classes/shapes.php';

use \Revws\Settings;
use \Revws\Permissions;
use \Revws\Visitor;
use \Revws\Review;
use \Revws\Shapes;
use \Revws\Criterion;

class Revws extends Module {
  private $settings;
  private $permissions;
  private $visitor;

  public function __construct() {
    $this->name = 'revws';
    $this->tab = 'administration';
    $this->version = '0.0.1';
    $this->author = 'DataKick <petr@getdatakick.com>';
    $this->need_instance = 0;
    $this->bootstrap = true;
    parent::__construct();
    $this->displayName = $this->l('Product Reviews');
    $this->description = $this->l('Product Reviews module');
    $this->confirmUninstall = $this->l('Are you sure you want to uninstall the module? All its data will be lost!');
    $this->ps_versions_compliancy = array('min' => '1.6', 'max' => _PS_VERSION_);
  }

  public function install($createTables=true) {
    return (
      parent::install() &&
      $this->installDb($createTables) &&
      $this->installTab() &&
      $this->registerHooks() &&
      $this->getSettings()->init()
    );
  }

  public function uninstall($dropTables=true) {
    return (
      $this->uninstallDb($dropTables) &&
      $this->unregisterHooks() &&
      $this->removeTab() &&
      $this->getSettings()->remove() &&
      parent::uninstall()
    );
  }

  public function reset() {
    return (
      $this->uninstall(false) &&
      $this->install(false)
    );
  }

  public function registerHooks() {
    return (
      $this->registerHook('productTab') &&
      $this->registerHook('header') &&
      $this->registerHook('productTabContent') &&
      $this->registerHook('displayRightColumnProduct') &&
      $this->registerHook('displayProductListReviews') &&
      $this->registerHook('extraProductComparison') &&
      $this->registerHook('productFooter')
    );
  }

  public function unregisterHooks() {
    $this->unregisterHook('productTab');
    $this->unregisterHook('header');
    $this->unregisterHook('productTabContent');
    $this->unregisterHook('displayRightColumnProduct');
    $this->unregisterHook('displayProductListReviews');
    $this->unregisterHook('extraProductComparison');
    $this->unregisterHook('productFooter');
    return true;
  }

  private function installDb($create) {
    if (! $create) {
      return true;
    }
    return $this->executeSqlScript('install');
  }

  private function uninstallDb($drop) {
    if (! $drop) {
      return true;
    }
    return $this->executeSqlScript('uninstall');
  }

  private function executeSqlScript($script) {
    $file = dirname(__FILE__) . '/sql/' . $script . '.sql';
    if (! file_exists($file)) {
      return false;
    }
    $sql = file_get_contents($file);
    if (! $sql) {
      return false;
    }
    $sql = str_replace(['PREFIX_', 'ENGINE_TYPE', 'CHARSET_TYPE'], [_DB_PREFIX_, _MYSQL_ENGINE_, 'utf8'], $sql);
    $sql = preg_split("/;\s*[\r\n]+/", $sql);
    foreach ($sql as $statement) {
      $stmt = trim($statement);
      if ($stmt) {
        if (!Db::getInstance()->execute($stmt)) {
          return false;
        }
      }
    }
    return true;
  }

  public function getContent() {
    Tools::redirectAdmin($this->context->link->getAdminLink('AdminRevwsBackend').'#/settings');
  }

  private function installTab() {
    $tab = new Tab();
    $tab->active = 1;
    $tab->class_name = 'AdminRevwsBackend';
    $tab->module = $this->name;
    $tab->id_parent = $this->getTabParent();
    $tab->name = array();
    foreach (Language::getLanguages(true) as $lang) {
      $tab->name[$lang['id_lang']] = 'Product reviews';
    }
    return $tab->add();
  }

  private function removeTab() {
    $tabId = Tab::getIdFromClassName('AdminRevwsBackend');
    if ($tabId) {
      $tab = new Tab($tabId);
      return $tab->delete();
    }
    return true;
  }

  private function getTabParent() {
    return 0;
  }

  public function getSettings() {
    if (! $this->settings) {
      $this->settings = new Settings();
    }
    return $this->settings;
  }

  public function getVisitor() {
    if (! $this->visitor) {
      $this->visitor = new Visitor($this->context, $this->getSettings());
    }
    return $this->visitor;
  }

  public function getPermissions() {
    if (! $this->permissions) {
      $this->permissions = new Permissions($this->getSettings(), $this->getVisitor());
    }
    return $this->permissions;
  }

  private function getProductData($productId) {
    $product = new \Product($productId);
    $lang = $this->context->language->id;
    $productName = $product->getProductName($product->id);
    $link = $this->context->link;
    $res = $product->getCover($lang);
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
      'criteria' => Criterion::getByProduct($productId),
    ];
  }

  private function assignReviewsData($productId) {
    $visitor = $this->getVisitor();
    $perms = $this->getPermissions();
    $set = $this->getSettings();
    $reviews = [];
    foreach (Review::getByProduct($productId, $visitor) as $review) {
      $reviews[] = $review->toJSData($perms);
    }
    $reviewsData = [
      'product' => $this->getProductData($productId),
      'reviews' => $reviews,
      'visitor' => [
        'type' => $visitor->getType(),
        'displayName' => $visitor->getDisplayName(),
        'email' => $visitor->getEmail()
      ],
      'permissions' => [
        'create' => $perms->canCreateReview($productId)
      ],
      'api' => $this->context->link->getModuleLink('revws', 'api', [], true),
      'appJsUrl' => $set->getAppUrl($this->context, $this->name),
      'theme' => [
        'shape' => $this->getShapeSettings(),
        'shapeSize' => [
          'product' => $set->getShapeSize(),
          'list' => $set->getShapeSize(),
          'create' => $set->getShapeSize() * 5
        ]
      ],
      'criteria' => Criterion::getCriteria($this->context->language->id_lang),
      'preferences' => [
        'allowEmptyReviews' => $set->allowEmptyReviews()
      ]
    ];
    $this->context->smarty->assign('reviewsData', $reviewsData);
  }

  private function getShapeSettings() {
    return Shapes::getShape($this->getSettings()->getShape());
  }

  public function hookProductTab() {
    if ($this->getSettings()->getPlacement() === 'tab') {
      return $this->display(__FILE__, 'product_tab_header.tpl');
    }
  }

  public function hookProductTabContent() {
    if ($this->getSettings()->getPlacement() === 'tab') {
      $this->context->controller->addJS($this->_path.'views/js/front_bootstrap.js');
      $this->assignReviewsData((int)(Tools::getValue('id_product')));
      return $this->display(__FILE__, 'product_tab_content.tpl');
    }
  }

  public function hookProductFooter() {
    if ($this->getSettings()->getPlacement() === 'block') {
      $this->context->controller->addJS($this->_path.'views/js/front_bootstrap.js');
      $this->assignReviewsData((int)(Tools::getValue('id_product')));
      return $this->display(__FILE__, 'product_footer.tpl');
    }
  }

  public function hookHeader() {
    $this->context->controller->addCSS($this->_path.'views/css/front.css', 'all');
    $this->context->controller->addCSS('https://fonts.googleapis.com/css?family=Roboto:300,400,500', 'all');
  }


  public function hookDisplayRightColumnProduct($params) {
    if ($this->getSettings()->showAverageOnProductPage()) {
      $productId = (int)(Tools::getValue('id_product'));
      list($grade, $count) = Review::getAverageGrade($productId);
      $this->context->smarty->assign('productId', $productId);
      $this->context->smarty->assign('grade', $grade);
      $this->context->smarty->assign('reviewCount', $count);
      $this->context->smarty->assign('shape', $this->getShapeSettings());
      $this->context->smarty->assign('shapeSize', $this->getSettings()->getShapeSize());
      return $this->display(__FILE__, 'product_extra.tpl');
    }
  }

  public function hookDisplayProductListReviews($params) {
    if ($this->getSettings()->showOnProductListing()) {
      $productId = (int) $params['product']['id_product'];
      list($grade, $count) = Review::getAverageGrade($productId);
      if ($count > 0) {
        $this->context->smarty->assign('productId', $productId);
        $this->context->smarty->assign('grade', $grade);
        $this->context->smarty->assign('reviewCount', $count);
        $this->context->smarty->assign('shape', $this->getShapeSettings());
        $this->context->smarty->assign('shapeSize', $this->getSettings()->getShapeSize());
        return $this->display(__FILE__, 'product_list.tpl');
      }
    }
  }

  public function hookExtraProductComparison($params) {
    if ($this->getSettings()->showOnProductComparison()) {
      $averages = [];
      foreach ($params['list_ids_product'] as $idProduct) {
        $productId = (int)$idProduct;
        $averages[$productId] = Review::getAverageGrade($productId);
      }
      $this->context->smarty->assign('averages', $averages);
      $this->context->smarty->assign('shape', $this->getShapeSettings());
      $this->context->smarty->assign('shapeSize', $this->getSettings()->getShapeSize());
      $this->context->smarty->assign('list_ids_product', $params['list_ids_product']);
      return $this->display(__FILE__, 'products_comparison.tpl');
    }
  }

}
