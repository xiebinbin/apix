import { db } from "@/libs/db";
import { type Prisma } from "@prisma/client";

export class SdkLogService {
    public static async create(data: Prisma.SdkLogCreateInput) {
        return await db.sdkLog.create({
            data
        })
    }
}
