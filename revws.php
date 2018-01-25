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
define('REVWS_MODULE_DIR', dirname(__FILE__));

require_once __DIR__.'/classes/utils.php';
require_once __DIR__.'/classes/settings.php';
require_once __DIR__.'/classes/permissions.php';
require_once __DIR__.'/classes/visitor-permissions.php';
require_once __DIR__.'/classes/employee-permissions.php';
require_once __DIR__.'/classes/shapes.php';
require_once __DIR__.'/classes/visitor.php';
require_once __DIR__.'/classes/review-query.php';
require_once __DIR__.'/classes/notifications.php';
require_once __DIR__.'/classes/actor.php';
require_once __DIR__.'/classes/front-app.php';

require_once __DIR__.'/model/criterion.php';
require_once __DIR__.'/model/review.php';

use \Revws\Settings;
use \Revws\Permissions;
use \Revws\VisitorPermissions;
use \Revws\EmployeePermissions;
use \Revws\Visitor;
use \Revws\Shapes;
use \Revws\Utils;
use \Revws\FrontApp;


class Revws extends Module {
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
      $this->registerHook('customerAccount') &&
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
    $this->unregisterHook('customerAccount');
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
    return Settings::getInstance();
  }

  public function getVisitor() {
    if (! $this->visitor) {
      $this->visitor = new Visitor($this->context, $this->getSettings());
    }
    return $this->visitor;
  }

  public function getPermissions() {
    if (! $this->permissions) {
      if (isset($this->context->employee) && $this->context->employee->id > 0) {
        $this->permissions = new EmployeePermissions();
      } else {
        $this->permissions = new VisitorPermissions($this->getSettings(), $this->getVisitor());
      }
    }
    return $this->permissions;
  }

  private function assignReviewsData($productId) {
    $frontApp = new FrontApp($this);
    $reviewsData = $frontApp->getData('product', $productId);
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
      list($grade, $count) = RevwsReview::getAverageGrade($productId);
      $this->context->smarty->assign('productId', $productId);
      $this->context->smarty->assign('grade', $grade);
      $this->context->smarty->assign('reviewCount', $count);
      $this->context->smarty->assign('shape', $this->getShapeSettings());
      $this->context->smarty->assign('shapeSize', $this->getSettings()->getShapeSize());
      $this->context->smarty->assign('canCreate', $this->getPermissions()->canCreateReview($productId));
      return $this->display(__FILE__, 'product_extra.tpl');
    }
  }

  public function hookDisplayProductListReviews($params) {
    if ($this->getSettings()->showOnProductListing()) {
      $productId = (int) $params['product']['id_product'];
      list($grade, $count) = RevwsReview::getAverageGrade($productId);
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
        $averages[$productId] = RevwsReview::getAverageGrade($productId);
      }
      $this->context->smarty->assign('averages', $averages);
      $this->context->smarty->assign('shape', $this->getShapeSettings());
      $this->context->smarty->assign('shapeSize', $this->getSettings()->getShapeSize());
      $this->context->smarty->assign('list_ids_product', $params['list_ids_product']);
      return $this->display(__FILE__, 'products_comparison.tpl');
    }
  }

  public function hookCustomerAccount($params) {
    if ($this->getSettings()->showOnCustomerAccount()) {
      return $this->display(__FILE__, 'my-account.tpl');
    }
  }

  public function getContext() {
    return $this->context;
  }

  public function getPath($relative) {
    return $this->_path . $relative;
  }

}
