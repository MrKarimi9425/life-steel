-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(191) NOT NULL,
    `first_name` VARCHAR(80) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `is_owner` BOOLEAN NOT NULL DEFAULT false,
    `must_change_password` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `last_login_at` DATETIME(3) NULL,
    `password_changed_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_phone_number_key`(`phone_number`),
    INDEX `admins_status_deleted_at_idx`(`status`, `deleted_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `admin_id` VARCHAR(191) NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `user_agent` VARCHAR(500) NULL,
    `ip_address` VARCHAR(64) NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `revoked_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admin_sessions_token_hash_key`(`token_hash`),
    INDEX `admin_sessions_admin_id_revoked_at_expires_at_idx`(`admin_id`, `revoked_at`, `expires_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `languages` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(12) NOT NULL,
    `name` VARCHAR(80) NOT NULL,
    `native_name` VARCHAR(80) NOT NULL,
    `direction` ENUM('RTL', 'LTR') NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_required_for_publish` BOOLEAN NOT NULL DEFAULT false,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `languages_code_key`(`code`),
    INDEX `languages_is_active_display_order_idx`(`is_active`, `display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interface_phrases` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(160) NOT NULL,
    `namespace` VARCHAR(80) NOT NULL DEFAULT 'common',
    `description` VARCHAR(500) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `interface_phrases_namespace_key_key`(`namespace`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interface_phrase_translations` (
    `phrase_id` VARCHAR(191) NOT NULL,
    `language_id` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,

    INDEX `interface_phrase_translations_language_id_idx`(`language_id`),
    PRIMARY KEY (`phrase_id`, `language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media_assets` (
    `id` VARCHAR(191) NOT NULL,
    `kind` ENUM('IMAGE', 'VIDEO') NOT NULL,
    `source` ENUM('UPLOAD', 'EXTERNAL') NOT NULL,
    `path` VARCHAR(1000) NULL,
    `external_url` VARCHAR(2000) NULL,
    `original_file_name` VARCHAR(255) NULL,
    `mime_type` VARCHAR(160) NULL,
    `size_bytes` BIGINT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `duration_seconds` INTEGER NULL,
    `processing_status` ENUM('PENDING', 'READY', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `processing_error` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `media_assets_kind_processing_status_idx`(`kind`, `processing_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media_variants` (
    `id` VARCHAR(191) NOT NULL,
    `media_id` VARCHAR(191) NOT NULL,
    `kind` ENUM('THUMBNAIL', 'CARD', 'LARGE', 'OPTIMIZED') NOT NULL,
    `path` VARCHAR(1000) NOT NULL,
    `mime_type` VARCHAR(160) NOT NULL,
    `size_bytes` BIGINT NOT NULL,
    `width` INTEGER NOT NULL,
    `height` INTEGER NOT NULL,

    UNIQUE INDEX `media_variants_media_id_kind_key`(`media_id`, `kind`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media_translations` (
    `media_id` VARCHAR(191) NOT NULL,
    `language_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NULL,
    `alt_text` VARCHAR(500) NULL,
    `caption` TEXT NULL,

    INDEX `media_translations_language_id_idx`(`language_id`),
    PRIMARY KEY (`media_id`, `language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_categories` (
    `id` VARCHAR(191) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `image_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_categories_is_active_display_order_idx`(`is_active`, `display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_category_translations` (
    `category_id` VARCHAR(191) NOT NULL,
    `language_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(180) NOT NULL,
    `slug` VARCHAR(180) NOT NULL,
    `description` TEXT NULL,
    `seo_title` VARCHAR(255) NULL,
    `seo_description` VARCHAR(500) NULL,

    UNIQUE INDEX `product_category_translations_language_id_slug_key`(`language_id`, `slug`),
    PRIMARY KEY (`category_id`, `language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attribute_definitions` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('SHORT_TEXT', 'LONG_TEXT', 'NUMBER', 'BOOLEAN', 'SINGLE_SELECT', 'MULTI_SELECT', 'COLOR') NOT NULL,
    `is_filterable` BOOLEAN NOT NULL DEFAULT false,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `allow_custom_value` BOOLEAN NOT NULL DEFAULT false,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `attribute_definitions_is_active_display_order_idx`(`is_active`, `display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attribute_definition_translations` (
    `attribute_id` VARCHAR(191) NOT NULL,
    `language_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(180) NOT NULL,
    `description` VARCHAR(500) NULL,
    `unit_label` VARCHAR(80) NULL,

    PRIMARY KEY (`attribute_id`, `language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attribute_options` (
    `id` VARCHAR(191) NOT NULL,
    `attribute_id` VARCHAR(191) NOT NULL,
    `color_hex` VARCHAR(9) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `attribute_options_attribute_id_is_active_display_order_idx`(`attribute_id`, `is_active`, `display_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attribute_option_translations` (
    `option_id` VARCHAR(191) NOT NULL,
    `language_id` VARCHAR(191) NOT NULL,
    `label` VARCHAR(180) NOT NULL,

    PRIMARY KEY (`option_id`, `language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `category_attributes` (
    `category_id` VARCHAR(191) NOT NULL,
    `attribute_id` VARCHAR(191) NOT NULL,
    `is_required` BOOLEAN NOT NULL DEFAULT false,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `category_attributes_attribute_id_idx`(`attribute_id`),
    PRIMARY KEY (`category_id`, `attribute_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(100) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `cover_media_id` VARCHAR(191) NULL,
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `display_order` INTEGER NOT NULL DEFAULT 0,
    `published_at` DATETIME(3) NULL,
    `deleted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `products_sku_key`(`sku`),
    INDEX `products_status_deleted_at_display_order_idx`(`status`, `deleted_at`, `display_order`),
    INDEX `products_is_featured_status_idx`(`is_featured`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_translations` (
    `product_id` VARCHAR(191) NOT NULL,
    `language_id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NULL,
    `slug` VARCHAR(200) NULL,
    `summary` TEXT NULL,
    `description` LONGTEXT NULL,
    `seo_title` VARCHAR(255) NULL,
    `seo_description` VARCHAR(500) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED') NOT NULL DEFAULT 'DRAFT',

    INDEX `product_translations_language_id_status_title_idx`(`language_id`, `status`, `title`),
    UNIQUE INDEX `product_translations_language_id_slug_key`(`language_id`, `slug`),
    PRIMARY KEY (`product_id`, `language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_category_assignments` (
    `product_id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `is_primary` BOOLEAN NOT NULL DEFAULT false,

    INDEX `product_category_assignments_category_id_is_primary_idx`(`category_id`, `is_primary`),
    PRIMARY KEY (`product_id`, `category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_media` (
    `product_id` VARCHAR(191) NOT NULL,
    `media_id` VARCHAR(191) NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `product_media_product_id_display_order_idx`(`product_id`, `display_order`),
    PRIMARY KEY (`product_id`, `media_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_attribute_values` (
    `id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `attribute_id` VARCHAR(191) NOT NULL,
    `number_value` DECIMAL(18, 4) NULL,
    `boolean_value` BOOLEAN NULL,
    `raw_value` JSON NULL,
    `is_custom` BOOLEAN NOT NULL DEFAULT false,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    INDEX `product_attribute_values_attribute_id_number_value_idx`(`attribute_id`, `number_value`),
    INDEX `product_attribute_values_attribute_id_boolean_value_idx`(`attribute_id`, `boolean_value`),
    UNIQUE INDEX `product_attribute_values_product_id_attribute_id_key`(`product_id`, `attribute_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_attribute_value_translations` (
    `value_id` VARCHAR(191) NOT NULL,
    `language_id` VARCHAR(191) NOT NULL,
    `text_value` TEXT NOT NULL,

    PRIMARY KEY (`value_id`, `language_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_attribute_option_values` (
    `value_id` VARCHAR(191) NOT NULL,
    `option_id` VARCHAR(191) NOT NULL,

    INDEX `product_attribute_option_values_option_id_idx`(`option_id`),
    PRIMARY KEY (`value_id`, `option_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `related_products` (
    `product_id` VARCHAR(191) NOT NULL,
    `related_product_id` VARCHAR(191) NOT NULL,
    `display_order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`product_id`, `related_product_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `admin_sessions` ADD CONSTRAINT `admin_sessions_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interface_phrase_translations` ADD CONSTRAINT `interface_phrase_translations_phrase_id_fkey` FOREIGN KEY (`phrase_id`) REFERENCES `interface_phrases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interface_phrase_translations` ADD CONSTRAINT `interface_phrase_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media_variants` ADD CONSTRAINT `media_variants_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media_translations` ADD CONSTRAINT `media_translations_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `media_translations` ADD CONSTRAINT `media_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_image_id_fkey` FOREIGN KEY (`image_id`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_category_translations` ADD CONSTRAINT `product_category_translations_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_category_translations` ADD CONSTRAINT `product_category_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attribute_definition_translations` ADD CONSTRAINT `attribute_definition_translations_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `attribute_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attribute_definition_translations` ADD CONSTRAINT `attribute_definition_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attribute_options` ADD CONSTRAINT `attribute_options_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `attribute_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attribute_option_translations` ADD CONSTRAINT `attribute_option_translations_option_id_fkey` FOREIGN KEY (`option_id`) REFERENCES `attribute_options`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attribute_option_translations` ADD CONSTRAINT `attribute_option_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category_attributes` ADD CONSTRAINT `category_attributes_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `category_attributes` ADD CONSTRAINT `category_attributes_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `attribute_definitions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_cover_media_id_fkey` FOREIGN KEY (`cover_media_id`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_translations` ADD CONSTRAINT `product_translations_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_translations` ADD CONSTRAINT `product_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_category_assignments` ADD CONSTRAINT `product_category_assignments_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_category_assignments` ADD CONSTRAINT `product_category_assignments_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `product_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_media` ADD CONSTRAINT `product_media_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_media` ADD CONSTRAINT `product_media_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media_assets`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attribute_values` ADD CONSTRAINT `product_attribute_values_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attribute_values` ADD CONSTRAINT `product_attribute_values_attribute_id_fkey` FOREIGN KEY (`attribute_id`) REFERENCES `attribute_definitions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attribute_value_translations` ADD CONSTRAINT `product_attribute_value_translations_value_id_fkey` FOREIGN KEY (`value_id`) REFERENCES `product_attribute_values`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attribute_value_translations` ADD CONSTRAINT `product_attribute_value_translations_language_id_fkey` FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attribute_option_values` ADD CONSTRAINT `product_attribute_option_values_value_id_fkey` FOREIGN KEY (`value_id`) REFERENCES `product_attribute_values`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_attribute_option_values` ADD CONSTRAINT `product_attribute_option_values_option_id_fkey` FOREIGN KEY (`option_id`) REFERENCES `attribute_options`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `related_products` ADD CONSTRAINT `related_products_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `related_products` ADD CONSTRAINT `related_products_related_product_id_fkey` FOREIGN KEY (`related_product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
