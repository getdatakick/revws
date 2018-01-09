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

  public function __construct() {
    parent::__construct();
    $this->display = 'view';
    $this->bootstrap = true;
    $this->addCSS($this->getPath('views/css/back.css'));
    $this->addJs($this->getPath('views/js/back.js'));
  }

  public function display() {
    $this->context->smarty->assign('help_link', null);
    $this->context->smarty->assign('title', $this->l('Product reviews'));
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

  public function renderView() {
    return "<div id='revws-app'>please wait...</div>";
  }

  private function getPath($path) {
    return _PS_MODULE_DIR_ . $this->module->name . '/' . $path;
  }

  public function ajaxProcessRequest() {
  }

}
