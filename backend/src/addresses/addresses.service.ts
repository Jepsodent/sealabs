import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
    constructor(private readonly prisma: PrismaService){}

    async createAddress(userId: string, dto: CreateAddressDto){
        // perbaikan jika address mau unique harus ditambah juga di schema db unique di label / full addressnya
        // const address = await this.prisma.address.findUnique({
        //     where:{ 
        //         label: dto.label,
        //         userId,
        //     }
        // })
        // if(address){
        //     throw new ConflictException('Alamat sudah terdaftar!')
        // }

        const result = await this.prisma.$transaction(async (tx) => {
            if (dto.isDefault){
                await tx.address.updateMany({
                    where: {
                        userId,
                    },
                    data: {
                        isDefault: false
                    }
                })
            }
            return await tx.address.create({
                data: {
                    userId,
                    fullAddress: dto.fullAddress, 
                    label: dto.label,
                    isDefault: dto.isDefault
                }
            })
        })
        return result
    }

    async getAddress(userId:string){
        const result = await this.prisma.address.findMany({
            where: {
                userId
            }
        })
        return result
    }

    async editAddress(userId: string,addressId: string, dto:UpdateAddressDto){
        const findAddress = await this.prisma.address.findUnique({
            where: {id: addressId}
        })
        if(!findAddress){
            throw new NotFoundException("Alamat tidak ditemukkan")
        }

        if(findAddress.userId !== userId){
            throw new ForbiddenException("Anda tidak diizinkan mengubah alamat ini!")
        }

        const result = await this.prisma.$transaction(async(tx) => {
            if(dto.isDefault){
                await tx.address.updateMany({
                    where: {userId, NOT: {id: addressId}},
                    data: {
                        isDefault: false
                    }
                     
                })
            }
            return await tx.address.update({
                where: {id: addressId},
                data: {
                    fullAddress: dto.fullAddress,
                    label: dto.label,
                    isDefault: dto.isDefault,
                }
            })
        })
        return result
    }

    async deleteAddress(userId: string, addressId:string){
        const existAddress = await this.prisma.address.findUnique({
            where: {
                id: addressId
            }
        })
        if(!existAddress){
            throw new NotFoundException("Address tidak ditemukkan")
        }
        if (existAddress.userId !== userId){
            throw new ForbiddenException("Anda tidak diizinkan menghapus alamat ini")
        }

        return this.prisma.address.delete({
            where: {id: addressId}
        })
    }


}
