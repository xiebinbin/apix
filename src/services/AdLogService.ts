import { db } from "@/libs/db";
import { AdLogStatus, type Prisma } from "@prisma/client";
import dayjs from "dayjs";
import { ChannelService } from "./ChannelService";
export class AdLogService {
    public static async create(data: Prisma.AdLogCreateInput) {
        return await db.adLog.create({
            data
        })
    }
    public static async getLastShowSuccessLog(packageName: string, channelId: string, adId: string,uuid: string) {
        const log = await db.adLog.findFirst({
            where: {
                packageName,
                channelId: channelId,
                adId,
                uuid,
                status: {
                    in: [AdLogStatus.SHOW_SUCCESS, AdLogStatus.PLAY_SUCCESS]
                }
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
