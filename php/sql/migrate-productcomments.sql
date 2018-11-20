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

/* migrate review criteria */
INSERT INTO `PREFIX_revws_criterion`(`id_criterion`, `active`, `global`, `entity_type`)
SELECT `id_product_comment_criterion`, `active`, (`id_product_comment_criterion_type`=1), 'product'
  FROM `PREFIX_product_comment_criterion`;

INSERT IGNORE INTO `PREFIX_revws_criterion_lang`(`id_criterion`, `id_lang`, `label`)
SELECT `id_product_comment_criterion`, `id_lang`, `name`
  FROM `PREFIX_product_comment_criterion_lang`;

INSERT IGNORE INTO `PREFIX_revws_criterion_product`(`id_criterion`, `id_product`)
SELECT `id_product_comment_criterion`, `id_product`
  FROM `PREFIX_product_comment_criterion_product`;

INSERT IGNORE INTO `PREFIX_revws_criterion_category`(`id_criterion`, `id_category`)
SELECT `id_product_comment_criterion`, `id_category`
  FROM `PREFIX_product_comment_criterion_category`;

/* migrate reviews */
INSERT INTO `PREFIX_revws_review`(`id_review`, `entity_type`, `id_entity`, `id_customer`, `id_guest`, `id_lang`, `email`, `display_name`, `title`, `content`, `validated`, `deleted`, `date_add`, `date_upd`)
SELECT `pc`.`id_product_comment`, 'product', `pc`.`id_product`, `pc`.`id_customer`, `pc`.`id_guest`, COALESCE(`cust`.`id_lang`, (SELECT `conf`.`value` FROM `PREFIX_configuration` `conf` WHERE `conf`.`name`='PS_LANG_DEFAULT' LIMIT 1)), COALESCE(`cust`.`email`, (SELECT `conf`.`value` FROM `PREFIX_configuration` `conf` WHERE `conf`.`name`='PS_SHOP_EMAIL' LIMIT 1)), `pc`.`customer_name`, `pc`.`title`, `pc`.`content`, `pc`.`validate`, `pc`.`deleted`, `pc`.`date_add`, `pc`.`date_add`
  FROM `PREFIX_product_comment` `pc`
  LEFT JOIN `PREFIX_customer` `cust` ON (`pc`.`id_customer` = `cust`.`id_customer`);

INSERT IGNORE INTO `PREFIX_revws_review_grade`(`id_review`, `id_criterion`, `grade`)
SELECT `id_product_comment`, `id_product_comment_criterion`, `grade`
  FROM `PREFIX_product_comment_grade`;

/* import report abuse and voting */
INSERT IGNORE INTO `PREFIX_revws_review_reaction`(`id_review`, `id_customer`, `id_guest`, `reaction_type`)
SELECT `id_product_comment`, `id_customer`, 0, 'report_abuse'
  FROM `PREFIX_product_comment_report`
 WHERE `id_customer` > 0;

INSERT IGNORE INTO `PREFIX_revws_review_reaction`(`id_review`, `id_customer`, `id_guest`, `reaction_type`)
SELECT `id_product_comment`, `id_customer`, 0, (CASE WHEN `usefulness` THEN 'vote_up' ELSE 'vote_down' END)
  FROM `PREFIX_product_comment_usefulness`
 WHERE `id_customer` > 0;

/* update verified_buyer */
UPDATE `PREFIX_revws_review` r
INNER JOIN `PREFIX_customer` c ON (r.id_customer = c.id_customer)
INNER JOIN `PREFIX_orders` o ON (o.id_customer = c.id_customer AND o.delivery_date IS NOT NULL)
INNER JOIN `PREFIX_order_detail` d ON (d.id_order = o.id_order AND d.product_id = r.id_entity AND r.entity_type = 'product')
SET r.verified_buyer = 1;
