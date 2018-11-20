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

use \Revws\Notifications;
use \Revws\Utils;
use \Revws\Shapes;
use \Revws\FrontApp;
use \Revws\CsvReader;
use \Revws\Visitor;
use \Revws\PrestashopGDRP;
use \Revws\Backup;

class AdminRevwsBackendController extends ModuleAdminController {
  public $module;

  public function __construct() {
    parent::__construct();
    $this->display = 'view';
    $this->bootstrap = false;
    $this->module->includeCommonStyles($this);
    $this->addCSS($this->getPath('views/css/back.css'));
    $this->addJs($this->module->getSettings()->getBackendAppUrl($this->module));
  }

  public function display() {
    $settings = $this->module->getSettings();
    $this->display_footer = false;
    $languages = [];
    foreach (Language::getLanguages() as $lang) {
      $languages[(int)$lang['id_lang']] = [
        'code' => $lang['iso_code'],
        'name' => $lang['name']
      ];
    };
    $lang = $this->context->language->id;
    $platform = 'prestashop';
    $platformVersion = _PS_VERSION_;
    if (defined('_TB_VERSION_')) {
      $platform = 'thirtybees';
      $platformVersion = _TB_VERSION_;
    }

    $this->context->smarty->assign([
      'help_link' => null,
      'title' => $this->l('Product reviews'),
      'revws' => [
        'data' => [
          'activated' => $settings->isActivated(),
          'version' => $this->module->version,
          'versionUrl' => $settings->getVersionUrl(),
          'api' => $this->context->link->getAdminLink('AdminRevwsBackend'),
          'shopName' => Configuration::get('PS_SHOP_NAME'),
          'baseUrl' => $this->getPath(''),
          'shapes' => Shapes::getAvailableShapes(),
          'languages' => $languages,
          'language' => $lang,
          'platform' => $platform,
          'platformVersion' => $platformVersion,
          'dateFormat' => $this->context->language->date_format_lite,
          'environment' => [
            'krona' => $this->module->getKrona()->isInstalled(),
            'productcomments' => Module::isInstalled('productcomments'),
            'psgdpr' => PrestashopGDRP::isAvailable()
          ],
          'drilldownUrls' => $this->getDrilldownTokens(),
          'entityTypes' => [
            'product' => $this->l('Product')
          ],
          'warnings' => $this->getWarnings()
        ],
        'versionCheck' => $settings->getCheckModuleVersion(),
        'criteria' => $this->getCriteria(),
        'settings' => $settings->get(),
        'translations' => $this->module->getBackTranslations(),
      ]
    ]);
    return parent::display();
  }

  public function initToolbar() {
    parent::initToolbar();
    $this->page_header_toolbar_btn['save-and-stay'] = [
        'icon' => 'process-icon-cogs',
        'href' => '#/settings',
        'desc' => $this->l('Settings'),
    ];
  }

  public function createTemplate($tpl_name) {
    if ($this->viewAccess() && $tpl_name === 'content.tpl') {
      $path = _PS_MODULE_DIR_ . $this->module->name . '/views/templates/admin/backend.tpl';
      return $this->context->smarty->createTemplate($path, $this->context->smarty);
    }
    return parent::createTemplate($tpl_name);
  }

  private function getPath($path) {
    return $this->module->getPath($path);
  }

  public function ajaxProcessCommand() {
    $moduleInstance = $this->module;
    $error = null;
    $result = null;
    try {
      $result = $this->dispatchCommand(Tools::getValue('cmd'));
    } catch (Exception $e) {
      $error = $e->getMessage();
    }
    $this->reply($error, $result);
  }

  private function dispatchCommand($cmd) {
    $payload = isset($_POST['payload']) ? json_decode($_POST['payload'], true) : [];
    switch ($cmd) {
      case 'activate':
        return $this->activate($payload);
      case 'loadData':
        return $this->loadData($payload);
      case 'approveReview':
        return $this->approveReview($payload);
      case 'deleteReview':
        return $this->deleteReview($payload);
      case 'undeleteReview':
        return $this->undeleteReview($payload);
      case 'saveSettings':
        return $this->saveSettings($payload);
      case 'deleteCriterion':
        return $this->deleteCriterion($payload);
      case 'saveCriterion':
        return $this->saveCriterion($payload);
      case 'saveReview':
        return $this->saveReview($payload);
      case 'migrateData':
        return $this->migrateData($payload);
      case 'importYotpo':
        return $this->importYotpo();
      case 'export':
        return $this->export();
      case 'setLatestVersion':
        return $this->setLatestVersion($payload);
      default:
        throw new Exception("Unknown command $cmd");
    }
  }

