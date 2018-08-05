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
use \Revws\CSRFToken;
use \Revws\ReviewList;

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
    $errorCode = -1;
    $result = null;
    try {
      $cmd = Tools::getValue('cmd');
      if ($cmd != 'refreshToken') {
        $this->module->csrf()->validate(Tools::getValue('revwsToken'));
      }
      $result = $this->dispatchCommand($cmd);
    } catch (Exception $e) {
      $error = $e->getMessage();
      $errorCode = $e->getCode();
    }
    $this->reply($error, $errorCode, $result);
  }

  private function dispatchCommand($cmd) {
    switch ($cmd) {
      case 'refreshToken':
        return $this->module->csrf()->getToken();
      case 'create':
        return $this->createReview();
      case 'update':
        return $this->updateReview();
      case 'delete':
        return $this->deleteReview();
      case 'vote':
        return $this->vote();
      case 'report':
        return $this->reportAbuse();
      case 'loadList':
        return $this->loadList();
      default:
        throw new Exception("Unknown command $cmd");
    }
  }

  private function createReview() {
    $productId = (int)Tools::getValue('productId');
    $id = (int)Tools::getValue('id');
    $perms = $this->module->getPermissions();
    $settings = $this->module->getSettings();
    if (! $perms->canCreateReview($productId)) {
      throw new Exception("Permission denied");
    }
    if ($id > 0) {
      throw new Exception("Invalid request");
    }
    if ($productId === 0) {
      throw new Exception("Invalid product id");
    }
    $visitor = $this->module->getVisitor();
    $this->module->getGDPR()->logConsent($visitor);
    $product = $this->getProductById($productId);
    $review = $this->getReviewPayload();
    $review->setValidated(! $settings->validateNewReviews());
    if (! $review->save()) {
      throw new Exception('Failed to create review');
    }
    return $this->returnReview($review->id);
  }

  private function updateReview() {
    $id = (int)Tools::getValue('id');
    $perms = $this->module->getPermissions();
    $settings = $this->module->getSettings();
    if ($id <= 0) {
      throw new Exception("Invalid request");
    }
    $review = $this->getReviewPayload();
    if (! $perms->canEdit($review)) {
      throw new Exception("Permission denied");
    }
    if ($settings->validateUpdatedReviews()) {
      $review->setValidated(false);
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
    return $review->markDelete();
  }

  private function vote() {
    $settings = $this->module->getSettings();
    $id = (int)Tools::getValue('id');
    $up = Tools::getValue('direction') === 'up';
    $review = $this->getReviewById($id);
    if (! $this->module->getPermissions()->canVote($review)) {
      throw new Exception("Permission denied");
    }
    return $review->vote($up, $settings, $this->module->getVisitor());
  }

  private function reportAbuse() {
    $id = (int)Tools::getValue('id');
    $reason = Tools::getValue('reason');
    $review = $this->getReviewById($id);
    $settings = $this->module->getSettings();
    if (! $this->module->getPermissions()->canReportAbuse($review)) {
      throw new Exception("Permission denied");
    }
    if ($review->reportAbuse($reason, $settings, $this->module->getVisitor())) {
      return [
        'hide' => $settings->validateReportedReviews()
      ];
    }
    return false;
  }

  private function loadList() {
    $page = (int)Tools::getValue('page');
    $pageSize = (int)Tools::getValue('pageSize');
    $order = Tools::getValue('order');
    $orderDir = Tools::getValue('orderDir');
    if ($orderDir != 'asc' && $orderDir != 'desc') {
      throw new Exception('Invalid parameter orderDir');
    }
    $listId = Tools::getValue('listId');
    $conditions = Tools::getValue('conditions');
    if (! is_array($conditions)) {
      $conditions = [];
    }
    $list = new ReviewList($this->module, $listId, $conditions, $page, $pageSize, $order, $orderDir);
    return [
      'list' => $list,
      'entities' => $list->getEntitites()
    ];
  }

  private function getReviewPayload() {
    return RevwsReview::fromRequest($this->module->getVisitor());
  }

  private function getReviewById($id) {
    $review = new RevwsReview($id);
    if (! Validate::isLoadedObject($review)) {
      throw new Exception('Review not found');
    }
    return $review;
  }

  private function getProductById($id) {
    $product = new Product($id);
    if (! Validate::isLoadedObject($product)) {
      throw new Exception('Product not found');
    }
    return $product;
  }

  private function returnReview($id){
    $review = new RevwsReview($id);
    $review->loadGrades();
    return $review->toJSData($this->module->getPermissions());
  }

  private function reply($error, $errorCode, $result) {
    if ($error) {
      echo json_encode(['success'=>false, 'error' => $error, 'errorCode' => $errorCode]);
    } else {
      echo json_encode(['success'=>true, 'result' => $result]);
    }
    Notifications::getInstance()->closeConnectionAndProcess($this->module);
  }
}
