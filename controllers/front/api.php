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

use \Revws\Review;

class RevwsApiModuleFrontController extends ModuleFrontController {
  public $module;

  public function __construct() {
    parent::__construct();
    $this->context = Context::getContext();
  }

  public function initContent() {
    parent::initContent();
    if (Tools::isSubmit('action') && Tools::getValue('action') == 'command') {
      $this->ajaxProcessCommand();
    }
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
    switch ($cmd) {
      case 'create':
        return $this->createReview();
      case 'update':
        return $this->updateReview();
      case 'delete':
        return $this->deleteReview();
      case 'vote':
        return $this->vote();
      case 'vote':
        return $this->reportAbuse();
      default:
        throw new Exception("Unknown command $cmd");
    }
  }

  private function createReview() {
    $productId = (int)Tools::getValue('productId');
    $id = (int)Tools::getValue('id');
    $perms = $this->module->getPermissions();
    if (! $perms->canCreateReview($productId)) {
      throw new Exception("Permission denied");
    }
    if ($id > 0) {
      throw new Exception("Invalid request");
    }
    $review = $this->getReviewPayload();
    if (! $review->save()) {
      throw new Exception('Failed to create review');
    }
    return $this->returnReview($review->id);
  }

  private function updateReview() {
    $id = (int)Tools::getValue('id');
    $perms = $this->module->getPermissions();
    if ($id <= 0) {
      throw new Exception("Invalid request");
    }
    $review = $this->getReviewPayload();
    if (! $perms->canEdit($review)) {
      throw new Exception("Permission denied");
    }
    if (! $review->save()) {
      throw new Exception('Failed to update review');
    }
    return $this->returnReview($review->id);
  }

  private function deleteReview() {
    $id = (int)Tools::getValue('id');
    $review = $this->getReviewById($id);
    if (! $this->module->getPermissions()->canDelete($review)) {
      throw new Exception("Permission denied");
    }
    return $review->delete();
  }

  private function vote() {
    $id = (int)Tools::getValue('id');
    $up = Tools::getValue('direction') === 'up';
    $review = $this->getReviewById($id);
    if (! $this->module->getPermissions()->canVote($review)) {
      throw new Exception("Permission denied");
    }
    return $review->vote($up);
  }

  private function reportAbuse() {
    $id = (int)Tools::getValue('id');
    $reason = Tools::getValue('reason');
    $review = $this->getReviewById($id);
    if (! $this->module->getPermissions()->canReportAbuse($review)) {
      throw new Exception("Permission denied");
    }
    return $review->reportAbuse($reason);
  }

  private function getReviewPayload() {
    return Review::fromRequest($this->module->getVisitor());
  }

  private function getReviewById($id) {
    $review = new Review($id);
    if (! Validate::isLoadedObject($review)) {
      throw new Exception('Review not found');
    }
    return $review;
  }

  private function returnReview($id){
    $review = new Review($id);
    $review->loadGrades();
    return $review->toJSData($this->module->getPermissions());
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
