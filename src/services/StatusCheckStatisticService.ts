import { db } from "@/libs/db";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
export class StatusCheckStatisticService {
    public static async create(data: Prisma.StatusCheckStatisticCreateInput) {
        return await db.statusCheckStatistic.create({
            data
        })
    }
    // 获取当天的请求统计 如果没有则创建
    public static async getToday(packageName: string, channelId: string, adId: string) {
        const today = dayjs();
        const statistic = await db.statusCheckStatistic.findFirst({
            where: {
                packageName,
                createdAt: {
                    gte: today.startOf('day').toDate(),
                    lte: today.endOf('day').toDate()
                },
                channelId,
                adId
            }
        })
        if (!statistic) {
            return await this.create({
                packageName,
                date: today.toDate(),
                channelId,
                adId
            })
        }
        return statistic;
    }
    public static async updateToday(packageName: string, channelId: string, adId: string, adStatus: "on"|"off", sdkStatus: "on"|"off") {
        const record = await this.getToday(packageName, channelId, adId);
        return await db.statusCheckStatistic.update({
            where: { id: record.id },
            data: {
                adOnCount: adStatus === "on" ? {
                    increment: 1
                } : undefined,
                adOffCount: adStatus === "off" ? {
                    increment: 1
                } : undefined,
                channelOnCount: sdkStatus === "on" ? {
                    increment: 1
                } : undefined,
                channelOffCount: sdkStatus === "off" ? {
                    increment: 1
                } : undefined,
            }
        })
    }
    public static async getList(packageName: string, channelId: string, adId: string) {
        const items = await db.statusCheckStatistic.findMany({
            where: { packageName, channelId, adId },
            orderBy: { date: 'desc' },
        })
        return items;
    }
}