import { db } from "@/libs/db";
import { type Prisma } from "@prisma/client";
import dayjs from "dayjs";
export class StatusCheckLogService {
    public static async create(data: Prisma.StatusCheckLogCreateInput) {
        return await db.statusCheckLog.create({
            data
        })
    }
    public static async getLast(packageName: string, channelId: string, adId: string, uuid: string) {
        const log = await db.statusCheckLog.findFirst({
            where: {
                packageName,
                channelId: channelId,
                adId,
                uuid,
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        if (log && dayjs(log.createdAt).isAfter(dayjs().subtract(12, 'hour'))) {
            return log
        }
        return null
    }
}
