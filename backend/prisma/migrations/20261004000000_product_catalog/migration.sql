ALTER TABLE `home_sections`
  ADD COLUMN `page` ENUM('HOME', 'PRODUCTS') NOT NULL DEFAULT 'HOME';

DROP INDEX `home_sections_is_active_display_order_idx` ON `home_sections`;
CREATE INDEX `home_sections_page_is_active_display_order_idx`
  ON `home_sections`(`page`, `is_active`, `display_order`);

INSERT INTO `home_sections`
  (`id`, `page`, `type`, `title`, `is_active`, `display_order`, `updated_at`)
VALUES
  ('products_banner', 'PRODUCTS', 'BANNER_FULL', 'بنر صفحه محصولات', true, 0, CURRENT_TIMESTAMP(3));
