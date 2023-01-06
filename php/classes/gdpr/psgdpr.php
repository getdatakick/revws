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

/** @noinspection PhpUndefinedClassInspection */

namespace Revws;

use GDPRConsent;
use GDPRLog;
use Module;
use PrestaShopException;

class PrestashopGDRP implements GDPRInterface
{
    const MODULE_NAME = 'psgdpr';

    /**
     * @var
     */
    private $revwsModuleId;

    /**
     * @param int $revwsModuleId
     */
    public function __construct($revwsModuleId)
    {
        $this->revwsModuleId = $revwsModuleId;
    }

    /**
     * @return bool
     * @throws \PrestaShopException
     */
    public static function isAvailable()
    {
        return (
            Module::isInstalled(self::MODULE_NAME) &&
            Module::isEnabled(self::MODULE_NAME)
        );
    }

    /**
     * @param Visitor $visitor
     *
     * @return bool
     * @throws PrestaShopException
     */
    public function isEnabled(Visitor $visitor)
    {
        if (self::loadGDPR()) {
            $active = GDPRConsent::getConsentActive($this->revwsModuleId);
            return ($active === "1" || $active === true || $active === 1);
        }
        return false;
    }

    /**
     * @return bool
     * @throws PrestaShopException
     */
    private static function loadGDPR()
    {
        if (self::checkEnvironment()) {
            return true;
        }

        if (self::isAvailable()) {
            Module::getInstanceByName(self::MODULE_NAME);
            return self::checkEnvironment();
        }
        return false;
    }

    /**
     * @return bool
     */
    private static function checkEnvironment()
    {
        return (
            is_callable(['GDPRLog', 'addLog']) &&
            is_callable(['GDPRConsent', 'getConsentMessage'])
        );
    }

    /**
     * @param Visitor $visitor
     *
     * @return void
     * @throws PrestaShopException
     */
    public function getConsentMessage(Visitor $visitor)
    {
        if (self::loadGDPR()) {
            return GDPRConsent::getConsentMessage($this->revwsModuleId, $visitor->getLanguage());
        }
    }

    /**
     * @param Visitor $visitor
     *
     * @return void
     * @throws PrestaShopException
     */
    public function logConsent(Visitor $visitor)
    {
        if (self::loadGDPR()) {
            GDPRLog::addLog($visitor->getCustomerId(), 'consent', $this->revwsModuleId, $visitor->getGuestId());
        }
    }
}
