import { IsInt, IsNotEmpty, IsString, Min } from "class-validator"


export class AddCartDto{
    
    @IsString()
    @IsNotEmpty({message: "Product ID harus tersedia"})
    productId: string

    @IsInt()
    @Min(1, {message: "Minimal quantity adalah 1"})
    @IsNotEmpty({message: "Tolong masukkan quantity"})
    quantity: number
}