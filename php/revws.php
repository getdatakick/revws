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

define('REVWS_MODULE_DIR', dirname(__FILE__));

require_once __DIR__.'/app-translation.php';
require_once __DIR__.'/classes/csrf.php';
require_once __DIR__.'/classes/csv-reader.php';
require_once __DIR__.'/classes/color.php';
require_once __DIR__.'/classes/utils.php';
require_once __DIR__.'/classes/gdpr/interface.php';
require_once __DIR__.'/classes/gdpr/psgdpr.php';
require_once __DIR__.'/classes/gdpr/basic.php';
require_once __DIR__.'/classes/gdpr/gdpr.php';
require_once __DIR__.'/classes/settings.php';
require_once __DIR__.'/classes/permissions.php';
require_once __DIR__.'/classes/visitor-permissions.php';
require_once __DIR__.'/classes/employee-permissions.php';
require_once __DIR__.'/classes/no-permissions.php';
require_once __DIR__.'/classes/shapes.php';
require_once __DIR__.'/classes/visitor.php';
require_once __DIR__.'/classes/review-query.php';
require_once __DIR__.'/classes/notifications.php';
require_once __DIR__.'/classes/actor.php';
require_once __DIR__.'/classes/review-list.php';
require_once __DIR__.'/classes/front-app.php';
require_once __DIR__.'/classes/backup.php';
require_once __DIR__.'/classes/integration/datakick.php';
require_once __DIR__.'/classes/integration/krona.php';
require_once __DIR__.'/classes/migration-utils.php';

require_once __DIR__.'/model/criterion.php';
require_once __DIR__.'/model/review.php';

class Revws extends Module {
  private $permissions;
  private $visitor;
  private $settings;
  private $krona;
  private $csrfToken;
  private $gdpr;
  private $frontApp;

