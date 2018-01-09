/**
* Copyright (C) 2017 Petr Hucik <petr@getdatakick.com>
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
* @copyright 2018 Petr Hucik
* @license   http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*/

CREATE TABLE IF NOT EXISTS `PREFIX_revws_review` (
  `id_review`    INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_product`   INT(11) UNSIGNED NOT NULL,
  `id_customer`  INT(11) UNSIGNED NULL,
  `id_guest`     INT(11) UNSIGNED NULL,
  `email`        VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(255) NOT NULL,
  `title`        VARCHAR(127) NOT NULL,
  `content`      TEXT NULL,
  `grade`        DECIMAL(6,2) NOT NULL,
  `validated`    TINYINT(1) NOT NULL DEFAULT 0,
  `hidden`       TINYINT(1) NOT NULL DEFAULT 0,
  `deleted`      TINYINT(1) NOT NULL DEFAULT 0,
  `date_add`     DATETIME NOT NULL,
  `date_upd`     DATETIME NOT NULL,
  PRIMARY KEY (`id_review`),
  KEY `id_product` (`id_product`),
  KEY `id_customer` (`id_customer`),
  KEY `id_guest` (`id_guest`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=CHARSET_TYPE;
