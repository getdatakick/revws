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

class AdminRevwsBackendController extends ModuleAdminController {
  public $module;

  public function __construct() {
    parent::__construct();
    $this->display = 'view';
    $this->bootstrap = true;
    $this->addCSS($this->getPath('views/css/back.css'));
    $this->addJs($this->module->getSettings()->getBackendAppUrl($this->module->name));
  }

  public function display() {
    $settings = $this->module->getSettings();
    $this->context->smarty->assign([
      'help_link' => null,
      'title' => $this->l('Product reviews'),
      'revws' => [
        'api' => $this->context->link->getAdminLink('AdminRevwsBackendController'),
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

  public function ajaxProcessRequest() {
  }

}
