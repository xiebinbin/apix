-- AlterTable
ALTER TABLE `ad_day_statistics` ADD COLUMN `init_fail_count` INTEGER NULL DEFAULT 0,
    ADD COLUMN `init_success_count` INTEGER NULL DEFAULT 0;
