import { db } from "@/libs/db";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
export class AdDayStatisticService {
    public static async create(data: Prisma.AdDayStatisticCreateInput) {
        return await db.adDayStatistic.create({
            data
        })
    }
    public static async getToday(packageName: string, channelId: string, adId: string) {
        const today = dayjs();
        const statistic = await db.adDayStatistic.findFirst({
            where: {
                packageName,
                date: {
                    gte: dayjs().startOf('day').toDate(),
                    lte: dayjs().endOf('day').toDate(),
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
    public static async updateToday(packageName: string, channelId: string, adId: string,data: Prisma.AdDayStatisticUpdateInput) {
        const record = await this.getToday(packageName, channelId, adId);
        return await db.adDayStatistic.update({
            where: { id: record.id },
            data
        })
    }
    public static async getList(packageName: string, channelId: string, adId: string) {
        const items = await db.adDayStatistic.findMany({
            where: {
                packageName,
                channelId,
                adId
            },
            orderBy: {
                date: 'desc'
            },
        })
        return items;
    }
}