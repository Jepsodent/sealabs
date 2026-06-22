import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateStoreDto{ 
    @IsString()
    @IsNotEmpty({message: "Tolong isi nama toko anda!"})
    @MinLength(5, {message: "Minimal 5 karakter"})
    name: string

    @IsString()
    @IsOptional()
    @MaxLength(100, {message: "Maximal 100 karakter"})
    description?: string
}   