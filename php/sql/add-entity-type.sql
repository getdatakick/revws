ALTER TABLE `PREFIX_revws_criterion` ADD COLUMN `entity_type` VARCHAR(20) NOT NULL;
UPDATE `PREFIX_revws_criterion` SET `entity_type` = 'product';

ALTER TABLE `PREFIX_revws_review` DROP KEY `id_product`;
ALTER TABLE `PREFIX_revws_review` ADD COLUMN `entity_type` VARCHAR(20) NOT NULL AFTER `id_review`;
ALTER TABLE `PREFIX_revws_review` CHANGE `id_product` `id_entity` INT(11) UNSIGNED NOT NULL;
ALTER TABLE `PREFIX_revws_review` ADD KEY `entity_key` (`entity_type`, `id_entity`);
UPDATE `PREFIX_revws_review` SET `entity_type` = 'product';
