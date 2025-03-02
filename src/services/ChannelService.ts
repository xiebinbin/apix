import { db } from "@/libs/db";
import { type Prisma } from "@prisma/client";
export class ChannelService {
    public static async findByName(name: string) {
        const channel = await db.channel.findFirst({
            where: {
                name
            }
        })
        if (!channel && name == 'default') {
            return await db.channel.create({
                data: {
                    name: 'default',
                    power: 'on'
                }
            })
        }
        return channel
    }
}
