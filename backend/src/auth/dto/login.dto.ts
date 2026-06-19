import { IsNotEmpty, IsString, MinLength } from "class-validator"



export class LoginDto{
    @IsString()
    @IsNotEmpty({message: "Nama tidak boleh kosong"})
    username: string

    @IsString()
    @MinLength(8, {message: "Password minimal 8 karakter!"})
    @IsNotEmpty({message: "Password ga boleh kosong!"})
    password: string

}