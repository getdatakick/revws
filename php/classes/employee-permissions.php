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

use RevwsReview;

class EmployeePermissions implements Permissions
{
    /**
     * @var EmployeePermissions
     */
    static $instance = null;

    /**
     * @return EmployeePermissions
     */
    public static function getInstance()
    {
        if (!self::$instance) {
            self::$instance = new EmployeePermissions();
        }
        return self::$instance;
    }

    /**
     * @param string $entityType
     * @param int $entityId
     *
     * @return true
     */
    public function canCreateReview($entityType, $entityId)
    {
        return true;
    }

    /**
     * @param RevwsReview $review
     *
     * @return false
     */
    public function canReportAbuse(RevwsReview $review)
    {
        return false;
    }

    /**
     * @param RevwsReview $review
     *
     * @return false
     */
    public function canVote(RevwsReview $review)
    {
        return false;
    }

    /**
     * @param RevwsReview $review
     *
     * @return true
     */
    public function canDelete(RevwsReview $review)
    {
        return true;
    }

    /**
     * @param RevwsReview $review
     *
     * @return true
     */
    public function canEdit(RevwsReview $review)
    {
        return true;
    }
}
