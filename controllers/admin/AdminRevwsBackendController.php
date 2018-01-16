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

use \Revws\Utils;
use \Revws\Shapes;
use \Revws\Criterion;

class AdminRevwsBackendController extends ModuleAdminController {
  public $module;

  public function __construct() {
    parent::__construct();
    $this->display = 'view';
    $this->bootstrap = false;
    $this->addCSS($this->getPath('views/css/back.css'));
    $this->addCSS($this->getPath('views/css/front.css'));
    $this->context->controller->addCSS('https://fonts.googleapis.com/css?family=Roboto:300,400,500', 'all');
    $this->addJs($this->module->getSettings()->getBackendAppUrl($this->module->name));
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
          'shapes' => Shapes::getAvailableShapes(),
          'languages' => $languages,
          'language' => $lang,
        ],
        'criteria' => array_map(array('\Revws\Criterion', 'toJSData'), Criterion::getFullCriteria()),
        'settings' => $settings->get()
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
      $path = $this->getPath('views/templates/admin/backend.tpl');
      return $this->context->smarty->createTemplate($path, $this->context->smarty);
    }
    return parent::createTemplate($tpl_name);
  }

  private function getPath($path) {
    return _PS_MODULE_DIR_ . $this->module->name . '/' . $path;
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
    ob_end_clean();
    $this->reply($error, $result);
  }

  private function dispatchCommand($cmd) {
    $payload = json_decode(Tools::getValue('payload'), true);
    switch ($cmd) {
      case 'loadData':
        return $this->loadData($payload);
      case 'saveSettings':
        return $this->saveSettings($payload);
      case 'deleteCriterion':
        return $this->deleteCriterion($payload);
      case 'saveCriterion':
        return $this->saveCriterion($payload);
      default:
        throw new Exception("Unknown command $cmd");
    }
  }

  private function loadData($payload) {
    $ret = [];
    $types = $payload['types'];
    if (in_array('products', $types)) {;
      $ret['products'] = $this->getProducts();
    }
    if (in_array('categories', $types)) {
      $ret['categories'] = $this->getCategories();
    }
    return $ret;
  }

  private function getProducts() {
    return Utils::mapKeyValue('id_product', 'name', Product::getSimpleProducts($this->context->language->id));
  }

  private function getCategories() {
    return Utils::mapKeyValue('id_category', 'name', Category::getAllCategoriesName(
      null, $this->context->language->id, true, null, true, "AND `c`.`level_depth` > 0"
    ));
  }

  private function deleteCriterion($payload) {
    $crit = new Criterion((int)$payload['id']);
    if (! Validate::isLoadedObject($crit)) {
      throw new Exception('Criterion not found');
    }
    return $crit->delete();
  }

  private function saveCriterion($json) {
    $crit = Criterion::fromJson($json);
    $crit->save();
    return $crit->toJson();
  }

  private function saveSettings($settings) {
    if (! $settings) {
      throw new Exception("Failed to parse settings");
    }
    return !!$this->module->getSettings()->set($settings);
  }

  private function reply($error, $result) {
    if ($error) {
      echo json_encode(['success'=>false, 'error' => $error]);
    } else {
      echo json_encode(['success'=>true, 'result' => $result]);
    }
    die();
  }

}
