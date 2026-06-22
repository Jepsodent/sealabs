import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
//   public DUMMY_PRODUCTS = [
//   {
//     id: "prod-1",
//     name: "Mechanical Keyboard RGB",
//     description: "Keyboard mekanikal dengan switch biru dan lampu RGB.",
//     price: 450000,
//     stock: 15,
//     storeName: "Tech Gadget Store"
//   },
// ];
    constructor(private prisma: PrismaService){}

    async getProduct(){
        return this.prisma.product.findMany({
          include: {store: {
            select: {name: true},
          }}
        })
    }
    async getProductById(id:string){
        const product = await this.prisma.product.findUnique({
          where: {
            id
          },
          include: {
            store: {select: {name: true}}
          }
        })
        if(!product){
            throw new NotFoundException('Product not found!')
        }
        return product
    }

    async createProduct(userId:string, dto:CreateProductDto){
      const store = await this.prisma.store.findUnique({
        where: {ownerId: userId}
      })
      if(!store){
        throw new BadRequestException("Anda harus punya toko terlebih dahulu!")
      }
      const product = await this.prisma.product.findUnique({
        where:{ 
          storeId_name: {
            storeId: store.id,
            name: dto.name
          }
        }
      })
      if(product){
        throw new ConflictException("Produk denan nama tersebut sudah ada di toko Anda!")
      }
      return this.prisma.product.create({
        data:{ 
          description: dto.description,
          imageUrl: dto.imageUrl,
          name: dto.name,
          price: dto.price,
          stock: dto.stock,
          storeId: store.id
        }
      })
    }

    async getMyProduct(userId: string){
      const store = await this.prisma.store.findUnique({
        where: {ownerId: userId}
      })
      if(!store){
        throw new BadRequestException("Anda harus punya toko terlebih dahulu!")
      }

      return this.prisma.product.findMany({
        where: {storeId: store.id}
      })
    }

    async updateProduct(userId:string, productId:string, dto:UpdateProductDto){
      const store = await this.prisma.store.findUnique({
        where: {ownerId: userId}
      })
      if(!store){
        throw new BadRequestException("Anda harus punya toko terlebih dahulu!")
      }
      const product = await this.prisma.product.findUnique({
        where: {
          id: productId,
        }
      })
      if(!product){
        throw new NotFoundException("Product tidak ditemukkan")
      }
      if(store.id !== product.storeId){
        throw new ForbiddenException("Anda tidak memiliki akses ke product")
      }

      if(dto.name){
        const existedProduct = await this.prisma.product.findFirst({
          where:{
            storeId: store.id,
            name:dto.name,
            id: {not: productId}
          }
        })
        if(existedProduct){
          throw new ConflictException("Produk dengan nama tersebut sudah ada di toko anda!")
        }
      }


      if (Object.keys(dto).length === 0){
        throw new BadRequestException('No fields to update')
      }

      return this.prisma.product.update({
        where:{ 
          id:productId
        },
        data: dto
      })
    }

    async deleteProduct(userId: string, productId: string){
      const store = await this.prisma.store.findUnique({
        where: {ownerId: userId}
      })
      if(!store){
        throw new BadRequestException("Anda harus punya toko terlebih dahulu!")
      }
      const product = await this.prisma.product.findUnique({
        where: {
          id: productId,
        }
      })
      if(!product){
        throw new NotFoundException("Product tidak ditemukkan")
      }
      if(store.id !== product.storeId){
        throw new ForbiddenException("Anda tidak memiliki akses ke product")
      }
      return this.prisma.product.delete({where: {id: productId}})
    }


}
