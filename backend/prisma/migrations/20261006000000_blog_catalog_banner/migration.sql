ALTER TABLE `home_sections`
  MODIFY COLUMN `page` ENUM('HOME', 'PRODUCTS', 'BLOG') NOT NULL DEFAULT 'HOME';

INSERT INTO `home_sections`
  (`id`, `page`, `type`, `title`, `is_active`, `display_order`, `updated_at`)
VALUES
  ('blog_banner', 'BLOG', 'BANNER_FULL', 'بنر صفحه وبلاگ', true, 0, CURRENT_TIMESTAMP(3));
