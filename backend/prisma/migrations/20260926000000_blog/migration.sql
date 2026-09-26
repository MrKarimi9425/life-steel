-- CreateTable
CREATE TABLE `blog_articles` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `cover_media_id` VARCHAR(191) NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `blog_articles_status_display_order_idx`(`status`, `display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_article_translations` (
    `article_id` VARCHAR(191) NOT NULL,
    `language_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NULL,
    `slug` VARCHAR(200) NULL,
    `summary` TEXT NULL,
    `content` JSON NOT NULL,
    `seo_title` VARCHAR(255) NULL,
    `seo_description` VARCHAR(500) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',

    INDEX `blog_article_translations_language_id_status_idx`(`language_id`, `status`),
    UNIQUE INDEX `blog_article_translations_language_id_slug_key`(`language_id`, `slug`),
    PRIMARY KEY (`article_id`, `language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_categories` (
    `id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `blog_categories_is_active_display_order_idx`(`is_active`, `display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_category_translations` (
    `category_id` VARCHAR(191) NOT NULL,
    `language_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(180) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `description` TEXT NULL,
    `seo_title` VARCHAR(255) NULL,
    `seo_description` VARCHAR(500) NULL,

    UNIQUE INDEX `blog_category_translations_language_id_slug_key`(`language_id`, `slug`),
    PRIMARY KEY (`category_id`, `language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_tags` (
    `id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `blog_tags_is_active_display_order_idx`(`is_active`, `display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_tag_translations` (
    `tag_id` VARCHAR(191) NOT NULL,
    `language_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(180) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,

    UNIQUE INDEX `blog_tag_translations_language_id_slug_key`(`language_id`, `slug`),
    PRIMARY KEY (`tag_id`, `language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_article_categories` (
    `article_id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,

    INDEX `blog_article_categories_category_id_is_primary_idx`(`category_id`, `is_primary`),
    PRIMARY KEY (`article_id`, `category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_article_tags` (
    `article_id` VARCHAR(191) NOT NULL,
    `tag_id` VARCHAR(191) NOT NULL,

    INDEX `blog_article_tags_tag_id_idx`(`tag_id`),
    PRIMARY KEY (`article_id`, `tag_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `blog_article_media` (
    `article_id` VARCHAR(191) NOT NULL,
    `media_id` VARCHAR(191) NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `blog_article_media_media_id_key`(`media_id`),
    PRIMARY KEY (`article_id`, `media_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `blog_article_translations` ADD CONSTRAINT `blog_article_translations_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `blog_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_article_translations` ADD CONSTRAINT `blog_article_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_category_translations` ADD CONSTRAINT `blog_category_translations_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_category_translations` ADD CONSTRAINT `blog_category_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_tag_translations` ADD CONSTRAINT `blog_tag_translations_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `blog_tags`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_tag_translations` ADD CONSTRAINT `blog_tag_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_article_categories` ADD CONSTRAINT `blog_article_categories_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `blog_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_article_categories` ADD CONSTRAINT `blog_article_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `blog_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_article_tags` ADD CONSTRAINT `blog_article_tags_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `blog_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_article_tags` ADD CONSTRAINT `blog_article_tags_tag_id_fkey` FOREIGN KEY (`tag_id`) REFERENCES `blog_tags`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_article_media` ADD CONSTRAINT `blog_article_media_article_id_fkey` FOREIGN KEY (`article_id`) REFERENCES `blog_articles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `blog_article_media` ADD CONSTRAINT `blog_article_media_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
