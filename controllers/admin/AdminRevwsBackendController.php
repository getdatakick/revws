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
    $this->context->smarty->assign([
      'help_link' => null,
      'title' => $this->l('Product reviews'),
      'revws' => [
        'data' => [
          'api' => $this->context->link->getAdminLink('AdminRevwsBackend'),
          'shopName' => Configuration::get('PS_SHOP_NAME'),
          'baseUrl' => $this->getPath(''),
          'shapes' => Shapes::getAvailableShapes(),
          'languages' => $languages,
          'language' => $lang,
          'environment' => [
            'mailstream' => Module::isInstalled('mailstream'),
            'productcomments' => Module::isInstalled('productcomments')
          ]
        ],
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
      default:
        throw new Exception("Unknown command $cmd");
    }
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
    $review = RevwsReview::fromJson($json);
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
    return Utils::mapKeyValue('id_customer', function($data) {
      return [
        'id' => (int)$data['id_customer'],
        'firstName' => $data['firstname'],
        'lastName' => $data['lastname'],
        'email' => $data['email'],
      ];
    }, Customer::getCustomers(true));
  }

  private function getProductInfo($options) {
    $id = (int)$options['id'];
    $lang = $this->context->language->id;
    $permissions = $this->module->getPermissions();
    return FrontApp::getProductData($id, $lang, $permissions);
  }

  private function getCategories($options) {
    return Utils::mapKeyValue('id_category', 'name', Category::getAllCategoriesName(
      null, $this->context->language->id, true, null, true, "AND `c`.`level_depth` > 0"
    ));
  }

  private function getReviews($options) {
    $permissions = $this->module->getPermissions();
    $ret = RevwsReview::findReviews($options);
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
    $records = RevwsReview::findReviews([
      'id' => $id,
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
