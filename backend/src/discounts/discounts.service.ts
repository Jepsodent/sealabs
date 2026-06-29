import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePromoDto } from './dto/create-promo.dto';
import { CreateVoucerDto } from './dto/create-voucer.dto';
import { DiscountType } from '@prisma/client';
import { getSystemTime } from 'src/common/time.helper';

@Injectable()
export class DiscountsService {

    constructor(private readonly prisma: PrismaService) { }

    async createVoucer(dto: CreateVoucerDto) {
        if (dto.isPercent && dto.discountValue > 100) {
            throw new BadRequestException('Diskon persen tidak boleh lebih dari 100%')
        }
        const voucer = await this.prisma.voucher.findUnique({
            where: {
                code: dto.code
            }
        })
        const promo = await this.prisma.promo.findUnique({
            where: {
                code: dto.code
            }
        })
        if (voucer || promo) {
            throw new ConflictException('Kode diskon sudah digunakan!')
        }

        return this.prisma.voucher.create({
            data: {
                code: dto.code,
                discountValue: dto.discountValue,
                expiryDate: dto.expiryDate,
                isPercent: dto.isPercent,
                remainingUsage: dto.remainingUsage
            }
        })
    }
    async createPromo(dto: CreatePromoDto) {
        if (dto.isPercent && dto.discountValue > 100) {
            throw new BadRequestException('Diskon persen tidak boleh lebih dari 100%')
        }
        const promo = await this.prisma.promo.findUnique({
            where: {
                code: dto.code
            }
        })
        const voucer = await this.prisma.voucher.findUnique({
            where: {
                code: dto.code
            }
        })
        if (promo || voucer) {
            throw new ConflictException('Kode diskon sudah digunakan!')
        }
        return this.prisma.promo.create({
            data: {
                code: dto.code,
                discountValue: dto.discountValue,
                expiryDate: dto.expiryDate,
                isPercent: dto.isPercent,
            }
        })
    }

    async getValidateCode(code: string) {
        const voucher = await this.prisma.voucher.findUnique({ where: { code } })
        const systemDate = await getSystemTime(this.prisma)
        if (!voucher) {
            const promo = await this.prisma.promo.findUnique({ where: { code } })
            if (!promo) {
                throw new NotFoundException('Kode diskon tidak ditemukan')
            }
            if (promo.expiryDate < systemDate) {
                throw new BadRequestException('Kode diskon sudah kadaluwarsa')
            }

            return {
                ...promo,
                type: DiscountType.PROMO
            }
        }
        if (voucher.expiryDate < systemDate) throw new BadRequestException('Kode diskon sudah kadaluwarsa')
        if (voucher.remainingUsage <= 0) throw new BadRequestException('Kuota voucher telah habis!')
        return {
            ...voucher,
            type: DiscountType.VOUCHER
        }
    }

}


