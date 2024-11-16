import { db } from "@/libs/db";
import { redis } from "@/libs/redis";
import dayjs from "dayjs";
export class AccessRecordService {
    public static async getTotal(packageName: string) {
        return await db.accessRecord.count({
            where: {
                packageName,
                expiredAt: {
                    gte: dayjs().toDate()
                }
            }
        })
    }
    public static async createRecord(uuid: string, packageName: string) {
        const record = await db.accessRecord.findFirst({
            where: {
                uuid,
                expiredAt: {
                    gte: dayjs().toDate()
                }
            }
        })
        if (record) {
            return false;
        }
        await db.accessRecord.create({
            data: {
                uuid,
                packageName,
                expiredAt: dayjs().add(20, 'hours').toDate()
            }
        })
        return true;
    }
}
