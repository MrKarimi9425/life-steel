ALTER TABLE `site_banner_translations`
  ADD COLUMN `alt_text` VARCHAR(255) NULL,
  ADD COLUMN `target_url` VARCHAR(2048) NULL,
  ADD COLUMN `desktop_image_id` VARCHAR(191) NULL,
  ADD COLUMN `tablet_image_id` VARCHAR(191) NULL,
  ADD COLUMN `mobile_image_id` VARCHAR(191) NULL;

UPDATE `site_banner_translations`
SET `alt_text` = `title`, `target_url` = '/products';

UPDATE `site_banner_translations` AS `translation`
JOIN `languages` AS `language` ON `language`.`id` = `translation`.`language_id`
JOIN `site_banners` AS `banner` ON `banner`.`id` = `translation`.`banner_id`
SET `translation`.`desktop_image_id` = `banner`.`image_id`
WHERE `language`.`code` = 'fa' AND `banner`.`image_id` IS NOT NULL;

UPDATE `site_banners` SET `is_published` = false;

ALTER TABLE `site_banner_translations`
  MODIFY `alt_text` VARCHAR(255) NOT NULL,
  MODIFY `target_url` VARCHAR(2048) NOT NULL,
  DROP COLUMN `title`,
  DROP COLUMN `description`,
  DROP COLUMN `button_label`,
  ADD UNIQUE INDEX `site_banner_translations_desktop_image_id_key`(`desktop_image_id`),
  ADD UNIQUE INDEX `site_banner_translations_tablet_image_id_key`(`tablet_image_id`),
  ADD UNIQUE INDEX `site_banner_translations_mobile_image_id_key`(`mobile_image_id`);

ALTER TABLE `site_banners`
  DROP FOREIGN KEY `site_banners_image_id_fkey`;
ALTER TABLE `site_banners`
  DROP INDEX `site_banners_image_id_key`,
  DROP COLUMN `image_id`;

ALTER TABLE `site_banner_translations`
  ADD CONSTRAINT `site_banner_translations_desktop_image_id_fkey` FOREIGN KEY (`desktop_image_id`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `site_banner_translations_tablet_image_id_fkey` FOREIGN KEY (`tablet_image_id`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `site_banner_translations_mobile_image_id_fkey` FOREIGN KEY (`mobile_image_id`) REFERENCES `media_assets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
