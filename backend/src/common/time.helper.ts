import { Prisma } from "@prisma/client"
import { PrismaService } from "src/prisma/prisma.service"



export async function getSystemTime(prisma:PrismaService | Prisma.TransactionClient){
        const config = await prisma.systemConfig.findUnique({
            where: {
                id: "time_config"
            }
        })
        const offsetDate = (config?.virtualTimeOffsetDays || 0) * 24 * 60 * 60 * 1000
        return new Date(Date.now() + offsetDate)
    }