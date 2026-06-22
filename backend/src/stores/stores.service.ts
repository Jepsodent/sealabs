import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { EditStoreDto } from './dto/edit-store.dto';

@Injectable()
export class StoresService {
    constructor(private readonly prisma:PrismaService){}

    async createStore(dto: CreateStoreDto, userId: string){
        const user = await this.prisma.user.findUnique({
            where: {id: userId},
            include: {
                store: true
            }
        })
        // kalo ga ada user udh di handle di guards level 
        if (user?.store){
            throw new BadRequestException("Anda sudah memiliki toko!")
        }
        const store = await this.prisma.store.findUnique({
            where: {
                name: dto.name
            }
        })
        if (store){
            throw new ConflictException("Nama toko sudah digunakan")
        }

        return this.prisma.store.create({
            data: {
                name: dto.name,
                description: dto.description,
                ownerId: userId,
            }
        })
    }
    
    async getMyStore(userId: string){
        const store = await this.prisma.store.findUnique({
            where: {
                ownerId: userId
            },
            include: {
                owner: {select: {username: true }},
                products: true
            }
        })
        if(!store){
            throw new NotFoundException("Toko tidak ditemukkan")
        }

        return store
    }

    async updateMyStore(dto: EditStoreDto , userId:string){
        const store = await this.getMyStore(userId)
        // entries: ubah dari object {key: value}-> [key ,value] -> filter yg v !== undefinied yg diambil
        // fromEntries itu ubah dari [key, value] -> {key , value} lagi
        if (Object.keys(dto).length === 0){
            throw new BadRequestException('No fields to update')
        }

        if (dto.name){
            const existedStore = await this.prisma.store.findFirst({
                where: {
                    name: dto.name,
                    NOT: {
                        id: store.id
                    }
                }
            })
            if (existedStore){
                throw new ConflictException("Nama toko sudah digunakan")
            }
        }

        return this.prisma.store.update({
            where: {
                id: store.id
            },
            data: dto,
        })
    }
    // public endpoints
    async getDetailStore(storeId:string){
        const store = await this.prisma.store.findUnique({
            where:{ 
                id: storeId
            },
            include: {
                owner: {
                    select: {
                        username:true, 
                    }
                },
                products: true
            }
        })
        if (!store){
            throw new NotFoundException("Toko tidak ditemukan")
        }
        return store
    }



}
