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
define('REVWS_MODULE_DIR', __DIR__);

require_once __DIR__ . '/app-translation.php';
require_once __DIR__ . '/classes/csrf.php';
require_once __DIR__ . '/classes/csv-reader.php';
require_once __DIR__ . '/classes/color.php';
require_once __DIR__ . '/classes/utils.php';
require_once __DIR__ . '/classes/gdpr/interface.php';
require_once __DIR__ . '/classes/gdpr/psgdpr.php';
require_once __DIR__ . '/classes/gdpr/basic.php';
require_once __DIR__ . '/classes/gdpr/gdpr.php';
require_once __DIR__ . '/classes/settings.php';
require_once __DIR__ . '/classes/permissions.php';
require_once __DIR__ . '/classes/visitor-permissions.php';
require_once __DIR__ . '/classes/employee-permissions.php';
require_once __DIR__ . '/classes/no-permissions.php';
require_once __DIR__ . '/classes/shapes.php';
require_once __DIR__ . '/classes/visitor.php';
require_once __DIR__ . '/classes/review-query.php';
require_once __DIR__ . '/classes/notifications.php';
require_once __DIR__ . '/classes/actor.php';
require_once __DIR__ . '/classes/review-list.php';
require_once __DIR__ . '/classes/front-app.php';
require_once __DIR__ . '/classes/backup.php';
require_once __DIR__ . '/classes/integration/datakick.php';
require_once __DIR__ . '/classes/integration/krona.php';
require_once __DIR__ . '/classes/migration-utils.php';
require_once __DIR__ . '/classes/platform/platform.php';
require_once __DIR__ . '/model/criterion.php';
require_once __DIR__ . '/model/review.php';

class Revws extends Module
{

    /**
     * @var \Revws\Permissions
     */
    private $permissions;

    /**
     * @var \Revws\Visitor
     */
    private $visitor;

    /**
     * @var \Revws\Settings
     */
    private $settings;

    /**
     * @var \Revws\KronaIntegration
     */
    private $krona;

    /**
     * @var \Revws\CSRFToken
     */
    private $csrfToken;

    /**
     * @var \Revws\GDPR
     */
    private $gdpr;

    /**
     * @var \Revws\FrontApp
     */
    private $frontApp;

    /**
     * Revws constructor.
     *
     * @throws PrestaShopException
     */
    public function __construct()
    {
        $this->name = 'revws';
        $this->tab = 'administration';
        $this->version = '1.3.0';
        $this->author = 'DataKick';
        $this->need_instance = 0;
        $this->bootstrap = true;
        parent::__construct();
        $this->displayName = $this->l('Revws - Product Reviews');
        $this->description = $this->l('Product Reviews module');
        $this->confirmUninstall = $this->l('Are you sure you want to uninstall the module? All its data will be lost!');
        $this->ps_versions_compliancy = ['min' => '1.6', 'max' => _PS_VERSION_];
        $this->controllers = ['MyReviews', 'AllReviews'];
    }

    /**
     * @param array $list
     * @param int $increment
     *
     * @return string
     */
    public static function getPageUrl($list, $increment)
    {
        $pages = (int)$list['pages'];
        $page = (int)$list['page'] + (int)$increment + 1;
        $current = $_SERVER['REQUEST_URI'];
        if ($page >= 1 && $page <= $pages) {
            $url = explode('?', $current);
            $uri = $url[0];
            $queryString = isset($url[1]) ? $url[1] : '';
            parse_str($queryString, $queryStringParams);
            $id = 'revws-' . $list['id'];
            $pageSizeParam = "$id-page-size";
            $pageParam = "$id-page";
            $queryStringParams[$pageSizeParam] = (int)$list['pageSize'];
            $queryStringParams[$pageParam] = $page;
            return "$uri?" . http_build_query($queryStringParams);
        }
        return $current;
    }

    /**
     * @return bool
     *
     * @throws PrestaShopException
     */
    public function reset()
    {
        return (
            $this->uninstall(false) &&
            $this->install(false)
        );
    }

    /**
     * @param bool $dropTables
     *
     * @return bool
     *
     * @throws PrestaShopException
     */
    public function uninstall($dropTables = true)
    {
        return (
            $this->uninstallDb($dropTables) &&
            $this->unregisterHooks() &&
            $this->removeTab() &&
            $this->getSettings(false)->remove() &&
            parent::uninstall()
        );
    }

    /**
     * @param bool $drop
     *
     * @return bool
     *
     * @throws PrestaShopException
     */
    private function uninstallDb($drop)
    {
        if (!$drop) {
            return true;
        }
        return $this->executeSqlScript('uninstall', false);
    }

