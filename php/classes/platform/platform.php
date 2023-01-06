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
use Hook;
use PrestaShopException;
use Revws;
use SmartyException;

abstract class Platform
{
    /**
     * @var Revws
     */
    private $module;

    /**
     * @var string
     */
    private $file;

    /**
     * @param string $file
     * @param Revws $module
     */
    public function __construct($file, $module)
    {
        $this->file = $file;
        $this->module = $module;
    }

    /**
     * @return string
     */
    public abstract function getName();

    /**
     * @return string
     */
    public abstract function getVersion();

    /**
     * @param Controller $controller
     * @param string $id
     * @param string $relativePath
     * @param string|null $media
     * @param int|null $priority
     */
    public abstract function registerStylesheet($controller, $id, $relativePath, $media = null, $priority = null);

    /**
     * @param Controller $controller
     * @param string $id
     * @param string $relativePath
     * @param string|null $position
     * @param int|null $priority
     */
    public abstract function registerJavascript($controller, $id, $relativePath, $position = null, $priority = null);

    /**
     * @return string
     */
    public abstract function getThemeName();

    /**
     * @return bool
     */
    public function shouldAddCanonicalTags()
    {
        return true;
    }

    /**
     * @param int $imageId
     * @param string $rewrite
     * @param string $imageType
     *
     * @return string
     * @throws PrestaShopException
     */
    public function getImageLink($imageId, $rewrite, $imageType)
    {
        return Context::getContext()->link->getImageLink($rewrite, $imageId, $this->getImageTypeName($imageType));
    }

    /**
     * @param string $imageType
     *
     * @return string
     */
    protected abstract function getImageTypeName($imageType);

    /**
     * @return bool
     */
    public abstract function isInModal();

    /**
     * @param array $array
     *
     * @return void
     */
    public abstract function addJsDef($array);

    /**
     * @return array
     */
    public abstract function getJsDefs();

    /**
     * @param string $relativePath
     * @param array $variables
     *
     * @return string
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function displayTemplate($relativePath, $variables = [], $cacheId = null)
    {
        if ($variables) {
            $smarty = $this->module->getContext()->smarty;
            $smarty->assign($variables);
        }
        $dir = rtrim(dirname($this->file), '/') . '/';
        $specificTemplate = str_replace('.tpl', '.' . $this->getId() . '.tpl', $relativePath);
        if (file_exists($dir . $specificTemplate)) {
            $template = $specificTemplate;
        } else {
            $template = $relativePath;
        }
        return $this->module->display($this->file, $template, $cacheId);
    }

    /**
     * @return string
     */
    public abstract function getId();

    /**
     * @param string $relativePath
     *
     * @return string
     */
    public function getTemplateUri($relativePath)
    {
        return $this->resolveAsset($relativePath);
    }

    /**
     * @return string[]
     */
    public function getAssetsVariants()
    {
        return [ $this->getId() ];
    }

    /**
     * @param string $relativePath
     *
     * @return string
     */
    public function resolveAsset($relativePath)
    {
        $dir = rtrim(dirname($this->file), '/') . '/';
        if (file_exists($dir . $relativePath)) {
            if (preg_match("#^(.*)\.(css|js|tpl)$#i", $relativePath, $matches)) {
                foreach ($this->getAssetsVariants() as $variantId) {
                    $platformSpecificVariant = $matches[1] . '.' . $variantId . '.' . $matches[2];
                    if (file_exists($dir . $platformSpecificVariant)) {
                        return $platformSpecificVariant;
                    }
                }
            }
        }
        return $relativePath;
    }

    /**
     * @return array
     *
     * @throws PrestaShopException
     */
    public function getHookAliasList()
    {
        return Hook::getHookAliasList();
    }

    /**
     * @param string $controller
     * @param array $params
     *
     * @return string
     */
    public abstract function getAdminLink($controller, $params = []);
}