import { db } from "@/libs/db";
import type { Prisma } from "@prisma/client";
import dayjs from "dayjs";
export class SdkDayStatisticService {
    public static async create(data: Prisma.SdkDayStatisticCreateInput) {
        return await db.sdkDayStatistic.create({
            data
        })
    }
    public static async getToday(packageName: string, channelId: string) {
        const today = dayjs().toDate();
        const statistic = await db.sdkDayStatistic.findFirst({
            where: {
                packageName,
                date: {
                    gte: dayjs().startOf('day').toDate(),
                    lte: dayjs().endOf('day').toDate(),
                },
                channelId,
            }
        })
        if (!statistic) {
            return await this.create({
                packageName,
                date: today,
                channelId,
            })
        }
        return statistic;
    }
    public static async updateToday(packageName: string, channelId: string,data: Prisma.SdkDayStatisticUpdateInput) {
        const record = await this.getToday(packageName, channelId);
        return await db.sdkDayStatistic.update({
            where: { id: record.id },
            data
        })
    }
}