import { IsOptional, IsString, MaxLength, MinLength } from "class-validator";



export class EditStoreDto{ 

    @IsOptional()
    @IsString()
    @MinLength(5, {message: "Minimal 5 karakter"})
    name?: string


    @IsOptional()
    @IsString()
    @MaxLength(100, {message: "Maximal 100 karakter"})
    description?: string
}