  private function activate() {
    $this->module->getSettings()->setActivated();
    return true;
  }

  private function importYotpo() {
    Notifications::getInstance()->enableNotifications(false);
    $upload = Tools::fileAttachment('file', false);
    if (! (isset($_FILES['file']['name']) && !empty($_FILES['file']['name']) && !empty($_FILES['file']['tmp_name']))) {
      throw new Exception('No file');
    }
    $file = fopen($_FILES['file']['tmp_name'], 'r');
    $reader = new CsvReader($file);
    $index = array_flip($reader->getColumnNames());
    foreach (['published', 'review_title', 'review_content', 'review_score', 'date', 'product_id', 'display_name', 'email', 'comment_content'] as $key) {
      if (! isset($index[$key])) {
        throw new Exception("CSV does not contains column $key");
      }
    }
    $this->module->executeSqlScript('migrate-yotpo');
    $products = $this->getEntities('product');
    $customers = $this->getCustomersByEmail();
    $errors = [];
    $success = 0;
    $cnt = 0;
    $siteReviews = 0;
    while ($line = $reader->fetch()) {
      $cnt++;
      $productId = $line[$index['product_id']];
      if ($productId === 'yotpo_site_reviews') {
        $siteReviews++;
        continue;
      }
      if (! isset($products[$productId])) {
        $errors[] = "Line $cnt: prouduct with id '$productId' not found";
        continue;
      }
      $review = new RevwsReview();
      $review->display_name = $line[$index['display_name']];
      $review->title = $line[$index['review_title']];
      $review->content = $line[$index['review_content']];
      $review->date_upd = date('Y-m-d H:i:s');
      $review->date_add = (new \DateTime($line[$index['date']]))->format('Y-m-d H:i:s');
      $review->entity_type = 'product';
      $review->id_entity = $productId;
      $review->id_lang = (int)Context::getContext()->language->id;
      $review->validated = $line[$index['published']] === 'true';
      $review->email = $line[$index['email']];
      $review->reply = $line[$index['comment_content']];
      $review->deleted = 0;
      $review->id_guest = 0;
      $review->id_customer = 0;
      $review->verified_buyer = 0;
      if (isset($customers[$review->email])) {
        $review->id_customer = (int)$customers[$review->email];
        $review->verified_buyer = Visitor::hasCustomerPurchasedProduct($review->id_customer, $productId);
      }
      $review->grades = [
        '1' => (int)$line[$index['review_score']]
      ];
      $ok = false;
      $err = 'Unknown error';
      try {
        $ok = $review->save(null, false);
      } catch (Exception $e) {
        $err = $e->getMessage();
      }
      if ($ok) {
        $success++;
      } else {
        $errors[] = "Line $cnt: failed to save review: $err";
      }
    }
    return [
      'criteria' => $this->getCriteria(),
      'result' => [
        'total' => (int)$cnt,
        'siteReviews' => (int)$siteReviews,
        'success' => (int)$success,
        'errors' => $errors,
      ]
    ];
  }

  private function approveReview($payload) {
    $review = $this->getReviewById($payload['id']);
    $review->validated = true;
    if (! $review->save()) {
      throw new Exception("Failed to approve review");
    }
    return $this->returnReview($review);
  }

  private function deleteReview($payload) {
    $review = $this->getReviewById($payload['id']);
    if ((bool)$payload['permanently']) {
      if ($review->delete()) {
        return true;
      } else {
        throw new Exception("Failed to delete review");
      }
    } else {
      $review->deleted = true;
      $review->validated = false;
      if (! $review->save()) {
        throw new Exception("Failed to mark review as deleted");
      }
    }
    return $this->returnReview($review);
  }

  private function undeleteReview($payload) {
    $review = $this->getReviewById($payload['id']);
    $review->deleted = false;
    if (!$this->module->getSettings()->moderationEnabled()) {
      $review->validated = true;
    } else {
      $review->validated = false;
    }
    if (! $review->save()) {
      throw new Exception("Failed to undelete review");
    }
    return $this->returnReview($review);
  }

  private function saveReview($json) {
    $review = RevwsReview::fromJson($json, $this->module->getSettings());
    if (! $review->save()) {
      throw new Exception("Failed to save review");
    }
    return $this->returnReview($review);
  }

