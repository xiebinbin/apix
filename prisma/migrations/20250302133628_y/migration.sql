-- CreateTable
CREATE TABLE `channels` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `power` VARCHAR(191) NOT NULL DEFAULT 'on',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sdk_logs` (
    `id` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `os_version` VARCHAR(191) NOT NULL,
    `package_name` VARCHAR(191) NOT NULL,
    `uuid` VARCHAR(191) NOT NULL,
    `channel_id` VARCHAR(191) NOT NULL,
    `status` ENUM('INIT_SUCCESS', 'INIT_FAIL', 'WAKE_UP') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sdk_logs_package_name_idx`(`package_name`),
    INDEX `sdk_logs_channel_id_idx`(`channel_id`),
    INDEX `sdk_logs_uuid_idx`(`uuid`),
    INDEX `sdk_logs_model_idx`(`model`),
    INDEX `sdk_logs_os_version_idx`(`os_version`),
    INDEX `sdk_logs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_logs` (
    `id` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `os_version` VARCHAR(191) NOT NULL,
    `package_name` VARCHAR(191) NOT NULL,
    `uuid` VARCHAR(191) NOT NULL,
    `channel_id` VARCHAR(191) NOT NULL,
    `ad_id` VARCHAR(191) NOT NULL,
    `status` ENUM('INIT_SUCCESS', 'INIT_FAIL', 'SHOW_SUCCESS', 'SHOW_FAIL', 'CLICK_SUCCESS', 'CLICK_FAIL', 'PLAY_SUCCESS', 'PLAY_FAIL', 'DIALOG_SUCCESS', 'DIALOG_FAIL') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ad_logs_package_name_idx`(`package_name`),
    INDEX `ad_logs_ad_id_idx`(`ad_id`),
    INDEX `ad_logs_uuid_idx`(`uuid`),
    INDEX `ad_logs_channel_id_idx`(`channel_id`),
    INDEX `ad_logs_model_idx`(`model`),
    INDEX `ad_logs_os_version_idx`(`os_version`),
    INDEX `ad_logs_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_check_statistics` (
    `id` VARCHAR(191) NOT NULL,
    `channel_id` VARCHAR(191) NOT NULL,
    `package_name` VARCHAR(191) NOT NULL,
    `ad_id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `channel_on_count` INTEGER NULL DEFAULT 0,
    `channel_off_count` INTEGER NULL DEFAULT 0,
    `ad_on_count` INTEGER NULL DEFAULT 0,
    `ad_off_count` INTEGER NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `status_check_statistics_channel_id_idx`(`channel_id`),
    INDEX `status_check_statistics_package_name_idx`(`package_name`),
    INDEX `status_check_statistics_ad_id_idx`(`ad_id`),
    INDEX `status_check_statistics_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sdk_day_statistics` (
    `id` VARCHAR(191) NOT NULL,
    `channel_id` VARCHAR(191) NOT NULL,
    `package_name` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `init_success_count` INTEGER NULL DEFAULT 0,
    `init_fail_count` INTEGER NULL DEFAULT 0,
    `wake_up_count` INTEGER NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `sdk_day_statistics_channel_id_idx`(`channel_id`),
    INDEX `sdk_day_statistics_package_name_idx`(`package_name`),
    INDEX `sdk_day_statistics_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ad_day_statistics` (
    `id` VARCHAR(191) NOT NULL,
    `channel_id` VARCHAR(191) NOT NULL,
    `package_name` VARCHAR(191) NOT NULL,
    `ad_id` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `request_success_count` INTEGER NULL DEFAULT 0,
    `request_fail_count` INTEGER NULL DEFAULT 0,
    `show_success_count` INTEGER NULL DEFAULT 0,
    `show_fail_count` INTEGER NULL DEFAULT 0,
    `click_success_count` INTEGER NULL DEFAULT 0,
    `click_fail_count` INTEGER NULL DEFAULT 0,
    `dialog_success_count` INTEGER NULL DEFAULT 0,
    `dialog_fail_count` INTEGER NULL DEFAULT 0,
    `play_success_count` INTEGER NULL DEFAULT 0,
    `play_fail_count` INTEGER NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ad_day_statistics_channel_id_idx`(`channel_id`),
    INDEX `ad_day_statistics_package_name_idx`(`package_name`),
    INDEX `ad_day_statistics_ad_id_idx`(`ad_id`),
    INDEX `ad_day_statistics_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
