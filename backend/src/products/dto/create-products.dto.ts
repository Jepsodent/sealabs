import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from "class-validator";



export class CreateProductDto{
    @IsNotEmpty({message: "Nama ga boleh kosong!"})
    @IsString()
    @MaxLength(50, {message: "Nama produk maximal 50 karakter"})
    name: string

    @IsOptional()
    @IsString()
    @MaxLength(150, {message: "Deskripsi produk maximal 200 karakter"})
    description?: string

    @IsInt()
    @Min(0, {message: "Nilai tidak boleh negatif"})
    @IsNotEmpty({message: "Harga tidal boleh kosong!"})
    price: number
    
    @IsNotEmpty({message: "Stock tidak boleh kosong"})
    @Min(0, {message: "Nilai tidak boleh negatif"})
    @IsInt()
    stock: number

    @IsString()
    @IsNotEmpty({message: "Link Gambar wajib diisi!"})
    imageUrl: string

}