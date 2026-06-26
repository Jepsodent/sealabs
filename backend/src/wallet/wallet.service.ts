import { Injectable } from '@nestjs/common';
import { TopUpDto } from './dto/top-up.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionType } from '@prisma/client';

@Injectable()
export class WalletService {
    constructor(private readonly prisma: PrismaService){}
    
    async topUp(userId: string , dto: TopUpDto){
        const {updateSaldo} = await this.prisma.$transaction(async (tx) => {
            const updateSaldo = await tx.wallet.update({
                where: {
                    userId
                },
                data: {
                    balance: {
                        increment: dto.amount
                    }

                }
            })
            const transactionLog = await tx.walletTransaction.create({
                data: {
                    amount: dto.amount,
                    userId, 
                    type: TransactionType.TOP_UP
                }
            })
            return {updateSaldo, transactionLog}
        })
        return updateSaldo
    }

    async getTransactionHistory(userId:string){
        return await this.prisma.walletTransaction.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            }
            
        })
    }

}
