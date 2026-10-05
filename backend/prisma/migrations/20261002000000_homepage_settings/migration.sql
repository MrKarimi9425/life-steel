CREATE TABLE `site_settings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'main',
    `selected_products_limit` INTEGER NOT NULL DEFAULT 6,
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
