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

namespace Revws;

use Db;
use Hook;
use Module;
use PrestaShopException;
use RevwsReview;

class KronaIntegration
{
    const ACTION_REVIEW_CREATED = 'review_created';
    const ACTION_REVIEW_APPROVED = 'review_approved';
    const ACTION_REVIEW_DELETED = 'review_deleted';
    const ACTION_REVIEW_REJECTED = 'review_rejected';

    /**
     * @var bool
     */
    private $kronaInstalled;
    /**
     * @var array
     */
    private $pseudonymCache = [];

    /**
     * @throws PrestaShopException
     */
    public function __construct()
    {
        $this->kronaInstalled = (
            Module::isInstalled('genzo_krona') &&
            Module::isEnabled('genzo_krona')
        );
    }

    /**
     * @return bool
     */
    public function isInstalled()
    {
        return $this->kronaInstalled;
    }

    /**
     * @param int $customerId
     *
     * @return string|null
     * @throws PrestaShopException
     */
    public function getPseudonym($customerId)
    {
        if (!$this->isInstalled()) {
            return null;
        }
        $customerId = (int)$customerId;
        if (!array_key_exists($customerId, $this->pseudonymCache)) {
            $data = Hook::exec('displayKronaCustomer', array('id_customer' => $customerId), null, true, false);
            $pseudonym = null;
            if ($data && isset($data['genzo_krona']['pseudonym'])) {
                $pseudonym = $data['genzo_krona']['pseudonym'];
            }
            $this->pseudonymCache[$customerId] = $pseudonym;
        }
        return $this->pseudonymCache[$customerId];
    }

    /**
     * @return array
     * @throws PrestaShopException
     */
    public function getAllPseudonyms()
    {
        $ret = [];
        if (!$this->isInstalled()) {
            return $ret;
        }
        $table = _DB_PREFIX_ . 'genzo_krona_player';
        $sql = "SELECT id_customer, pseudonym FROM $table";
        $conn = Db::getInstance(_PS_USE_SQL_SLAVE_);
        foreach ($conn->executeS($sql) as $row) {
            $id = (int)$row['id_customer'];
            $pseudonym = $row['pseudonym'];
            $ret[$id] = $pseudonym;
        }
        return $ret;
    }

    /**
     * @param RevwsReview $review
     *
     * @return void
     * @throws PrestaShopException
     */
    public function reviewCreated($review)
    {
        $this->triggerAction(self::ACTION_REVIEW_CREATED, $review);
    }

    /**
     * @param string $action
     * @param RevwsReview $review
     *
     * @return void
     * @throws PrestaShopException
     */
    private function triggerAction($action, $review)
    {
        if (!$this->isInstalled()) {
            return;
        }
        if ($review->isCustomer()) {
            $data = [
                'module_name' => 'revws',
                'action_name' => $action,
                'id_customer' => $review->getAuthorId()
            ];
            Hook::exec('actionExecuteKronaAction', $data);
        }
    }

    /**
     * @param RevwsReview $review
     *
     * @return void
     * @throws PrestaShopException
     */
    public function reviewApproved($review)
    {
        $this->triggerAction(self::ACTION_REVIEW_APPROVED, $review);
    }

    /**
     * @param RevwsReview $review
     *
     * @return void
     * @throws PrestaShopException
     */
    public function reviewRejected($review)
    {
        $this->triggerAction(self::ACTION_REVIEW_REJECTED, $review);
    }

    /**
     * @param RevwsReview $review
     *
     * @return void
     * @throws PrestaShopException
     */
    public function reviewDeleted($review)
    {
        $this->triggerAction(self::ACTION_REVIEW_DELETED, $review);
    }

    /**
     * @return array[]
     */
    public function getActions()
    {
        if (!$this->isInstalled()) {
            return [];
        }
        return [
            self::ACTION_REVIEW_CREATED => [
                'title' => 'Review Created',
                'message' => 'You received {points} Points for having a review created',
            ],
            self::ACTION_REVIEW_APPROVED => [
                'title' => 'Review Approved by Admin',
                'message' => 'You received {points} Points for having a review approved',
            ],
            self::ACTION_REVIEW_DELETED => [
                'title' => 'Review Deleted',
                'message' => 'You lost {points} Points for deleting a review',
            ],
            self::ACTION_REVIEW_REJECTED => [
                'title' => 'Review Rejected by Admin',
                'message' => 'You lost {points} Points for having a review rejected',
            ]
        ];
    }

}