  private function loadData($payload) {
    $types = $payload['types'];
    $ret = [];
    if (is_array($types)) {
      foreach ($types as $key => $def) {
        $rec = $def['record'];
        if ($rec == 'entities') {
          $ret[$key] = $this->getEntities($def['entityType']);
        }
        if ($rec == 'categories') {
          $ret[$key] = $this->getCategories();
        }
        if ($rec == 'reviews') {
          $ret[$key] = $this->getReviews($def['pagination']);
        }
        if ($rec == 'entity') {
          $ret[$key] = $this->getEntityInfo($def['entityType'], $def['entityId']);
        }
        if ($rec == 'customers') {
          $ret[$key] = $this->getCustomers();
        }
      }
    }
    return $ret;;
  }

  private function getEntities($entityType) {
    if ($entityType === 'product') {
      return Utils::mapKeyValue('id_product', 'name', Product::getSimpleProducts($this->context->language->id));
    }
    throw new Exception("Unknown entity type $entityType");
  }

  private function getCustomers() {
    $loadPseudonyms = $this->module->getSettings()->usePseudonym();
    $pseudonyms = $loadPseudonyms ? $this->module->getKrona()->getAllPseudonyms() : [];
    return Utils::mapKeyValue('id_customer', function($data) use ($pseudonyms) {
      $id = (int)$data['id_customer'];
      $pseudonym = isset($pseudonyms[$id]) ? $pseudonyms[$id] : '';
      return [
        'id' => $id,
        'firstName' => $data['firstname'],
        'lastName' => $data['lastname'],
        'pseudonym' => $pseudonym,
        'email' => $data['email'],
      ];
    }, Customer::getCustomers(true));
  }

  private function getCustomersByEmail() {
    return Utils::mapKeyValue('email', 'id_customer', Customer::getCustomers(true));
  }

  private function getEntityInfo($entityType, $id) {
    if ($entityType === 'product') {
      $id = (int)$id;
      $lang = $this->context->language->id;
      return FrontApp::getProductData($id, $lang);
    }
    throw new Exception("Unknown entity type $entityType");
  }

  private function getCategories() {
    $lang = $this->context->language->id;
    return Utils::mapKeyValue('id_category', 'name', Category::getSimpleCategories($lang));
  }

  private function getReviews($pagination) {
    $permissions = $this->module->getPermissions();
    $ret = RevwsReview::findReviews($this->module->getSettings(), $pagination);
    $ret['reviews'] = RevwsReview::mapReviews($ret['reviews'], $permissions);
    return $ret;
  }

  private function deleteCriterion($payload) {
    $crit = new RevwsCriterion((int)$payload['id']);
    if (! Validate::isLoadedObject($crit)) {
      throw new Exception('Criterion not found');
    }
    return $crit->delete();
  }

  private function saveCriterion($json) {
    $crit = RevwsCriterion::fromJson($json);
    $crit->save();
    return $crit->toJson();
  }

  private function saveSettings($settings) {
    if (! $settings) {
      throw new Exception("Failed to parse settings");
    }
    if (!! $this->module->getSettings()->set($settings)) {
      $this->module->clearCache();
      return true;
    }
    return false;
  }

  private function setLatestVersion($data) {
    if (! isset($data['version'])) {
      throw new Exception('Version not set');
    }
    if (! isset($data['ts'])) {
      throw new Exception('Timestamp not set');
    }
    $paid = isset($data['paid']) ? $data['paid'] : null;
    $this->module->getSettings()->setCheckModuleVersion($data['version'], $data['ts'], $data['notes'], $paid);
    return true;
  }

  private function migrateData($data) {
    Notifications::getInstance()->enableNotifications(false);
    $source = isset($data['source']) ? $data['source'] : 'invalid';
    switch ($source) {
      case 'productcomments':
        $this->migrateProductComments();
        break;
      default:
        throw new Exception("Don't know how to migrate $source");
    }
    return [
      'source' => $source,
      'criteria' => $this->getCriteria()
    ];
  }

  private function migrateProductComments() {
    $this->module->executeSqlScript('migrate-productcomments');
  }

  private function reply($error, $result) {
    if ($error) {
      echo json_encode(['success'=>false, 'error' => $error]);
    } else {
      echo json_encode(['success'=>true, 'result' => $result]);
    }
    Notifications::getInstance()->closeConnectionAndProcess($this->module);
  }

  private function export() {
    $backup = new Backup($this->module->getSettings(), []);
    return $backup->getXml();
  }


  private function getReviewById($id) {
    $review = new RevwsReview((int)$id);
    if (! Validate::isLoadedObject($review)) {
      throw new Exception('Review not found');
    }
    return $review;
  }

