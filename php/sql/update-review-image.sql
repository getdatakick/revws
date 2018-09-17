CREATE TABLE IF NOT EXISTS `PREFIX_revws_review_image` (
  `id_review`     INT(11) UNSIGNED NOT NULL,
  `image`         VARCHAR(256) NOT NULL,
  `pos`           INT(11) NOT NULL,
  PRIMARY KEY (`id_review`, `image`)
) ENGINE=ENGINE_TYPE DEFAULT CHARSET=CHARSET_TYPE;