    /**
     * @param string $script
     * @param bool $check
     *
     * @return bool
     * @throws PrestaShopException
     */
    public function executeSqlScript($script, $check = true)
    {
        $file = dirname(__FILE__) . '/sql/' . $script . '.sql';
        if (!file_exists($file)) {
            return false;
        }
        $sql = file_get_contents($file);
        if (!$sql) {
            return false;
        }
        $sql = str_replace(['PREFIX_', 'ENGINE_TYPE', 'CHARSET_TYPE', 'COLLATE_TYPE'], [_DB_PREFIX_, _MYSQL_ENGINE_, 'utf8mb4', 'utf8mb4_unicode_ci'], $sql);
        $sql = preg_split("/;\s*[\r\n]+/", $sql);
        foreach ($sql as $statement) {
            $stmt = trim($statement);
            if ($stmt) {
                try {
                    if (!Db::getInstance()->execute($stmt)) {
                        PrestaShopLogger::addLog("revws: migration script $script: $stmt: error");
                        if ($check) {
                            return false;
                        }
                    }
                } catch (\Exception $e) {
                    PrestaShopLogger::addLog("revws: migration script $script: $stmt: exception");
                    if ($check) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    /**
     * @return bool
     *
     * @throws PrestaShopException
     */
    public function unregisterHooks()
    {
        return $this->setupHooks([]);
    }

    /**
     * @param array $hooks
     *
     * @return bool
     *
     * @throws PrestaShopException
     */
    private function setupHooks($hooks)
    {
        $id = $this->id;
        $install = [];
        $delete = [];
        $aliases = $this->getPlatform()->getHookAliasList();
        foreach ($hooks as $hook) {
            $key = strtolower($hook);
            if (isset($aliases[$key])) {
                $hook = $aliases[$key];
                $key = strtolower($hook);
            }
            $install[$key] = $hook;
        }
        $sql = 'SELECT DISTINCT LOWER(h.name) AS `hook` FROM ' . _DB_PREFIX_ . 'hook h INNER JOIN ' . _DB_PREFIX_ . 'hook_module hm ON (h.id_hook = hm.id_hook) WHERE hm.id_module = ' . (int)$id;
        foreach (Db::getInstance()->executeS($sql) as $row) {
            $hook = $row['hook'];
            if (isset($install[$hook])) {
                unset($install[$hook]);
            } else {
                $delete[] = $hook;
            }
        }
        $ret = true;
        foreach ($install as $hook) {
            if (!$this->registerHook($hook)) {
                $ret = false;
            }
        }
        foreach ($delete as $hook) {
            $this->unregisterHook($hook);
        }
        return $ret;
    }

    /**
     * @return bool
     *
     * @throws PrestaShopException
     */
    private function removeTab()
    {
        $tabId = Tab::getIdFromClassName('AdminRevwsBackend');
        if ($tabId) {
            $tab = new Tab($tabId);
            return $tab->delete();
        }
        return true;
    }

    /**
     * @param bool $check
     *
     * @return \Revws\Settings
     *
     * @throws PrestaShopException
     */
    public function getSettings($check = true)
    {
        if (!$this->settings) {
            $this->settings = new \Revws\Settings();
            $version = $this->settings->getVersion();
            if ($check && $version != $this->version) {
                if (version_compare($version, $this->version, '<')) {
                    $this->migrate($version);
                }
                $this->registerHooks();
                if (is_callable([$this, 'installControllers'])) {
                    $this->installControllers();
                }
                $this->settings->setVersion($this->version);
            }
        }
        return $this->settings;
    }

    /**
     * @param string $version
     *
     * @throws PrestaShopException
     */
    private function migrate($version)
    {
        $utils = new \Revws\MigrationUtils(Db::getInstance());
        if (version_compare($version, '1.0.9', '<')) {
            $this->executeSqlScript('update-verified_buyer', false);
        }
        $this->executeSqlScript('update-review-image', false);
        if (!$utils->columnExists(_DB_PREFIX_ . 'revws_criterion', 'entity_type')) {
            $this->executeSqlScript('add-entity-type', false);
        }
        $this->executeSqlScript('fix-table-charset', false);
    }

    /**
     * @return bool
     *
     * @throws PrestaShopException
     */
    public function registerHooks()
    {
        return $this->setupHooks([
            'displayHeader',
            'moduleRoutes',
            'displayMobileHeader',
            'displayProductTab',
            'displayProductTabContent',
            'displayRightColumnProduct',
            'displayBeforeBodyClosingTag',
            'displayProductExtraContent',
            'displayProductListReviews',
            'displayProductButtons',
            'displayProductAdditionalInfo',
            'displayProductComparison',
            'displayCustomerAccount',
            'displayMyAccountBlock',
            'displayFooterProduct',
            'datakickExtend',
            'actionRegisterKronaAction',
            'displayRevwsReview',
            'displayRevwsReviewList',
            'displayRevwsAverageRating',
            'registerGDPRConsent',
            'actionDeleteGDPRCustomer',
            'actionExportGDPRData',
            'actionGetConseqsTriggers',
        ]);
    }

    /**
     * @param bool $createTables
     *
     * @return bool
     *
     * @throws PrestaShopException
     */
    public function install($createTables = true)
    {
        return (
            parent::install() &&
            $this->installDb($createTables) &&
            $this->installTab() &&
            $this->registerHooks() &&
            $this->getSettings()->init()
        );
    }

    /**
     * @param bool $create
     *
     * @return bool
     *
     * @throws PrestaShopException
     */
    private function installDb($create)
    {
        if (!$create) {
            return true;
        }
        return $this->executeSqlScript('install');
    }

    /**
     * @return bool
     *
     * @throws PrestaShopException
     */
    private function installTab()
    {
        $tab = new Tab();
        $tab->active = 1;
        $tab->class_name = 'AdminRevwsBackend';
        $tab->module = $this->name;
        $tab->id_parent = $this->getTabParent();
        $tab->name = [];
        foreach (Language::getLanguages(true) as $lang) {
            $tab->name[$lang['id_lang']] = 'Product reviews';
        }
        return $tab->add();
    }

    /**
     * @return int
     *
     * @throws PrestaShopException
     */
    private function getTabParent()
    {
        $catalog = Tab::getIdFromClassName('AdminCatalog');
        if ($catalog !== false) {
            return $catalog;
        }
        return 0;
    }

    /**
     * @throws PrestaShopException
     */
    public function getContent()
    {
        Tools::redirectAdmin($this->context->link->getAdminLink('AdminRevwsBackend') . '#/settings');
    }

    /**
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayProductTab()
    {
        if ($this->getSettings()->getPlacement() === 'tab') {
            $list = $this->getProductReviewList();
            return $this->getPlatform()->displayTemplate('views/templates/hook/product_tab_header.tpl', [
                'revwsTotal' => $list->getTotal()
            ]);
        }
        return null;
    }

    /**
     * @return \Revws\ReviewList
     *
     * @throws PrestaShopException
     */
    private function getProductReviewList()
    {
        $productId = (int)(Tools::getValue('id_product'));
        $frontApp = $this->getFrontApp();
        $frontApp->addEntity('product', $productId);
        if (isset($_GET['post_review']) && $this->getPermissions()->canCreateReview('product', $productId)) {
            $frontApp->addInitAction([
                'type' => 'TRIGGER_CREATE_REVIEW',
                'entityType' => 'product',
                'entityId' => $productId
            ]);
        }
        $settings = $this->getSettings();
        $widget = $frontApp->addEntityListWidget('product', $productId, $settings->emitRichSnippets());
        $list = $frontApp->getList($widget['listId']);
        $this->context->smarty->assign([
            'widget' => $widget,
            'reviewList' => $list->getData(),
            'visitor' => $frontApp->getVisitorData(),
            'reviewsData' => $frontApp->getStaticData(),
            'reviewEntities' => $frontApp->getEntities(),
        ]);
        if ($settings->emitRichSnippets()) {
            list($grade, $count) = RevwsReview::getAverageGrade($settings, $productId);
            $this->context->smarty->assign([
                'avgGrade' => $grade,
                'reviewCount' => $count
            ]);
        }
        return $list;
    }

    /**
     * @return \Revws\FrontApp
     */
    public function getFrontApp()
    {
        if (!$this->frontApp) {
            $this->frontApp = new \Revws\FrontApp($this);
            $this->getPlatform()->addJsDef(['revwsData' => $this->frontApp]);
        }
        return $this->frontApp;
    }

    /**
     * @return \Revws\Platform
     */
    public function getPlatform()
    {
        static $platform = null;
        if ($platform === null) {
            if (defined('_TB_VERSION_')) {
                require_once(__DIR__ . '/classes/platform/thirtybees.php');
                $platform = new \Revws\PlatformThirtybees(__FILE__, $this);
            } else {
                if (version_compare(_PS_VERSION_, '8', '>=')) {
                    require_once(__DIR__ . '/classes/platform/ps8.php');
                    $platform = new \Revws\PlatformPrestashop8(__FILE__, $this);
                } elseif (version_compare(_PS_VERSION_, '1.7', '>=')) {
                    require_once(__DIR__ . '/classes/platform/ps17.php');
                    $platform = new \Revws\PlatformPrestashop17(__FILE__, $this);
                } else {
                    require_once(__DIR__ . '/classes/platform/ps16.php');
                    $platform = new \Revws\PlatformPrestashop16(__FILE__, $this);
                }
            }
        }
        return $platform;
    }

    /**
     * @return \Revws\Permissions
     *
     * @throws PrestaShopException
     */
    public function getPermissions()
    {
        if (!$this->permissions) {
            if (isset($this->context->employee) && $this->context->employee->id > 0) {
                $this->permissions = new \Revws\EmployeePermissions();
            } else {
                $this->permissions = new \Revws\VisitorPermissions($this->getSettings(), $this->getVisitor());
            }
        }
        return $this->permissions;
    }

    /**
     * @return \Revws\Visitor
     *
     * @throws PrestaShopException
     */
    public function getVisitor()
    {
        if (!$this->visitor) {
            $this->visitor = new \Revws\Visitor($this->context, $this->getSettings(), $this->getKrona());
        }
        return $this->visitor;
    }

    /**
     * @return \Revws\KronaIntegration
     */
    public function getKrona()
    {
        if (!$this->krona) {
            $this->krona = new \Revws\KronaIntegration();
        }
        return $this->krona;
    }

    /**
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayProductTabContent()
    {
        $set = $this->getSettings();
        if ($this->getSettings()->getPlacement() === 'tab') {
            $list = $this->getProductReviewList();
            if ($list->isEmpty() && $this->getVisitor()->isGuest() && $set->hideEmptyReviews()) {
                return null;
            }
            return $this->getPlatform()->displayTemplate('views/templates/hook/product_tab_content.tpl');
        }
        return null;
    }

    /**
     * Hook handler
     *
     * Specific to prestashop 1.7 and higher
     *
     * @param array $params
     *
     * @return array
     *
     * @throws PrestaShopException
     * @throws SmartyException
     *
     * @noinspection PhpUndefinedClassInspection
     * @noinspection PhpUndefinedNamespaceInspection
     */
    public function hookDisplayProductExtraContent($params)
    {
        $set = $this->getSettings();
        if ($this->getSettings()->getPlacement() === 'tab') {
            $list = $this->getProductReviewList();
            if ($list->isEmpty() && $this->getVisitor()->isGuest() && $set->hideEmptyReviews()) {
                return null;
            }
            $content = $this->getPlatform()->displayTemplate('views/templates/hook/product_tab_content.tpl');
            $tab = new PrestaShop\PrestaShop\Core\Product\ProductExtraContent();
            $tab->setTitle(sprintf($this->l('Reviews (%s)'), $list->getTotal()));
            $tab->setContent($content);
            return [$tab];
        } else {
            return [];
        }
    }

    /**
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayFooterProduct()
    {
        $set = $this->getSettings();
        if ($set->getPlacement() === 'block') {
            $list = $this->getProductReviewList();
            $this->context->smarty->assign('revwsTotal', $list->getTotal());
            if ($list->isEmpty() && $this->getVisitor()->isGuest() && $set->hideEmptyReviews()) {
                return null;
            }
            return $this->getPlatform()->displayTemplate('views/templates/hook/product_footer.tpl');
        }
        return null;
    }

    /**
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayHeader()
    {
        return $this->hookHeader();
    }

    /**
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookHeader()
    {
        $this->csrf();
        $controller = $this->context->controller;
        $this->includeCommonStyles($controller);
        $this->getPlatform()->registerJavascript($controller, 'revws-front', '/modules/revws/views/js/revws_bootstrap.js', 'bottom', 1);
        return $this->addCanonicalTags($controller->php_self);
    }

    /**
     * @return \Revws\CSRFToken
     * @throws PrestaShopException
     */
    public function csrf()
    {
        if (!$this->csrfToken) {
            $this->csrfToken = new \Revws\CSRFToken($this->context->cookie, $this->getSettings());
        }
        return $this->csrfToken;
    }

    /**
     * @param Controller $controller
     * @param bool $back
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function includeCommonStyles($controller, $back = false)
    {
        $controller->addJquery();
        $controller->addJqueryPlugin('fancybox');
        $file = $this->getCSSFile();
        $platform = $this->getPlatform();
        $platform->registerStylesheet($controller, "revws-css", $file, 'all', 1000);
        if (!$back) {
            $themeName = "views/css/themes/" . $platform->getThemeName() . ".css";
            if (file_exists(REVWS_MODULE_DIR . '/' . $themeName)) {
                $themeFile = $this->getPath($themeName);
                $platform->registerStylesheet($controller, "revws-theme-css", $themeFile, 'all', 1001);
            }
        }
    }

    /**
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function getCSSFile()
    {
        $set = $this->getSettings();
        $version = $this->getCSSVersion($set);
        $name = "views/css/revws-$version.css";
        $filename = REVWS_MODULE_DIR . '/' . $name;
        if (!file_exists($filename)) {
            $this->generateCSS($set, $filename);
            if (!file_exists($filename)) {
                // return fallback css file
                return $this->getPath($this->getPlatform()->resolveAsset("views/css/fallback.css"));
            }
        }
        return $this->getPath($name);
    }

    /**
     * @param \Revws\Settings $set
     *
     * @return string
     * @throws PrestaShopException
     */
    private function getCSSVersion($set)
    {
        static $version;
        if (is_null($version)) {
            $data = 'a64e2ef';
            $data .= '-' . $set->getVersion();
            $data .= '-' . json_encode($this->getCSSSettings($set));
            foreach (['css.tpl', 'css-extend.tpl'] as $tpl) {
                $source = $this->getTemplatePath($tpl);
                if ($source) {
                    $data .= '-' . filemtime($source);
                }
            }
            $version = md5($data);
        }
        return $version;
    }

    /**
     * @param \Revws\Settings $set
     *
     * @return array
     *
     * @throws PrestaShopException
     */
    private function getCSSSettings($set)
    {
        $colors = $set->getShapeColors();
        $colors['fillColorHigh'] = \Revws\Color::emphasize($colors['fillColor']);
        $colors['borderColorHigh'] = \Revws\Color::emphasize($colors['borderColor']);
        return [
            'shape' => $this->getShapeSettings(),
            'shapeSize' => [
                'product' => $set->getShapeSize(),
                'list' => $set->getShapeSize(),
                'create' => $set->getShapeSize() * 5
            ],
            'colors' => $colors,
            'productList' => [
                'noReviews' => $set->productListNoReviewsBehavior()
            ],
            'images' => [
                'thumbnail' => [
                    'width' => $set->getImageThumbnailWidth(),
                    'height' => $set->getImageThumbnailHeight(),
                ]
            ]
        ];
    }

    /**
     * @return array
     *
     * @throws PrestaShopException
     */
    private function getShapeSettings()
    {
        return \Revws\Shapes::getShape($this->getSettings()->getShape());
    }

    /**
     * @param \Revws\Settings $set
     * @param string $filename
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    private function generateCSS($set, $filename)
    {
        Tools::clearSmartyCache();
        Media::clearCache();
        $this->smarty->assign('cssSettings', $this->getCSSSettings($set));
        $css = "/* Automatically generated file - DO NOT EDIT, YOUR CHANGES WOULD BE LOST */\n\n";
        $css .= $this->getPlatform()->displayTemplate('views/templates/front/css.tpl');
        $extend = $this->getTemplatePath('css-extend.tpl');
        if ($extend) {
            $css .= "\n" . $this->getPlatform()->displayTemplate('views/templates/front/css-extend.tpl');
        }
        $css = str_replace('<!--', '/*', $css);
        $css = str_replace('-->', '*/', $css);
        $dir = dirname($filename);
        if (!is_dir($dir)) {
            @mkdir($dir);
        }
        @file_put_contents($filename, $css);
    }

    /**
     */
    public function clearCache()
    {
        Tools::clearSmartyCache();
    }

    /**
     * @param string $relative
     *
     * @return string
     */
    public function getPath($relative)
    {
        $uri = rtrim($this->getPathUri(), '/');
        $rel = ltrim($relative, '/');
        $rel = $this->getPlatform()->resolveAsset($rel);
        return "$uri/$rel";
    }

    /**
     * @param string $page
     *
     * @return string
     * @throws PrestaShopException
     */
    private function addCanonicalTags($page)
    {
        if (!$this->getPlatform()->shouldAddCanonicalTags()) {
            return null;
        }
        if ($page == 'module-revws-AllReviews') {
            $canonical = $this->context->link->getPageLink($page);
            return '<link rel="canonical" href="' . $canonical . '">' . "\n";
        }
        return null;
    }

    /**
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayMobileHeader()
    {
        return $this->hookHeader();
    }

    /**
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookMobileHeader()
    {
        return $this->hookHeader();
    }

    /**
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayRightColumnProduct()
    {
        $set = $this->getSettings();
        if ($set->getAveragePlacement() == 'rightColumn') {
            return $this->hookDisplayRevwsAverageRating(['placement' => 'extra']);
        }
        return null;
    }

    /**
     * @param array $params
     *
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayRevwsAverageRating($params)
    {
        if (isset($params['product'])) {
            $product = $params['product'];
        } else {
            $product = (int)(Tools::getValue('id_product'));
        }
        if (is_object($product)) {
            $product = $product->id;
        }
        if (!$product) {
            throw new PrestaShopException('hook displayRevwsAverageRating called without product');
        }
        $placement = isset($params['placement']) ? $params['placement'] : 'custom-placement';
        $set = $this->getSettings();
        list($grade, $count) = RevwsReview::getAverageGrade($set, $product);
        return $this->getPlatform()->displayTemplate('views/templates/hook/review-average.tpl', [
            'placement' => $placement,
            'productId' => $product,
            'grade' => $grade,
            'reviewCount' => $count,
            'hasReviewed' => $this->getVisitor()->hasWrittenReview('product', $product),
            'shape' => $this->getShapeSettings(),
            'shapeSize' => $set->getShapeSize(),
            'canReview' => $this->getPermissions()->canCreateReview('product', $product),
            'isGuest' => $this->getVisitor()->isGuest(),
            'loginLink' => $this->getLoginUrl($product),
            'microdata' => $set->emitRichSnippets(),
            'showSignInButton' => $set->showSignInButton(),
            'inModal' => $this->getPlatform()->isInModal(),
            'linkToProduct' => $this->context->link->getProductLink($product),
        ]);

    }

    /**
     * @param int|null $productId
     *
     * @return string
     *
     * @throws PrestaShopException
     */
    public function getLoginUrl($productId = null)
    {
        return $this->context->link->getPageLink('authentication', true, null, [
            'back' => $this->getProductReviewsLink($productId)
        ]);
    }

    /**
     * @param int|null $productId
     *
     * @return string
     * @throws PrestaShopException
     */
    private function getProductReviewsLink($productId)
    {
        $productId = (int)$productId;
        if (!$productId) {
            return '';
        }
        $link = $this->context->link->getProductLink($productId);
        if ($link) {
            if (strpos($link, '?') === false) {
                $link .= '?show=reviews';
            } else {
                $link .= '&show=reviews';
            }
        }
        return $link;
    }

    /**
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayProductAdditionalInfo()
    {
        return $this->hookDisplayProductButtons();
    }

    /**
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayProductButtons()
    {
        $set = $this->getSettings();
        if ($set->getAveragePlacement() == 'buttons') {
            return $this->hookDisplayRevwsAverageRating(['placement' => 'buttons']);
        }
        return null;
    }

    /**
     * @param array $params
     *
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayProductListReviews($params)
    {
        $settings = $this->getSettings();
        if ($settings->showOnProductListing()) {
            $productId = self::getProductId($params['product']);
            list($grade, $count) = RevwsReview::getAverageGrade($settings, $productId);

            return $this->getPlatform()->displayTemplate('views/templates/hook/product_list.tpl', [
                'omitEmpty' => $settings->productListNoReviewsBehavior() === 'omit',
                'productId' => $productId,
                'grade' => $grade,
                'reviewCount' => $count,
                'shape' => $this->getShapeSettings(),
                'shapeSize' => $settings->getShapeSize(),
                'reviewsUrl' => $this->getProductReviewsLink($productId),
            ], $this->getCacheId() . '|' . $productId);
        }
        return null;
    }

    /**
     * @param array|Product|object|int $product
     *
     * @return int|null
     */
    private static function getProductId($product)
    {
        if (is_array($product) && isset($product['id_product'])) {
            return (int)$product['id_product'];
        }
        if (is_object($product)) {
            if (property_exists($product, 'id_product')) {
                return (int)$product->id_product;
            }
            if (is_callable([$product, 'getId'])) {
                return (int)$product->getId();
            }
            if (property_exists($product, 'id')) {
                return (int)$product->id;
            }
        }
        if (is_int($product)) {
            return (int)$product;
        }
        return null;
    }

    /**
     * @param array $params
     *
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayProductComparison($params)
    {
        $settings = $this->getSettings();
        if ($settings->showOnProductComparison()) {
            $averages = [];
            foreach ($params['list_ids_product'] as $idProduct) {
                $productId = (int)$idProduct;
                $averages[$productId] = RevwsReview::getAverageGrade($settings, $productId);
            }
            return $this->getPlatform()->displayTemplate('views/templates/hook/products_comparison.tpl', [
                'averages' => $averages,
                'shape' => $this->getShapeSettings(),
                'shapeSize' => $settings->getShapeSize(),
                'list_ids_product' => $params['list_ids_product'],
            ]);
        }
        return null;
    }

    /**
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayCustomerAccount()
    {
        if ($this->getSettings()->showOnCustomerAccount()) {
            return $this->getPlatform()->displayTemplate('views/templates/front/my-account.tpl', [
                'iconClass' => $this->getSettings()->getCustomerAccountIcon(),
                'myReviewsUrl' => $this->getUrl('MyReviews')
            ]);
        }
        return null;
    }

    /**
     * @param string $controller
     * @param array $params
     *
     * @return string
     * @throws PrestaShopException
     */
    public function getUrl($controller, $params = [])
    {
        return $this->context->link->getModuleLink($this->name, $controller, $params);
    }

    /**
     * @param array $params
     *
     * @return string|void
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayMyAccountBlock($params)
    {
        if ($this->getSettings()->showOnCustomerAccount()) {
            return $this->getPlatform()->displayTemplate('views/templates/front/my-account-block.tpl');
        }
    }

    /**
     * @return Context
     */
    public function getContext()
    {
        return $this->context;
    }

    /**
     *
     */
    public function hookRegisterGDPRConsent()
    {
    }

    /**
     * @param array $customer
     *
     * @return string
     * @throws PrestaShopException
     */
    public function hookActionExportGDPRData($customer)
    {
        if (isset($customer['email']) && Validate::isEmail($customer['email'])) {
            $email = $customer['email'];
            $id = isset($customer['id']) ? $customer['id'] : null;
            $data = $this->getGDPR()->getData($id, $email);
            if (!empty($data['reviews']) || !empty($data['reactions'])) {
                $list = array_merge($data['reviews'], $data['reactions']);
                return json_encode($list);
            }
        }
        return null;
    }

    /**
     * @return \Revws\GDPR
     * @throws PrestaShopException
     */
    public function getGDPR()
    {
        if (!$this->gdpr) {
            $this->gdpr = new \Revws\GDPR($this);
        }
        return $this->gdpr;
    }

    /**
     * @param array $customer
     *
     * @return string
     * @throws PrestaShopException
     */
    public function hookActionDeleteGDPRCustomer($customer)
    {
        if (isset($customer['email']) && Validate::isEmail($customer['email'])) {
            $email = $customer['email'];
            $id = isset($customer['id']) ? $customer['id'] : null;
            $ret = json_encode($this->getGDPR()->deleteData($id, $email));
            $this->clearCache();
            return $ret;
        }
        return null;
    }

    /**
     * @param array $params
     *
     * @return array
     */
    public function hookDataKickExtend($params)
    {
        return \Revws\DatakickIntegration::integrate($params);
    }

    /**
     * @return array
     */
    public function hookActionRegisterKronaAction()
    {
        return $this->getKrona()->getActions();
    }

    /**
     * @param array $params
     *
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayRevwsReview($params)
    {
        if (isset($params['review'])) {
            $review = null;
            if (is_object($params['review'])) {
                $review = $params['review'];
            } elseif (is_numeric($params['review'])) {
                $review = new RevwsReview((int)$params['review']);
                if (Validate::isLoadedObject($review)) {
                    $review->loadGrades();
                } else {
                    $review = null;
                }
            }
            if ($review) {
                $displayReply = true;
                if (isset($params['displayReply'])) {
                    $displayReply = !!$params['displayReply'];
                }
                $shopName = $displayReply ? Configuration::get('PS_SHOP_NAME') : null;
                $displayCriteria = $this->getSettings()->getDisplayCriteriaPreference();
                if (isset($params['displayCriteria'])) {
                    $displayCriteria = $params['displayCriteria'];
                }
                return $this->getPlatform()->displayTemplate('views/templates/hook/display-revws-review.tpl', [
                    'review' => $review->toJSData(new \Revws\NoPermissions()),
                    'shape' => $this->getShapeSettings(),
                    'criteria' => RevwsCriterion::getCriteria($this->context->language->id),
                    'displayCriteria' => $displayCriteria,
                    'shopName' => $shopName,
                    'linkToProduct' => $this->context->link->getProductLink($review->id_entity),
                ]);
            }
        }
        return null;
    }

    /**
     * @param array $params
     *
     * @return string
     *
     * @throws PrestaShopException
     * @throws SmartyException
     */
    public function hookDisplayRevwsReviewList($params)
    {
        $displayReply = true;
        if (isset($params['displayReply'])) {
            $displayReply = !!$params['displayReply'];
        }
        $displayCriteria = $this->getSettings()->getDisplayCriteriaPreference();
        if (isset($params['displayCriteria'])) {
            $displayCriteria = $params['displayCriteria'];
        }

        $reviewStyle = 'item';
        if (isset($params['reviewStyle'])) {
            $reviewStyle = $params['reviewStyle'];
        }

        $order = 'date';
        if (isset($params['order'])) {
            $order = $params['order'];
        }

        $orderDir = 'desc';
        if (isset($params['orderDir'])) {
            $orderDir = $params['orderDir'];
        }

        $pageSize = 5;
        if (isset($params['pageSize'])) {
            $pageSize = (int)$params['pageSize'];
        }

        $allowPaging = true;
        if (isset($params['allowPaging'])) {
            $allowPaging = !!$params['allowPaging'];
        }

        $widgetParams = [
            'reviewStyle' => $reviewStyle,
            'displayReply' => $displayReply,
            'displayCriteria' => $displayCriteria,
            'allowPaging' => $allowPaging
        ];

        $conditions = [];
        foreach (['product', 'customer', 'guest', 'category', 'categoryTree', 'manufacturer', 'entityType'] as $param) {
            if (isset($params[$param])) {
                $conditions[$param] = (int)$params[$param];
            }
        }

        $frontApp = $this->getFrontApp();
        $listId = "" . (isset($params['id']) ? $params['id'] : $frontApp->generateListId());
        $widget = $frontApp->addCustomListWidget($listId, $conditions, $widgetParams, $pageSize, $order, $orderDir);
        $list = $frontApp->getList($listId);

        $this->context->smarty->assign([
            'widget' => $widget,
            'reviewList' => $list->getData(),
            'visitor' => $frontApp->getVisitorData(),
            'reviewEntities' => $frontApp->getEntities(),
            'reviewsData' => $frontApp->getStaticData()
        ]);

        return $this->getPlatform()->displayTemplate('views/templates/hook/widget.tpl');
    }

    /**
     * @return array
     */
    public function hookModuleRoutes()
    {
        $prefix = 'reviews';
        return [
            'module-revws-AllReviews' => [
                'controller' => 'AllReviews',
                'rule' => "$prefix",
                'keywords' => [],
                'params' => [
                    'fc' => 'module',
                    'module' => $this->name,
                    'controller' => 'AllReviews',
                ]
            ],
            'module-revws-AllReviews2' => [
                'controller' => 'AllReviews',
                'rule' => "$prefix/",
                'keywords' => [],
                'params' => [
                    'fc' => 'module',
                    'module' => $this->name,
                    'controller' => 'AllReviews',
                ]
            ],
            'module-revws-MyReviews' => [
                'controller' => 'MyReviews',
                'rule' => "$prefix/my-reviews",
                'keywords' => [],
                'params' => [
                    'fc' => 'module',
                    'module' => $this->name,
                    'controller' => 'MyReviews',
                ]
            ],
            'module-revws-MyReviews2' => [
                'controller' => 'MyReviews',
                'rule' => "$prefix/my-reviews/",
                'keywords' => [],
                'params' => [
                    'fc' => 'module',
                    'module' => $this->name,
                    'controller' => 'MyReviews',
                ]
            ]
        ];
    }

    /**
     * @return array
     */
    public function getFrontTranslations()
    {
        $translations = new \Revws\AppTranslation($this);
        return $translations->getFrontTranslations();
    }

    /**
     * @return array
     */
    public function getBackTranslations()
    {
        $translations = new \Revws\AppTranslation($this);
        return $translations->getBackTranslations();
    }

    /**
     * @return string
     */
    public function hookDisplayBeforeBodyClosingTag()
    {
        $jsDefs = $this->getPlatform()->getJsDefs();
        if ($jsDefs) {
            $ret = '<script type="text/javascript">' . "\n";
            foreach ($jsDefs as $key => $value) {
                $ret .= "var $key = " . json_encode($value) . ";\n";
            }
            $ret .= '</script>';
            return $ret;
        }
        return null;
    }

    /**
     * @return array
     */
    public function hookActionGetConseqsTriggers()
    {
        require_once(__DIR__ . '/classes/integration/conseqs-trigger.php');
        return [
            'reviewCreated' => new \Revws\ConseqsTrigger($this->l('Revws: Review created'), $this->l('Executed when review is created'), 'actionRevwsReviewCreated'),
            'reviewUpdated' => new \Revws\ConseqsTrigger($this->l('Revws: Review updated'), $this->l('Executed when review is updated'), 'actionRevwsReviewUpdated'),
            'reviewDeleted' => new \Revws\ConseqsTrigger($this->l('Revws: Review deleted'), $this->l('Executed when review is deleted'), 'actionRevwsReviewDeleted'),
            'reviewApproved' => new \Revws\ConseqsTrigger($this->l('Revws: Review approved'), $this->l('Executed when review is approved'), 'actionRevwsReviewApproved')
        ];
    }
}
