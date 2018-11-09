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

CREATE TABLE IF NOT EXISTS `PREFIX_revws_criterion` (
  `id_criterion`    INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `global`          TINYINT(1) NOT NULL DEFAULT 0,
  `active`          TINYINT(1) NOT NULL DEFAULT 1,
  `entity_type`     VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id_criterion`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=CHARSET_TYPE;

CREATE TABLE IF NOT EXISTS `PREFIX_revws_criterion_lang` (
  `id_criterion`    INT(11) UNSIGNED NOT NULL,
  `id_lang`         INT(11) UNSIGNED NOT NULL,
  `label`           VARCHAR(128) NOT NULL,
  PRIMARY KEY (`id_criterion`, `id_lang`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=CHARSET_TYPE;

CREATE TABLE IF NOT EXISTS `PREFIX_revws_criterion_category` (
  `id_criterion`    INT(11) UNSIGNED NOT NULL,
  `id_category`     INT(11) UNSIGNED NOT NULL,
  PRIMARY KEY (`id_criterion`, `id_category`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=CHARSET_TYPE;

CREATE TABLE IF NOT EXISTS `PREFIX_revws_criterion_product` (
  `id_criterion`    INT(11) UNSIGNED NOT NULL,
  `id_product`      INT(11) UNSIGNED NOT NULL,
  PRIMARY KEY (`id_criterion`, `id_product`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=CHARSET_TYPE;

CREATE TABLE IF NOT EXISTS `PREFIX_revws_review` (
  `id_review`        INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `entity_type`      VARCHAR(20) NOT NULL,
  `id_entity`        INT(11) UNSIGNED NOT NULL,
  `id_customer`      INT(11) UNSIGNED NULL,
  `id_guest`         INT(11) UNSIGNED NULL,
  `id_lang`          INT(11) UNSIGNED NOT NULL,
  `email`            VARCHAR(255) NOT NULL,
  `display_name`     VARCHAR(255) NOT NULL,
  `title`            VARCHAR(127) NOT NULL,
  `content`          TEXT NULL,
  `reply`            TEXT NULL,
  `validated`        TINYINT(1) NOT NULL DEFAULT 0,
  `deleted`          TINYINT(1) NOT NULL DEFAULT 0,
  `verified_buyer`   TINYINT(1) NOT NULL DEFAULT 0,
  `date_add`         DATETIME NOT NULL,
  `date_upd`         DATETIME NOT NULL,
  PRIMARY KEY (`id_review`),
  KEY `entity_key` (`entity_type`, `id_entity`),
  KEY `id_customer` (`id_customer`),
  KEY `id_guest` (`id_guest`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=CHARSET_TYPE;

CREATE TABLE IF NOT EXISTS `PREFIX_revws_review_grade` (
  `id_review`    INT(11) UNSIGNED NOT NULL,
  `id_criterion` INT(11) UNSIGNED NOT NULL,
  `grade`        DECIMAL(5,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_review`, `id_criterion`),
  KEY `id_review` (`id_review`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=CHARSET_TYPE;

CREATE TABLE IF NOT EXISTS `PREFIX_revws_review_reaction` (
  `id_review`     INT(11) UNSIGNED NOT NULL,
  `id_customer`   INT(11) UNSIGNED NOT NULL,
  `id_guest`      INT(11) UNSIGNED NOT NULL,
  `reaction_type` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`id_review`, `id_customer`, `id_guest`, `reaction_type`),
  KEY `id_review` (`id_review`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=CHARSET_TYPE;

CREATE TABLE IF NOT EXISTS `PREFIX_revws_review_image` (
  `id_image`      INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_review`     INT(11) UNSIGNED NOT NULL,
  `image`         VARCHAR(256) NOT NULL,
  `pos`           INT(11) NOT NULL,
  PRIMARY KEY (`id_image`),
  KEY `id_review` (`id_review`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=CHARSET_TYPE;

INSERT IGNORE INTO `PREFIX_revws_criterion`(`id_criterion`, `global`, `entity_type`) VALUES (1, 1, 'product');
INSERT IGNORE INTO `PREFIX_revws_criterion_lang`(`id_criterion`, `id_lang`, `label`) SELECT 1, `l`.`id_lang`, 'Quality' FROM `PREFIX_lang` `l`;
