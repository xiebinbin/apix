-- CreateTable
CREATE TABLE `status_check_logs` (
    `id` VARCHAR(191) NOT NULL,
    `channel_id` VARCHAR(191) NOT NULL,
    `package_name` VARCHAR(191) NOT NULL,
    `channel_status` VARCHAR(191) NOT NULL,
    `ad_id` VARCHAR(191) NOT NULL,
    `ad_status` VARCHAR(191) NOT NULL,
    `uuid` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `status_check_logs_channel_id_idx`(`channel_id`),
    INDEX `status_check_logs_package_name_idx`(`package_name`),
    INDEX `status_check_logs_ad_id_idx`(`ad_id`),
    INDEX `status_check_logs_uuid_idx`(`uuid`),
    INDEX `status_check_logs_channel_status_idx`(`channel_status`),
    INDEX `status_check_logs_ad_status_idx`(`ad_status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
