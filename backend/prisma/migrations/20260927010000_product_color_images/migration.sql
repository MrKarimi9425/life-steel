CREATE TABLE `product_color_images` (
  `product_id` VARCHAR(191) NOT NULL,
  `option_id` VARCHAR(191) NOT NULL,
  `media_id` VARCHAR(191) NOT NULL,
  `is_primary` BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (`product_id`, `option_id`, `media_id`),
  INDEX `product_color_images_option_id_idx` (`option_id`),
  INDEX `product_color_images_media_id_idx` (`media_id`),
  CONSTRAINT `product_color_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_color_images_option_id_fkey` FOREIGN KEY (`option_id`) REFERENCES `attribute_options` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_color_images_media_id_fkey` FOREIGN KEY (`media_id`) REFERENCES `media_assets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
