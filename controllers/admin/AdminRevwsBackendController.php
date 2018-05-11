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
use \Revws\Notifications;
use \Revws\Utils;
use \Revws\Shapes;
use \Revws\FrontApp;
use \Revws\CsvReader;
use \Revws\Visitor;

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
          'environment' => [
            'mailstream' => Module::isInstalled('mailstream'),
            'krona' => $this->module->getKrona()->isInstalled(),
            'productcomments' => Module::isInstalled('productcomments')
          ],
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
    $payload = json_decode(Tools::getValue('payload'), true);
    switch ($cmd) {
      case 'loadData':
        return $this->loadData($payload);
      case 'approveReview':
        return $this->approveReview($payload);
      case 'deleteReview':
        return $this->deleteReview($payload, true);
      case 'undeleteReview':
        return $this->deleteReview($payload, false);
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
      case 'setLatestVersion':
        return $this->setLatestVersion($payload);
      default:
        throw new Exception("Unknown command $cmd");
    }
  }

  private function importYotpo() {
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
    $products = $this->getProducts([]);
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
      $review->id_product = $productId;
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
        $review->verified_buyer = Visitor::hasCustomerPurchasedProduct($review->id_customer, $review->id_product);
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
      throw new Exception("Failed to save review");
    }
    return $this->returnReview($review);
  }

  private function deleteReview($payload, $deleted) {
    $review = $this->getReviewById($payload['id']);
    $review->deleted = $deleted;
    if (! $deleted && !$this->module->getSettings()->moderationEnabled()) {
      $review->validated = true;
    } else {
      $review->validated = false;
    }
    if (! $review->save()) {
      throw new Exception("Failed to save review");
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
        $options = $def['options'];
        if ($rec == 'products') {
          $ret[$key] = $this->getProducts($options);
        }
        if ($rec == 'categories') {
          $ret[$key] = $this->getCategories($options);
        }
        if ($rec == 'reviews') {
          $ret[$key] = $this->getReviews($options);
        }
        if ($rec == 'productInfo') {
          $ret[$key] = $this->getProductInfo($options);
        }
        if ($rec == 'customers') {
          $ret[$key] = $this->getCustomers($options);
        }
      }
    }
    return $ret;;
  }

  private function getProducts($options) {
    return Utils::mapKeyValue('id_product', 'name', Product::getSimpleProducts($this->context->language->id));
  }

  private function getCustomers($options) {
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

  private function getProductInfo($options) {
    $id = (int)$options['id'];
    $lang = $this->context->language->id;
    $permissions = $this->module->getPermissions();
    return FrontApp::getProductData($id, $lang, $permissions);
  }

  private function getCategories($options) {
    $lang = $this->context->language->id;
    $exists = is_callable(array('Category', 'getAllCategoriesName'));
    $categories = $exists ? Category::getAllCategoriesName(null, $lang, true, null, true, "AND `c`.`level_depth` > 0") : Category::getSimpleCategories($lang);
    return Utils::mapKeyValue('id_category', 'name', $categories);
  }

  private function getReviews($options) {
    $permissions = $this->module->getPermissions();
    $ret = RevwsReview::findReviews($this->module->getSettings(), $options);
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
    $this->module->getSettings()->setCheckModuleVersion($data['version'], $data['ts'], $data['notes']);
    return true;
  }

  private function migrateData($data) {
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
      'productInfo' => true,
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

}
