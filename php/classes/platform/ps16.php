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

use Context;
use Controller;
use Dispatcher;
use ImageType;
use Media;
use PrestaShopException;
use Tools;

class PlatformPrestashop16 extends Platform
{
    /**
     * @param Controller $controller
     * @param string $id
     * @param string $relativePath
     * @param string|null $media
     * @param int|null $priority
     *
     * @return void
     */
    public function registerStylesheet($controller, $id, $relativePath, $media = null, $priority = null)
    {
        if (!$media) {
            $media = 'all';
        }
        $controller->addCSS($relativePath, $media, null, false);
    }

    /**
     * @param Controller $controller
     * @param string $id
     * @param string $relativePath
     * @param string|null $position
     * @param int|null $priority
     */
    public function registerJavascript($controller, $id, $relativePath, $position = null, $priority = null)
    {
        $controller->addJS($relativePath);
    }

    /**
     * @return string
     */
    public function getThemeName()
    {
        return Context::getContext()->theme->name;
    }


    /**
     * @param string $imageType
     *
     * @return string
     * @throws PrestaShopException
     */
    public function getImageTypeName($imageType)
    {
        return ImageType::getFormatedName($imageType);
    }

    /**
     * @return bool
     */
    public function isInModal()
    {
        return (bool)Tools::getValue('content_only');
    }

    /**
     * @param array $array
     *
     * @return void
     */
    public function addJsDef($array)
    {
        Media::addJsDef($array);
    }

    /**
     * @return array
     */
    public function getJsDefs()
    {
        // implemented via Media class
        return [];
    }

    /**
     * @return string
     */
    public function getId()
    {
        return 'ps16';
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'prestashop';
    }

    /**
     * @return string
     */
    public function getVersion()
    {
        return _PS_VERSION_;
    }

    /**
     * @param string $relativePath
     *
     * @return string
     */
    public function getTemplateUri($relativePath)
    {
        $relativePath = parent::getTemplateUri($relativePath);
        return preg_replace('#.*\/#', '', $relativePath);
    }

    /**
     * @param string $controller
     * @param array $params
     *
     * @return string
     * @throws PrestaShopException
     */
    public function getAdminLink($controller, $params = [])
    {
        $context = Context::getContext();
        $idLang = $context->language->id;
        $params = array_merge($params, ['token' => Tools::getAdminTokenLite($controller)]);
        return Dispatcher::getInstance()->createUrl($controller, $idLang, $params, false);
    }

}