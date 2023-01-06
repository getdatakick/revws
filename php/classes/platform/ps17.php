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
use FrontController;
use ImageType;
use Tools;

class PlatformPrestashop17 extends Platform
{

    /**
     * @var array
     */
    private $jsDefs = [];

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
        if ($controller instanceof FrontController) {
            $params = [];
            if (isset($media)) {
                $params['media'] = $media;
            }
            if (isset($priority)) {
                $params['priority'] = (int)$priority;
            }
            $controller->registerStylesheet($id, $relativePath, $params);
        } else {
            $controller->addCSS($relativePath);
        }
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
        if ($controller instanceof FrontController) {
            $params = [];
            if (isset($position)) {
                $params['position'] = $position;
            }
            if (isset($priority)) {
                $params['priority'] = (int)$priority;
            }
            $controller->registerJavascript($id, $relativePath, $params);
        } else {
            $controller->addJS($relativePath);
        }
    }

    /**
     * @return string
     */
    public function getThemeName()
    {
        return Context::getContext()->shop->theme->getName();
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'prestashop';
    }

    /**
     * @param string $imageType
     *
     * @return string
     */
    public function getImageTypeName($imageType)
    {
        return ImageType::getFormattedName($imageType);
    }

    /**
     * @return bool
     */
    public function isInModal()
    {
        return Tools::getValue('action') === 'quickview';
    }

    /**
     * @param array $array
     *
     * @return void
     */
    public function addJsDef($array)
    {
        foreach ($array as $key => $value) {
            $this->jsDefs[$key] = $value;
        }
    }

    /**
     * @return array
     */
    public function getJsDefs()
    {
        return $this->jsDefs;
    }

    /**
     * @return string
     */
    public function getId()
    {
        return 'ps17';
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
        return 'module:revws/' . parent::getTemplateUri($relativePath);
    }

    /**
     * @param string $controller
     * @param array $params
     *
     * @return string
     * @throws \PrestaShopException
     */
    public function getAdminLink($controller, $params = [])
    {
        $link = Context::getContext()->link;
        return $link->getAdminLink($controller, true, $params, $params);
    }

}