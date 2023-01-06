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

interface Permissions
{
    /**
     * @param string $entityType
     * @param int $entityId
     *
     * @return bool
     */
    function canCreateReview($entityType, $entityId);

    /**
     * @param RevwsReview $review
     *
     * @return bool
     */
    function canReportAbuse(RevwsReview $review);

    /**
     * @param RevwsReview $review
     *
     * @return bool
     */
    function canVote(RevwsReview $review);

    /**
     * @param RevwsReview $review
     *
     * @return bool
     */
    function canDelete(RevwsReview $review);

    /**
     * @param RevwsReview $review
     *
     * @return bool
     */
    function canEdit(RevwsReview $review);
}
