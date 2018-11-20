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

TRUNCATE `PREFIX_revws_criterion`;
TRUNCATE `PREFIX_revws_criterion_lang`;
TRUNCATE `PREFIX_revws_criterion_category`;
TRUNCATE `PREFIX_revws_criterion_product`;
TRUNCATE `PREFIX_revws_review`;
TRUNCATE `PREFIX_revws_review_grade`;
TRUNCATE `PREFIX_revws_review_reaction`;

INSERT IGNORE INTO `PREFIX_revws_criterion`(`id_criterion`, `global`, `entity_type`) VALUES (1, 1, 'product');
INSERT IGNORE INTO `PREFIX_revws_criterion_lang`(`id_criterion`, `id_lang`, `label`) SELECT 1, `l`.`id_lang`, 'Quality' FROM `PREFIX_lang` `l`;
