ALTER TABLE PREFIX_revws_review ADD COLUMN `verified_buyer` TINYINT(1) NOT NULL DEFAULT 0;

UPDATE `PREFIX_revws_review` r
INNER JOIN `PREFIX_customer` c ON (r.id_customer = c.id_customer)
INNER JOIN `PREFIX_orders` o ON (o.id_customer = c.id_customer AND o.delivery_date IS NOT NULL)
INNER JOIN `PREFIX_order_detail` d ON (d.id_order = o.id_order AND d.product_id = r.id_product)
SET r.verified_buyer = 1;
