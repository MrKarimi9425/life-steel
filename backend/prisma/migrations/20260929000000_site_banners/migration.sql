CREATE TABLE `site_banners` (
    `id` VARCHAR(191) NOT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `image_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `site_banners_image_id_key`(`image_id`),
    INDEX `site_banners_is_published_display_order_idx`(`is_published`, `display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `site_banner_translations` (
    `banner_id` VARCHAR(191) NOT NULL,
    `language_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(1000) NOT NULL,
    `button_label` VARCHAR(100) NOT NULL,

    INDEX `site_banner_translations_language_id_idx`(`language_id`),
    PRIMARY KEY (`banner_id`, `language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `site_banners` ADD CONSTRAINT `site_banners_image_id_fkey` FOREIGN KEY (`image_id`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `site_banner_translations` ADD CONSTRAINT `site_banner_translations_banner_id_fkey` FOREIGN KEY (`banner_id`) REFERENCES `site_banners`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `site_banner_translations` ADD CONSTRAINT `site_banner_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
