import { BadRequestException, Injectable } from '@nestjs/common';
import { TopUpDto } from './dto/top-up.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionType } from '@prisma/client';
import { getSystemTime } from 'src/common/time.helper';

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
            const systemTime = await getSystemTime(tx)
            const transactionLog = await tx.walletTransaction.create({
                data: {
                    amount: dto.amount,
                    userId, 
                    type: TransactionType.TOP_UP,
                    createdAt: systemTime
                }
            })
            return {updateSaldo, transactionLog}
        })
        return updateSaldo
    }

    // ini gaboleh dipanggil di transaction lain karena ini udah ada transactionnya sendiri *takutnya ga bisa di rollback nanti
    async payment(userId:string, price:number){
        const result = await this.prisma.$transaction(async(tx) => {
            const walletBalance = await tx.wallet.findUnique({where: {userId}, select: {balance: true}})
            if(walletBalance && walletBalance.balance < price){
                throw new BadRequestException("Saldo anda tidak mencukupi transaksi ini!")
            }
            const updateSaldo = await tx.wallet.update({
                where:{userId},
                data: {
                    balance: {
                        decrement: price
                    }
                }
            })
            const systemTime = await getSystemTime(tx)
            await tx.walletTransaction.create({
                data: {
                    amount: price,
                    userId,
                    type: TransactionType.PAYMENT,
                    createdAt: systemTime
                }
            })
            return updateSaldo
        })
        return result
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

    async getWalletBalance(userId:string){
        let wallet = await this.prisma.wallet.findUnique({
            where: {
                userId
            }
        })
        if(!wallet){
            wallet = await this.prisma.wallet.create({
                data: {
                    userId,
                    balance: 0
                }
            })
        }
        return wallet
    }
}
