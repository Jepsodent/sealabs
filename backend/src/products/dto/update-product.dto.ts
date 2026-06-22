import { IsInt, IsOptional, IsString, MaxLength, Min } from "class-validator";



export class UpdateProductDto{
    @IsOptional()
    @IsString()
    @MaxLength(50, {message: "Nama produk maximal 50 karakter"})
    name?: string

    @IsOptional()
    @IsString()
    @MaxLength(150, {message: "Deskripsi produk maximal 200 karakter"})
    description?: string

    @IsInt()
    @Min(0, {message: "Nilai tidak boleh negatif"})
    @IsOptional()
    price?: number
    
    @IsOptional()
    @Min(0, {message: "Nilai tidak boleh negatif"})
    @IsInt()
    stock?: number

    @IsString()
    @IsOptional()
    imageUrl?: string

}