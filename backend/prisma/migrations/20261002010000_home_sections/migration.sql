CREATE TABLE `home_sections` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('HERO', 'CATEGORIES', 'FEATURED_PRODUCT', 'SELECTED_PRODUCTS', 'STORIES', 'BENEFITS', 'BLOG', 'CONTACT', 'BANNER_FULL', 'BANNER_SPLIT') NOT NULL,
    `title` VARCHAR(150) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `home_sections_is_active_display_order_idx`(`is_active`, `display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `home_sections` (`id`, `type`, `title`, `is_active`, `display_order`, `updated_at`) VALUES
  ('home_hero', 'HERO', 'اسلایدر اصلی', true, 0, CURRENT_TIMESTAMP(3)),
  ('home_categories', 'CATEGORIES', 'دسته بندی ها', true, 1, CURRENT_TIMESTAMP(3)),
  ('home_featured_product', 'FEATURED_PRODUCT', 'محصول پیشنهادی', true, 2, CURRENT_TIMESTAMP(3)),
  ('home_selected_products', 'SELECTED_PRODUCTS', 'محصولات منتخب', true, 3, CURRENT_TIMESTAMP(3)),
  ('home_stories', 'STORIES', 'معرفی لایف استیل', true, 4, CURRENT_TIMESTAMP(3)),
  ('home_benefits', 'BENEFITS', 'مزیت ها', true, 5, CURRENT_TIMESTAMP(3)),
  ('home_blog', 'BLOG', 'مقالات', true, 6, CURRENT_TIMESTAMP(3)),
  ('home_contact', 'CONTACT', 'دعوت به تماس', true, 7, CURRENT_TIMESTAMP(3));

ALTER TABLE `site_banners` ADD COLUMN `section_id` VARCHAR(191) NULL;
UPDATE `site_banners` SET `section_id` = 'home_hero';
ALTER TABLE `site_banners`
  MODIFY `section_id` VARCHAR(191) NOT NULL,
  DROP INDEX `site_banners_is_published_display_order_idx`,
  ADD INDEX `site_banners_section_id_is_published_display_order_idx`(`section_id`, `is_published`, `display_order`),
  ADD CONSTRAINT `site_banners_section_id_fkey` FOREIGN KEY (`section_id`) REFERENCES `home_sections`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