  private function returnReview($review) {
    $id = (int)$review->id;
    $records = RevwsReview::findReviews($this->module->getSettings(), [
      'id' => $id,
      'allLanguages' => true,
      'entityInfo' => true,
      'customerInfo' => true,
    ]);
    if (isset($records['reviews'][$id])) {
      $rev = $records['reviews'][$id];
      return $rev->toJSData($this->module->getPermissions());
    }
    throw new Exception("Review does not exists");
  }


  private function getCriteria() {
    return array_map(array('RevwsCriterion', 'toJSData'), RevwsCriterion::getFullCriteria());
  }

  private function getWarnings() {
    $warnings = [];

    // check whether css folder is writable
    if (! $this->isCssFolderWriteable()) {
      $warnings[] = [
        'icon' => 'warning',
        'message' => sprintf($this->l('Directory %s is not writable'), REVWS_MODULE_DIR . '/views/css/'),
        'hint' => $this->l('This directory must be writable in order to generate CSS files')
      ];
    }

    // check that review criteria exists
    if (! RevwsCriterion::getFullCriteria()) {
      $warnings[] = [
        'icon' => 'warning',
        'message' => sprintf($this->l('No review criteria defined'), REVWS_MODULE_DIR . '/views/css/'),
        'hint' => $this->l('Please go to settings page and create at least one review criterion')
      ];
    }

    if (! extension_loaded('dom')) {
      $warnings[] = [
        'icon' => 'warning',
        'message' => $this->l('PHP dom extension is not loaded'),
        'hint' => $this->l('PHP `dom` extension is needed to export reviews into xml format')
      ];
    }

    // check email templates
    $warnings = array_merge($warnings, $this->getMissingEmailTemplates());
    return $warnings;
  }

  private function getMissingEmailTemplates() {
    $templates = [];
    $missing = [];
    $mailDir = REVWS_MODULE_DIR . '/mails/en/';
    $files = @scandir($mailDir);
    if ($files) {
      foreach (@scandir($mailDir) as $file) {
        $split = explode('.', $file);
        $ext = end($split);
        if ($ext === 'txt' || $ext === 'html') {
          $templates[] = $file;
        }
      }
    }
    $pathsToCheck = $this->getEmailTemplatePaths();
    foreach (Language::getLanguages() as $lang) {
      $isoCode = $lang['iso_code'];
      foreach ($templates as $template) {
        if (! self::emailTemplateExists($isoCode, $template, $pathsToCheck)) {
          $target = rtrim(_PS_THEME_DIR_, DIRECTORY_SEPARATOR) . "/modules/revws/mails/$isoCode/";
          $missing[] = [
            'icon' => 'email',
            'message' => sprintf($this->l('Email template %s is not translated for language %s'), $template, $lang['name']),
            'hint' => sprintf($this->l('To fix this problem, copy file %s to %s, and then translate it'), $mailDir.$template, $target.$template)
          ];
        }
      }
    }
    return $missing;
  }

  private static function emailTemplateExists($isoCode, $template, $pathsToCheck) {
    foreach ($pathsToCheck as $path) {
      $file = $path . $isoCode . DIRECTORY_SEPARATOR . $template;
      if (@file_exists($file)) {
        return true;
      }
    }
    return false;
  }

  private function getEmailTemplatePaths() {
    $rootDir = rtrim(_PS_ROOT_DIR_, DIRECTORY_SEPARATOR);
    $themeDir = rtrim(_PS_THEME_DIR_, DIRECTORY_SEPARATOR);
    return [
      $themeDir . '/modules/revws/mails/',
      $rootDir . '/modules/revws/mails/',
      $themeDir . '/mails/'
    ];
  }

  private function isCssFolderWriteable() {
    $dir = REVWS_MODULE_DIR . '/views/css/';
    if (! is_dir($dir)) {
      @mkdir($dir);
    }
    return @is_writable($dir);
  }

  private function getDrilldownTokens() {
    return [
      'editProduct' => $this->getAdminLink('AdminProducts', ['id_product' => '{ID}', 'updateproduct' => 1]),
      'viewCustomer' => $this->getAdminLink('AdminCustomers', ['id_customer' => '{ID}', 'viewcustomer' => 1]),
      'editCustomer' => $this->getAdminLink('AdminCustomers', ['id_customer' => '{ID}', 'updatecustomer' => 1]),
      'viewOrder' => $this->getAdminLink('AdminOrders', ['id_order' => '{ID}', 'vieworder' => 1])
    ];
  }

  private function getAdminLink($controller, $params) {
    $link = $this->context->link;
    $idLang = $this->context->language->id;
    $params = array_merge($params, ['token' => Tools::getAdminTokenLite($controller) ]);
    return Dispatcher::getInstance()->createUrl($controller, $idLang, $params, false);
  }

}
