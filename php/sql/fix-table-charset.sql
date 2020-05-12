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

ALTER TABLE `PREFIX_revws_criterion` CONVERT TO CHARACTER SET CHARSET_TYPE COLLATE COLLATE_TYPE;
ALTER TABLE `PREFIX_revws_criterion_lang` CONVERT TO CHARACTER SET CHARSET_TYPE COLLATE COLLATE_TYPE;
ALTER TABLE `PREFIX_revws_criterion_category` CONVERT TO CHARACTER SET CHARSET_TYPE COLLATE COLLATE_TYPE;
ALTER TABLE `PREFIX_revws_criterion_product` CONVERT TO CHARACTER SET CHARSET_TYPE COLLATE COLLATE_TYPE;
ALTER TABLE `PREFIX_revws_review` CONVERT TO CHARACTER SET CHARSET_TYPE COLLATE COLLATE_TYPE;
ALTER TABLE `PREFIX_revws_review_grade` CONVERT TO CHARACTER SET CHARSET_TYPE COLLATE COLLATE_TYPE;
ALTER TABLE `PREFIX_revws_review_reaction` CONVERT TO CHARACTER SET CHARSET_TYPE COLLATE COLLATE_TYPE;
ALTER TABLE `PREFIX_revws_review_image` CONVERT TO CHARACTER SET CHARSET_TYPE COLLATE COLLATE_TYPE;
