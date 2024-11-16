-- CreateTable
CREATE TABLE `access_records` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `package_name` VARCHAR(255) NULL,
    `uuid` VARCHAR(255) NULL,
    `expired_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NULL,

    INDEX `access_records_package_name_idx`(`package_name`),
    INDEX `access_records_uuid_idx`(`uuid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
