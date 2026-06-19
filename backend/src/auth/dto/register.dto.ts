import { Role } from "@prisma/client"
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsString, MinLength } from "class-validator"
import { measureMemory } from "vm"



export class RegisterDto{ 

    @IsString()
    @IsNotEmpty({message: "Nama tidak boleh kosong"})
    username: string
    
    @IsString()
    @IsNotEmpty({message: "Password ga boleh kosong!"})
    @MinLength(8, {message: "Password minimal harus 8 karakter"})
    password: string

    @IsArray()
    @ArrayNotEmpty({message:"Pilih minimal 1 role"})
    @IsEnum(Role, {each: true, message: "Peran yang dipilih ga valid"})
    roles: Role[]

}