import { IsInt, IsNotEmpty, Min } from "class-validator";


export class UpdateCartDto{
    @IsInt()
    @Min(1, {message: "Minimal quantity adalah 1"})
    @IsNotEmpty({message: "Tolong masukkan quantity"}) //kalo mau hit endpoint update harus ada quantitynya lah kalo gada kocak banget
    quantity: number
}