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

require_once __DIR__.'/app-translation.php';
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

class Revws extends Module {
  private $permissions;
  private $visitor;

  public function __construct() {
    $this->name = 'revws';
    $this->tab = 'administration';
    $this->version = '1.0.4';
    $this->author = 'DataKick <petr@getdatakick.com>';
    $this->need_instance = 0;
    $this->bootstrap = true;
    parent::__construct();
    $this->displayName = $this->l('Product Reviews');
    $this->description = $this->l('Product Reviews module');
    $this->confirmUninstall = $this->l('Are you sure you want to uninstall the module? All its data will be lost!');
    $this->ps_versions_compliancy = array('min' => '1.6', 'max' => '1.6.999');
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
    echo "<pre>";
    $this->registerHooks();
    die();
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
    return $this->setupHooks([
      'header',
      'productTab',
      'productTabContent',
      'displayRightColumnProduct',
      'displayProductListReviews',
      'extraProductComparison',
      'displayCustomerAccount',
      'displayMyAccountBlock',
      'productFooter',
      'discoverReviewModule',
      'datakickExtend'
    ]);
  }

  public function unregisterHooks() {
    return $this->setupHooks([]);
  }

  private function setupHooks($hooks) {
    $id = $this->id;
    $wanted = [];
    foreach ($hooks as $hook) {
      $wanted[strtolower($hook)] = $hook;
    }
    $sql = 'SELECT DISTINCT LOWER(h.name) AS `hook` FROM '._DB_PREFIX_.'hook h INNER JOIN '._DB_PREFIX_.'hook_module hm ON (h.id_hook = hm.id_hook) WHERE hm.id_module = '.(int)$id;
    $delete = [];
    foreach (Db::getInstance()->executeS($sql) as $row) {
      $hook = $row['hook'];
      if (! isset($wanted['hook'])) {
        $delete[] = $hook;
      }
    }
    print_r($wanted);
    print_r($delete);
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

  public function executeSqlScript($script) {
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
    $catalog = Tab::getIdFromClassName('AdminCatalog');
    if ($catalog !== false) {
      return $catalog;
    }
    return 0;
  }

  public function getSettings() {
    return \Revws\Settings::getInstance();
  }

  public function getVisitor() {
    if (! $this->visitor) {
      $this->visitor = new \Revws\Visitor($this->context, $this->getSettings());
    }
    return $this->visitor;
  }

  public function getPermissions() {
    if (! $this->permissions) {
      if (isset($this->context->employee) && $this->context->employee->id > 0) {
        $this->permissions = new \Revws\EmployeePermissions();
      } else {
        $this->permissions = new \Revws\VisitorPermissions($this->getSettings(), $this->getVisitor());
      }
    }
    return $this->permissions;
  }

  private function assignReviewsData($productId) {
    $frontApp = new \Revws\FrontApp($this);
    $reviewsData = $frontApp->getData('product', $productId);
    $this->context->smarty->assign('reviewsData', $reviewsData);
    $this->context->smarty->assign('microdata', $this->getSettings()->emitRichSnippets());
    Media::addJsDef([ 'revwsData' => $reviewsData ]);
    return $reviewsData;
  }

  private function getShapeSettings() {
    return \Revws\Shapes::getShape($this->getSettings()->getShape());
  }

  public function hookProductTab() {
    if ($this->getSettings()->getPlacement() === 'tab') {
      return $this->display(__FILE__, 'product_tab_header.tpl');
    }
  }

  public function hookProductTabContent() {
    $set = $this->getSettings();
    if ($this->getSettings()->getPlacement() === 'tab') {
      $this->context->controller->addJS($this->getPath('views/js/front_bootstrap.js?CACHE_CONTROL'));
      $reviewsData = $this->assignReviewsData((int)(Tools::getValue('id_product')));
      $emptyReviews = $reviewsData['reviews']['total'] == 0;
      $canCreate = $reviewsData['canCreate'];
      if ($emptyReviews && !$canCreate && $this->getVisitor()->isGuest() && $set->hideEmptyReviews()) {
        return;
      }
      return $this->display(__FILE__, 'product_tab_content.tpl');
    }
  }

  public function hookProductFooter() {
    $set = $this->getSettings();
    if ($set->getPlacement() === 'block') {
      $this->context->controller->addJS($this->getPath('views/js/front_bootstrap.js?CACHE_CONTROL'));
      $reviewsData = $this->assignReviewsData((int)(Tools::getValue('id_product')));
      $emptyReviews = $reviewsData['reviews']['total'] == 0;
      $canCreate = $reviewsData['canCreate'];
      if ($emptyReviews && !$canCreate && $this->getVisitor()->isGuest() && $set->hideEmptyReviews()) {
        return;
      }
      return $this->display(__FILE__, 'product_footer.tpl');
    }
  }

  public function hookHeader() {
    $this->includeCommonStyles($this->context->controller);
  }

  public function hookDisplayRightColumnProduct($params) {
    $set = $this->getSettings();
    if ($set->showAverageOnProductPage()) {
      $productId = (int)(Tools::getValue('id_product'));
      list($grade, $count) = RevwsReview::getAverageGrade($productId);
      $this->context->smarty->assign('productId', $productId);
      $this->context->smarty->assign('grade', $grade);
      $this->context->smarty->assign('reviewCount', $count);
      $this->context->smarty->assign('shape', $this->getShapeSettings());
      $this->context->smarty->assign('shapeSize', $this->getSettings()->getShapeSize());
      $this->context->smarty->assign('canCreate', $this->getPermissions()->canCreateReview($productId));
      $this->context->smarty->assign('isGuest', $this->getVisitor()->isGuest());
      $this->context->smarty->assign('loginLink', $this->getLoginUrl($productId));
      $this->context->smarty->assign('microdata', $this->getSettings()->emitRichSnippets());
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
        $this->context->smarty->assign('reviewsUrl', $this->getProductReviewsLink($productId));
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

  public function hookDisplayCustomerAccount($params) {
    if ($this->getSettings()->showOnCustomerAccount()) {
      $this->context->smarty->assign('iconClass', $this->getSettings()->getCustomerAccountIcon());
      return $this->display(__FILE__, 'my-account.tpl');
    }
  }


  public function hookDisplayMyAccountBlock($params) {
    return $this->hookDisplayCustomerAccount($params);
  }


  public function getContext() {
    return $this->context;
  }

  public function getPath($relative) {
    return $this->getPathUri() . $relative;
  }

  public static function getReviewUrl($context, $productId) {
    return $context->link->getModuleLink('revws', 'MyReviews', ['review-product' => (int)$productId ]);
  }

  public function hookDiscoverReviewModule() {
    return [
      'name' => $this->name,
      'getReviewUrl' => ['Revws', 'getReviewUrl'],
      'canReviewProductSqlFragment' => ['RevwsReview', 'canReviewProductSqlFragment'],
    ];
  }

  public function hookDataKickExtend($params) {
    require_once(__DIR__.'/classes/integration/datakick.php');
    return \Revws\DatakickIntegration::integrate($params);
  }

  public function clearCache() {
    $this->_clearCache('product-list.tpl');
  }

  public function getFrontTranslations() {
    $translations = new \Revws\AppTranslation($this);
    return $translations->getFrontTranslations();
  }

  public function getBackTranslations() {
    $translations = new \Revws\AppTranslation($this);
    return $translations->getBackTranslations();
  }

  public function includeCommonStyles($controller) {
    if (file_exists(_PS_THEME_DIR_."css/modules/{$this->name}/{$this->name}.css")) {
        $controller->addCSS(_PS_THEME_DIR_."css/modules/{$this->name}/{$this->name}.css", 'all');
    } else {
        $controller->addCSS($this->getPath('views/css/front.css'), 'all');
    }
    $controller->addCSS('https://fonts.googleapis.com/css?family=Roboto:300,400,500', 'all');
  }

  private function getProductReviewsLink($product) {
    $link = $this->context->link->getProductLink($product);
    if (strpos($link, '?') === false) {
      $link .= '?show=reviews';
    } else {
      $link .= '&show=reviews';
    }
    return $link;
  }

  private function getMyReviewsUrl() {
    return $this->context->link->getModuleLink('revws', 'MyReviews');
  }

  public function getLoginUrl($product) {
    $back = $product ? $this->getProductReviewsLink($product) : $this->getMyReviewsUrl();
    return $this->context->link->getPageLink('authentication', true, null, [
      'back' => $back
    ]);
  }

}