  public function __construct() {
    $this->name = 'revws';
    $this->tab = 'administration';
    $this->version = '1.0.22';
    $this->author = 'DataKick';
    $this->need_instance = 0;
    $this->bootstrap = true;
    parent::__construct();
    $this->displayName = $this->l('Revws - Product Reviews');
    $this->description = $this->l('Product Reviews module');
    $this->confirmUninstall = $this->l('Are you sure you want to uninstall the module? All its data will be lost!');
    $this->ps_versions_compliancy = array('min' => '1.6', 'max' => '1.6.999');
    $this->controllers = array('MyReviews', 'AllReviews');
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
      $this->getSettings(false)->remove() &&
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
      'displayHeader',
      'moduleRoutes',
      'displayMobileHeader',
      'displayProductTab',
      'displayProductTabContent',
      'displayRightColumnProduct',
      'displayProductListReviews',
      'displayProductButtons',
      'displayProductComparison',
      'displayCustomerAccount',
      'displayMyAccountBlock',
      'displayFooterProduct',
      'datakickExtend',
      'actionRegisterKronaAction',
      'displayRevwsReview',
      'displayRevwsReviewList',
      'displayRevwsAverageRating',
      'registerGDPRConsent',
      'actionDeleteGDPRCustomer',
      'actionExportGDPRData'
    ]);
  }

  public function unregisterHooks() {
    return $this->setupHooks([]);
  }

  private function setupHooks($hooks) {
    $id = $this->id;
    $install = [];
    $delete = [];
    $aliases = Hook::getHookAliasList();
    foreach ($hooks as $hook) {
      $key = strtolower($hook);
      if (isset($aliases[$key])) {
        $hook = $aliases[$key];
        $key = strtolower($hook);
      }
      $install[$key] = $hook;
    }
    $sql = 'SELECT DISTINCT LOWER(h.name) AS `hook` FROM '._DB_PREFIX_.'hook h INNER JOIN '._DB_PREFIX_.'hook_module hm ON (h.id_hook = hm.id_hook) WHERE hm.id_module = '.(int)$id;
    foreach (Db::getInstance()->executeS($sql) as $row) {
      $hook = $row['hook'];
      if (isset($install[$hook])) {
        unset($install[$hook]);
      } else {
        $delete[] = $hook;
      }
    }
    $ret = true;
    foreach ($install as $hook) {
      if (! $this->registerHook($hook)) {
        $ret = false;
      }
    }
    foreach ($delete as $hook) {
      $this->unregisterHook($hook);
    }
    return $ret;
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
    return $this->executeSqlScript('uninstall', false);
  }

  public function executeSqlScript($script, $check=true) {
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
        try {
          if (!Db::getInstance()->execute($stmt)) {
            PrestaShopLogger::addLog("revws: migration script $script: $stmt: error");
            if ($check) {
              return false;
            }
          }
        } catch (\Exception $e) {
          PrestaShopLogger::addLog("revws: migration script $script: $stmt: exception");
          if ($check) {
            return false;
          }
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

  public function getSettings($check=true) {
    if (! $this->settings) {
      $this->settings = new \Revws\Settings();
      $version = $this->settings->getVersion();
      if ($check && $version != $this->version) {
        if (version_compare($version, $this->version, '<')) {
          $this->migrate($version);
        }
        $this->registerHooks();
        if (is_callable(array($this, 'installControllers'))) {
          $this->installControllers();
        }
        $this->settings->setVersion($this->version);
      }
    }
    return $this->settings;
  }

  private function migrate($version) {
    $utils = new \Revws\MigrationUtils(Db::getInstance());
    if (version_compare($version, '1.0.9', '<')) {
      $this->executeSqlScript('update-verified_buyer', false);
    }
    $this->executeSqlScript('update-review-image', false);
    if (! $utils->columnExists(_DB_PREFIX_ . 'revws_criterion', 'entity_type')) {
      $this->executeSqlScript('add-entity-type', false);
    }
  }

  public function getVisitor() {
    if (! $this->visitor) {
      $this->visitor = new \Revws\Visitor($this->context, $this->getSettings(), $this->getKrona());
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

  public function getKrona() {
    if (! $this->krona) {
      $this->krona = new \Revws\KronaIntegration();
    }
    return $this->krona;
  }

  private function getProductReviewList() {
    $productId = (int)(Tools::getValue('id_product'));
    $frontApp = $this->getFrontApp();
    $frontApp->addEntity('product', $productId);
    if (isset($_GET['post_review']) && $this->getPermissions()->canCreateReview('product', $productId)) {
      $frontApp->addInitAction([
        'type' => 'TRIGGER_CREATE_REVIEW',
        'entityType' => 'product',
        'entityId' => $productId
      ]);
    }
    $list = $frontApp->addEntityListWidget('product', $productId);
    $visitor = $this->getVisitor();
    $settings = $this->getSettings();
    $this->context->smarty->assign([
      'reviewList' => $list->getData(),
      'productId' => $productId,
      'visitor' => $frontApp->getVisitorData(),
      'reviewsData' => $frontApp->getStaticData(),
      'allReviewsUrl' => $this->getUrl('AllReviews')
    ]);
    if ($settings->emitRichSnippets()) {
      list($grade, $count) = RevwsReview::getAverageGrade($settings, $productId);
      $this->context->smarty->assign([
        'avgGrade' => $grade,
        'reviewCount' => $count
      ]);
    }
    return $list;
  }

  private function getShapeSettings() {
    return \Revws\Shapes::getShape($this->getSettings()->getShape());
  }

  public function hookDisplayProductTab() {
    if ($this->getSettings()->getPlacement() === 'tab') {
      return $this->display(__FILE__, 'product_tab_header.tpl');
    }
  }

  public function hookDisplayProductTabContent() {
    $set = $this->getSettings();
    if ($this->getSettings()->getPlacement() === 'tab') {
      $list = $this->getProductReviewList();
      if ($list->isEmpty() && $this->getVisitor()->isGuest() && $set->hideEmptyReviews()) {
        return;
      }
      return $this->display(__FILE__, 'product_tab_content.tpl');
    }
  }

  public function hookDisplayFooterProduct() {
    $set = $this->getSettings();
    if ($set->getPlacement() === 'block') {
      $list = $this->getProductReviewList();
      if ($list->isEmpty() && $this->getVisitor()->isGuest() && $set->hideEmptyReviews()) {
        return;
      }
      return $this->display(__FILE__, 'product_footer.tpl');
    }
  }

  public function hookDisplayHeader() {
    return $this->hookHeader();
  }

  public function hookDisplayMobileHeader() {
    return $this->hookHeader();
  }

  public function hookMobileHeader() {
    return $this->hookHeader();
  }

  public function hookHeader() {
    $this->csrf();
    $this->includeCommonStyles($this->context->controller);
    $this->context->controller->addJS($this->getPath('views/js/revws_bootstrap.js'));
    return $this->addCanonicalTags($this->context->controller->php_self);
  }

  private function addCanonicalTags($page) {
    if (defined('_TB_VERSION_')) {
      // thirtybees already adds canonical tags automatically
      return;
    }
    if ($page == 'module-revws-AllReviews') {
      $canonical = $this->context->link->getPageLink($page);
      return '<link rel="canonical" href="'.$canonical.'">'."\n";
    }
  }

  public function hookDisplayRightColumnProduct($params) {
    $set = $this->getSettings();
    if ($set->getAveragePlacement() == 'rightColumn') {
      return $this->hookDisplayRevwsAverageRating(['placement' => 'extra']);
    }
  }

  public function hookDisplayProductButtons($params) {
    $set = $this->getSettings();
    if ($set->getAveragePlacement() == 'buttons') {
      return $this->hookDisplayRevwsAverageRating(['placement' => 'buttons']);
    }
  }

  public function hookDisplayRevwsAverageRating($params) {
    if (isset($params['product'])) {
      $product = $params['product'];
    } else {
      $product = (int)(Tools::getValue('id_product'));
    }
    if (is_object($product)) {
      $product = $product->id;
    }
    if (! $product) {
      throw new Exception('hook displayRevwsAverageRating called without product');
    }
    $placement = isset($params['placement']) ? $params['placement'] : 'custom-placement';
    $set = $this->getSettings();
    list($grade, $count) = RevwsReview::getAverageGrade($set, $product);
    $this->context->smarty->assign('placement', $placement);
    $this->context->smarty->assign('productId', $product);
    $this->context->smarty->assign('grade', $grade);
    $this->context->smarty->assign('reviewCount', $count);
    $this->context->smarty->assign('hasReviewed', $this->getVisitor()->hasWrittenReview('product', $product));
    $this->context->smarty->assign('shape', $this->getShapeSettings());
    $this->context->smarty->assign('shapeSize', $set->getShapeSize());
    $this->context->smarty->assign('canReview', $this->getPermissions()->canCreateReview('product', $product));
    $this->context->smarty->assign('isGuest', $this->getVisitor()->isGuest());
    $this->context->smarty->assign('loginLink', $this->getLoginUrl($product));
    $this->context->smarty->assign('microdata', $set->emitRichSnippets());
    $this->context->smarty->assign('showSignInButton', $set->showSignInButton());
    return $this->display(__FILE__, 'review-average.tpl');
  }


  public function hookDisplayProductListReviews($params) {
    $settings = $this->getSettings();
    if ($settings->showOnProductListing()) {
      $productId = self::getProductId($params['product']);
      list($grade, $count) = RevwsReview::getAverageGrade($settings, $productId);
      $this->context->smarty->assign('omitEmpty', $settings->productListNoReviewsBehavior() === 'omit');
      $this->context->smarty->assign('productId', $productId);
      $this->context->smarty->assign('grade', $grade);
      $this->context->smarty->assign('reviewCount', $count);
      $this->context->smarty->assign('shape', $this->getShapeSettings());
      $this->context->smarty->assign('shapeSize', $settings->getShapeSize());
      $this->context->smarty->assign('reviewsUrl', $this->getProductReviewsLink($productId));
      return $this->display(__FILE__, 'product_list.tpl', $this->getCacheId() . '|' . $productId);
    }
  }

  public function hookDisplayProductComparison($params) {
    $settings = $this->getSettings();
    if ($settings->showOnProductComparison()) {
      $averages = [];
      foreach ($params['list_ids_product'] as $idProduct) {
        $productId = (int)$idProduct;
        $averages[$productId] = RevwsReview::getAverageGrade($settings, $productId);
      }
      $this->context->smarty->assign('averages', $averages);
      $this->context->smarty->assign('shape', $this->getShapeSettings());
      $this->context->smarty->assign('shapeSize', $settings->getShapeSize());
      $this->context->smarty->assign('list_ids_product', $params['list_ids_product']);
      return $this->display(__FILE__, 'products_comparison.tpl');
    }
  }

  public function hookDisplayCustomerAccount($params) {
    if ($this->getSettings()->showOnCustomerAccount()) {
      $this->context->smarty->assign([
        'iconClass' => $this->getSettings()->getCustomerAccountIcon(),
        'myReviewsUrl' => $this->getUrl('MyReviews')
      ]);
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
    $uri = rtrim($this->getPathUri(), '/');
    $rel = ltrim($relative, '/');
    return "$uri/$rel";
  }

  public function hookRegisterGDPRConsent() {
  }

  public function hookActionExportGDPRData($customer) {
    if (isset($customer['email']) && Validate::isEmail($customer['email'])) {
      $email = $customer['email'];
      $id = isset($customer['id']) ? $customer['id'] : null;
      $data = $this->getGDPR()->getData($id, $email);
      if (!empty($data['reviews']) || !empty($data['reactions'])) {
        $list = array_merge($data['reviews'], $data['reactions']);
        return json_encode($list);
      }
    }
  }

  public function hookActionDeleteGDPRCustomer($customer) {
    if (isset($customer['email']) && Validate::isEmail($customer['email'])) {
      $email = $customer['email'];
      $id = isset($customer['id']) ? $customer['id'] : null;
      $ret = json_encode($this->getGDPR()->deleteData($id, $email));
      $this->clearCache();
      return $ret;
    }
  }

  public function hookDataKickExtend($params) {
    return \Revws\DatakickIntegration::integrate($params);
  }

  public function hookActionRegisterKronaAction($params) {
    return $this->getKrona()->getActions();
  }

  public function hookDisplayRevwsReview($params) {
    if (isset($params['review'])) {
      if (is_object($params['review'])) {
        $review = $params['review'];
      } else if (is_numeric($params['review'])) {
        $review = new RevwsReview((int)$params['review']);
        if (Validate::isLoadedObject($review)) {
          $review->loadGrades();
        } else {
          $review = null;
        }
      }
      if ($review) {
        $displayReply = true;
        if (isset($params['displayReply'])) {
          $displayReply = !!$params['displayReply'];
        }
        $shopName = $displayReply ? Configuration::get('PS_SHOP_NAME') : null;
        $displayCriteria = $this->getSettings()->getDisplayCriteriaPreference();
        if (isset($params['displayCriteria'])) {
          $displayCriteria = $params['displayCriteria'];
        }
        $this->context->smarty->assign('review', $review->toJSData(new \Revws\NoPermissions()));
        $this->context->smarty->assign('shape', $this->getShapeSettings());
        $this->context->smarty->assign('criteria', RevwsCriterion::getCriteria($this->context->language->id));
        $this->context->smarty->assign('displayCriteria', $displayCriteria);
        $this->context->smarty->assign('shopName', $shopName);
        $this->context->smarty->assign('linkToProduct', $this->context->link->getProductLink($review->id_entity));
        return $this->display(__FILE__, 'display-revws-review.tpl');
      }
    }
  }

  public function hookDisplayRevwsReviewList($params) {
    $displayReply = true;
    if (isset($params['displayReply'])) {
    }
    if (isset($params['displayReply'])) {
      $displayReply = !!$params['displayReply'];
    }
    $shopName = $displayReply ? Configuration::get('PS_SHOP_NAME') : null;

    $displayCriteria = $this->getSettings()->getDisplayCriteriaPreference();
    if (isset($params['displayCriteria'])) {
      $displayCriteria = $params['displayCriteria'];
    }

    $reviewStyle = 'item';
    if (isset($params['reviewStyle'])) {
      $reviewStyle = $params['reviewStyle'];
    }

    $order = 'date';
    if (isset($params['order'])) {
      $order = $params['order'];
    }

    $orderDir = 'desc';
    if (isset($params['orderDir'])) {
      $orderDir = $params['orderDir'];
    }

    $pageSize = 5;
    if (isset($params['pageSize'])) {
      $pageSize = (int)$params['pageSize'];
    }

    $allowPaging = true;
    if (isset($params['allowPaging'])) {
      $allowPaging = !!$params['allowPaging'];
    }

    $widgetParams = [
      'reviewStyle' => $reviewStyle,
      'displayReply' => $displayReply,
      'displayCriteria' => $displayCriteria,
      'allowPaging' => $allowPaging
    ];

    $conditions = [];

    if (isset($params['product'])) {
      $product = (int)$params['product'];
      if ($product > 0) {
        $conditions['product'] = $product;
      }
    }

    if (isset($params['customer'])) {
      $customer = (int)$params['customer'];
      if ($customer > 0) {
        $conditions['customer'] = $customer;
      }
    }

    if (isset($params['guest'])) {
      $guest = (int)$params['guest'];
      if ($guest > 0) {
        $conditions['guest'] = $guest;
      }
    }

    $frontApp = $this->getFrontApp();
    $listId = "" . (isset($params['id']) ? $params['id'] : $frontApp->generateListId());
    $list = $frontApp->addCustomListWidget($listId, $conditions, $widgetParams, $pageSize, $order, $orderDir);

    $this->context->smarty->assign(array_merge([
      'shopName' => $shopName,
      'criteria' => RevwsCriterion::getCriteria($this->context->language->id),
      'shape' => $this->getShapeSettings(),
      'reviewList' => $list->getData(),
      'reviewEntities' => $frontApp->getEntities(),
    ], $widgetParams));

    return $this->display(__FILE__, 'display-revws-review-list.tpl');
  }

  public function hookModuleRoutes() {
    $prefix = 'reviews';
    return [
      'module-revws-AllReviews' => [
        'controller' => 'AllReviews',
        'rule' => "$prefix",
        'keywords' => [],
        'params' => [
          'fc' => 'module',
          'module' => $this->name,
          'controller' => 'AllReviews',
        ]
      ],
      'module-revws-AllReviews2' => [
        'controller' => 'AllReviews',
        'rule' => "$prefix/",
        'keywords' => [],
        'params' => [
          'fc' => 'module',
          'module' => $this->name,
          'controller' => 'AllReviews',
        ]
      ],
      'module-revws-MyReviews' => [
        'controller' => 'MyReviews',
        'rule' => "$prefix/my-reviews",
        'keywords' => [],
        'params' => [
          'fc' => 'module',
          'module' => $this->name,
          'controller' => 'MyReviews',
        ]
      ],
      'module-revws-MyReviews2' => [
        'controller' => 'MyReviews',
        'rule' => "$prefix/my-reviews/",
        'keywords' => [],
        'params' => [
          'fc' => 'module',
          'module' => $this->name,
          'controller' => 'MyReviews',
        ]
      ]
    ];
  }

  public function getUrl($controller, $params=[]) {
    return $this->context->link->getModuleLink($this->name, $controller, $params);
  }

  public static function getPageUrl($list, $increment) {
    $pages = (int)$list['pages'];
    $page = (int)$list['page'] + (int)$increment + 1;
    $current = $_SERVER['REQUEST_URI'];
    if ($page >= 1 && $page <= $pages) {
      $url = explode('?', $current);
      $uri = $url[0];
      $queryString = isset($url[1]) ? $url[1] : '';
      parse_str($queryString, $queryStringParams);
      $id = 'revws-' . $list['id'];
      $pageSizeParam = "$id-page-size";
      $pageParam = "$id-page";
      $queryStringParams[$pageSizeParam] = (int)$list['pageSize'];
      $queryStringParams[$pageParam] = $page;
      return "$uri?" . http_build_query($queryStringParams);
    }
    return $current;
  }

  public function clearCache() {
    if (version_compare(_PS_VERSION_, '1.6.1', '>=')) {
      $this->_clearCache('product-list.tpl');
    } else {
      // clear complete smarty cache for old ps versions
      Tools::clearSmartyCache();
    }
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
    $controller->addJquery();
    $controller->addJqueryPlugin('fancybox');
    $controller->addCSS($this->getCSSFile(), 'all', null, false);
    $themeName = "views/css/themes/"._THEME_NAME_.".css";
    if (file_exists(REVWS_MODULE_DIR . '/' . $themeName)) {
      $controller->addCSS($this->getPath($themeName), 'all', null, false);
    }
  }

  private function getProductReviewsLink($product) {
    $product = (int)$product;
    if (! $product) {
      return '';
    }
    $link = $this->context->link->getProductLink($product);
    if ($link) {
      if (strpos($link, '?') === false) {
        $link .= '?show=reviews';
      } else {
        $link .= '&show=reviews';
      }
    }
    return $link;
  }

  public function getLoginUrl() {
    return $this->context->link->getPageLink('authentication', true, null, [
      'back' => ''
    ]);
  }

  public function csrf() {
    if (! $this->csrfToken) {
      $this->csrfToken = new \Revws\CSRFToken($this->context->cookie, $this->getSettings());
    }
    return $this->csrfToken;
  }

  public function getGDPR() {
    if (! $this->gdpr) {
      $this->gdpr = new \Revws\GDPR($this);
    }
    return $this->gdpr;
  }

  public function getCSSFile() {
    $set = $this->getSettings();
    $version = $this->getCSSVersion($set);
    $name = "views/css/revws-$version.css";
    $filename = REVWS_MODULE_DIR . '/' . $name;
    if (!file_exists($filename)) {
      $this->generateCSS($set, $filename);
      if (! file_exists($filename)) {
        // return fallback css file
        return $this->getPath("views/css/fallback.css");
      }
    }
    return $this->getPath($name);
  }

  private function getCSSVersion($set) {
    static $version;
    if (is_null($version)) {
      $data = 'a64e2ef';
      $data .= '-' . $set->getVersion();
      $data .= '-' . json_encode($this->getCSSSettings($set));
      foreach (['css.tpl', 'css-extend.tpl'] as $tpl) {
        $source = $this->getTemplatePath($tpl);
        if ($source) {
          $data .= '-' . filemtime($source);
        }
      }
      $version = md5($data);
    }
    return $version;
  }

  private function getCSSSettings($set) {
    $colors = $set->getShapeColors();
    $colors['fillColorHigh'] = \Revws\Color::emphasize($colors['fillColor']);
    $colors['borderColorHigh'] = \Revws\Color::emphasize($colors['borderColor']);
    return [
      'shape' => $this->getShapeSettings(),
      'shapeSize' => [
        'product' => $set->getShapeSize(),
        'list' => $set->getShapeSize(),
        'create' => $set->getShapeSize() * 5
      ],
      'colors' => $colors,
      'productList' => [
        'noReviews' => $set->productListNoReviewsBehavior()
      ],
      'images' => [
        'thumbnail' => [
          'width' => $set->getImageThumbnailWidth(),
          'height' => $set->getImageThumbnailHeight(),
        ]
      ]
    ];
  }

  private function generateCSS($set, $filename) {
    Tools::clearSmartyCache();
    Media::clearCache();
    $this->smarty->assign('cssSettings', $this->getCSSSettings($set));
    $css = "/* Automatically generated file - DO NOT EDIT, YOUR CHANGES WOULD BE LOST */\n\n";
    $css .= $this->display(__FILE__, 'css.tpl');
    $extend = $this->getTemplatePath('css-extend.tpl');
    if ($extend) {
      $css .= "\n" . $this->display(__FILE__, 'css-extend.tpl');
    }
    $css = str_replace('<!--', '/*', $css);
    $css = str_replace('-->', '*/', $css);
    $dir = dirname($filename);
    if (! is_dir($dir)) {
      @mkdir($dir);
    }
    @file_put_contents($filename, $css);
  }

  public function getFrontApp() {
    if (! $this->frontApp) {
      $this->frontApp = new \Revws\FrontApp($this);
      Media::addJsDef([ 'revwsData' => $this->frontApp ]);
    }
    return $this->frontApp;
  }

  private static function getProductId($product) {
    if (is_array($product) && isset($product['id_product'])) {
      return (int)$product['id_product'];
    }
    if (is_object($product) && property_exists($product, 'id_product')) {
      return (int)$product->id_product;
    }
    if (is_int($product)) {
      return (int)$product;
    }
    return null;
  }
}
