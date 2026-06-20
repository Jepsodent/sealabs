import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductsService {
    public DUMMY_PRODUCTS = [
  {
    id: "prod-1",
    name: "Mechanical Keyboard RGB",
    description: "Keyboard mekanikal dengan switch biru dan lampu RGB.",
    price: 450000,
    stock: 15,
    storeName: "Tech Gadget Store"
  },
  {
    id: "prod-2",
    name: "Wireless Gaming Mouse",
    description: "Mouse gaming nirkabel dengan akurasi sensor 16000 DPI.",
    price: 320000,
    stock: 25,
    storeName: "Tech Gadget Store"
  },
  {
    id: "prod-3",
    name: "Ergonomic Office Chair",
    description: "Kursi kantor ergonomis dengan sandaran punggung jaring yang nyaman.",
    price: 1200000,
    stock: 5,
    storeName: "Comfort Furniture"
  },
  {
    id: "prod-4",
    name: "Stainless Steel Tumbler 500ml",
    description: "Tumbler tahan panas dan dingin hingga 12 jam.",
    price: 150000,
    stock: 50,
    storeName: "Eco Bottle Co"
  },
  {
    id: "prod-5",
    name: "Bluetooth Noise Cancelling Headphone",
    description: "Headphone over-ear dengan fitur aktif peredam bising.",
    price: 850000,
    stock: 10,
    storeName: "Audio Station"
  }
];
    constructor(private prisma: PrismaService){}

    getProduct(){
        return this.DUMMY_PRODUCTS
    }
    getProductById(id:string){
        const product = this.DUMMY_PRODUCTS.find((prod) => prod.id == id )
        if(!product){
            throw new NotFoundException('Product not found!')
        }
        return product
    }
}
