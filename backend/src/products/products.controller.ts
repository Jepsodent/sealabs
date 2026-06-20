import { Controller, Get, Param } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly productService: ProductsService){}
    @Get()
    getProduct(){
        return this.productService.getProduct()
    }
    @Get(':id')
    getProductById(@Param('id') id: string){
        return this.productService.getProductById(id)
    }
}
