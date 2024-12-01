/*
  Warnings:

  - You are about to drop the `access_records` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `access_records`;

-- CreateTable
CREATE TABLE `ad_statistics` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `packageName` VARCHAR(255) NULL,
    `adId` VARCHAR(255) NULL,
    `success_count` INTEGER NULL DEFAULT 0,
    `fail_count` INTEGER NULL DEFAULT 0,
    `init_success_count` INTEGER NULL DEFAULT 0,
    `init_fail_count` INTEGER NULL DEFAULT 0,
    `expired_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `ad_statistics_packageName_idx`(`packageName`),
    INDEX `ad_statistics_adId_idx`(`adId`),
    INDEX `ad_statistics_expired_at_idx`(`expired_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_statistic_logs` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `adStatisticId` BIGINT UNSIGNED NULL,
    `uuid` VARCHAR(255) NULL,
    `packageName` VARCHAR(255) NULL,
    `adId` VARCHAR(255) NULL,
    `type` INTEGER NULL,
    `status` INTEGER NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `ad_statistic_logs_adId_idx`(`adId`),
    INDEX `ad_statistic_logs_packageName_idx`(`packageName`),
    INDEX `ad_statistic_logs_uuid_idx`(`uuid`),
    INDEX `ad_statistic_logs_adStatisticId_idx`(`adStatisticId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ad_statistic_logs` ADD CONSTRAINT `ad_statistic_logs_adStatisticId_fkey` FOREIGN KEY (`adStatisticId`) REFERENCES `ad_statistics`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
