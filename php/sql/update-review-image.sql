CREATE TABLE IF NOT EXISTS `PREFIX_revws_review_image` (
  `id_image`      INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `id_review`     INT(11) UNSIGNED NOT NULL,
  `image`         VARCHAR(256) NOT NULL,
  `pos`           INT(11) NOT NULL,
  PRIMARY KEY (`id_image`),
  KEY `id_review` (`id_review`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=CHARSET_TYPE;
