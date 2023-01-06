<?php
/**
 * Copyright (C) 2017-2023 Petr Hucik <petr@getdatakick.com>
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
 * @copyright 2017-2023 Petr Hucik
 * @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
 */

use Revws\Actor;
use Revws\Notifications;

class RevwsEmailActionModuleFrontController extends ModuleFrontController
{
    /**
     * @var Revws
     */
    public $module;

    /**
     * @throws PrestaShopException
     */
    public function __construct()
    {
        parent::__construct();
        $this->context = Context::getContext();
    }

    /**
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function init()
    {
        parent::init();
        try {
            $action = $this->getValueOrThrow('action');
            switch ($action) {
                case 'approve':
                    $this->approval('approve');
                    return;
                case 'reject':
                    $this->approval('reject');
                    return;
                default:
                    throw new InvalidArgumentException("Unknown action $action");
            }
        } catch (Exception $e) {
            $this->context->smarty->assign('error', $e->getMessage());
            $this->setTemplate($this->module->getPlatform()->getTemplateUri('views/templates/front/email-action-error.tpl'));
        } finally {
            Notifications::getInstance()->process($this->module);
        }
    }

    /**
     * @param string $key
     *
     * @return mixed
     * @throws PrestaShopException
     */
    private function getValueOrThrow($key)
    {
        $ret = Tools::getValue($key);
        if (!$ret) {
            throw new PrestaShopException("$key not found in request");
        }
        return $ret;
    }

    /**
     * @param string $action
     *
     * @return void
     * @throws PrestaShopException
     */
    private function approval($action)
    {
        $review = $this->getReview(Tools::getValue('review-id'));
        $hash = $this->getValueOrThrow('secret');
        if (!$review->verifySecretHash($action, $hash, $this->module->getSettings())) {
            throw new PrestaShopException('Permission denied');
        }
        // secret hash has been validated, we can approve it
        Actor::setActor('employee');
        $approved = $action === 'approve';
        $review->validated = $approved;
        $review->deleted = !$approved;
        if ($review->save()) {
            $this->context->smarty->assign('review', $review->toJSData($this->module->getPermissions()));
            $this->context->smarty->assign('approved', $approved);
            $this->setTemplate($this->module->getPlatform()->getTemplateUri('views/templates/front/email-action-approval.tpl'));
        } else {
            throw new PrestaShopException('Failed to update review');
        }
    }

    /**
     * @param int $id
     *
     * @return RevwsReview
     * @throws PrestaShopException
     */
    private function getReview($id)
    {
        $review = new RevwsReview((int)$id);
        if (!Validate::isLoadedObject($review)) {
            throw new PrestaShopException('Review not found');
        }
        $review->loadGrades();
        return $review;
    }

}
