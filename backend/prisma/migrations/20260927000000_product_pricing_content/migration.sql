ALTER TABLE `products` ADD COLUMN `show_price` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `base_price` BIGINT NULL;
ALTER TABLE `product_translations` ADD COLUMN `content` JSON NULL;
CREATE TABLE `product_color_prices` (
  `product_id` VARCHAR(191) NOT NULL,
  `option_id` VARCHAR(191) NOT NULL,
  `amount` BIGINT NOT NULL,
  PRIMARY KEY (`product_id`, `option_id`),
  INDEX `product_color_prices_option_id_idx` (`option_id`),
  CONSTRAINT `product_color_prices_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `product_color_prices_option_id_fkey` FOREIGN KEY (`option_id`) REFERENCES `attribute_options` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
