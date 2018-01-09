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

/**
 * Class ProductCommentsDefaultModuleFrontController
 */
class RevwsApiModuleFrontController extends ModuleFrontController {
  public $module;

  public function __construct() {
    parent::__construct();
    $this->context = Context::getContext();
  }

  protected function ajaxProcessCommand() {
    ob_start();
    $moduleInstance = $this->module;
    $cmd = Tools::getValue('cmd');
    $error = null;
    $result = null;
    try {
      if ($this->module->getPermissions()->canPerform($cmd)) {
        $result = true;
      } else {
        $error = $this->l("Not allowed");
      }
    } catch (Exception $e) {
      $error = $e->getMessage();
    }
    ob_end_clean();
    $this->reply($error, $success);
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
