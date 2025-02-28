import { db } from "@/libs/db";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
export class AdStatisticService {
    public static async incRequestSuccess(id: number | bigint) {
        if (id > 0) {
            return await db.adStatistic.update({
                where: {
                    id
                },
                data: {
                    requestSuccessCount: {
                        increment: 1
                    }
                }
            })
        }
        return null;
    }
    public static async getList(adId: string, packageName: string, page: number, limit: number) {
        const skip = (page - 1) * limit
        return db.adStatistic.findMany({
            where: {
                adId,
                packageName,
            },
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            }
        })
    }
    public static async getLatest(adId: string, packageName: string) {
        const result = await db.adStatistic.findFirst({
            where: {
                adId,
                expiredAt: {
                    gte: dayjs().toDate()
                },
                packageName
            },
            orderBy: {
                expiredAt: 'desc'
            }
        })
        return result;
    }
    public static async create(data: Prisma.AdStatisticCreateInput) {
        return await db.adStatistic.create({
            data
        })
    }
    public static async update(id: number | bigint, data: Prisma.AdStatisticUpdateInput) {
        return await db.adStatistic.update({
            where: { id },
            data
        })
    }
    // 记录初始化日志
    public static async recordInitLog(data: Prisma.AdStatisticLogCreateInput) {
        let adStatistic = await this.getLatest(data?.adId ?? '', data?.packageName ?? '');
        if (!adStatistic) {
            adStatistic = await this.create({
                adId: data.adId,
                initSuccessCount: 0,
                initFailCount: 0,
                expiredAt: dayjs().add(20, 'hours').toDate(),
                packageName: data.packageName
            });
        }
        const log = await db.adStatisticLog.create({
            data: {
                ...data,
                type: 1,
                adStatistic: {
                    connect: {
                        id: adStatistic.id
                    }
                }
            }
        })
        if (data.status == 1) {
            await this.update(adStatistic.id, {
                initSuccessCount: {
                    increment: 1
                }
            })
        } else {
            await this.update(adStatistic.id, {
                initFailCount: {
                    increment: 1
                }
            })
        }
        return log;
    }
    public static async getLastRecordRunLog(packageName: string, adId: string, uuid: string) {
        const record = await db.adStatisticLog.findFirst({
            where: {
                adId,
                packageName,
                uuid,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        if (record) {
            const createdAt = dayjs(record.createdAt);
            if (createdAt.isBefore(dayjs().subtract(12, 'hour'))) {
                return null;
            }
        }
        return record;

    }
    // 记录运行日志
    public static async recordRunLog(data: Prisma.AdStatisticLogCreateInput) {
        let adStatistic = await this.getLatest(data?.adId ?? '', data?.packageName ?? '');
        if (!adStatistic) {
            adStatistic = await this.create({
                adId: data.adId,
                failCount: 0,
                successCount: 0,
                expiredAt: dayjs().add(20, 'hours').toDate(),
                packageName: data.packageName
            });
        }
        const log = await db.adStatisticLog.create({
            data: {
                ...data,
                type: 2,
                adStatistic: {
                    connect: {
                        id: adStatistic.id
                    }
                }
            }
        })
        if (data.status == 1) {
            await this.update(adStatistic.id, {
                successCount: {
                    increment: 1
                }
            })
        } else {
            await this.update(adStatistic.id, {
                failCount: {
                    increment: 1
                }
            })
        }
        return log;
    }
}
