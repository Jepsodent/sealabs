import { Role } from "@prisma/client";
import { IsEnum, IsNotEmpty } from "class-validator";


export class updateActiveRoleDto{ 
    @IsEnum(Role, {message: "Role aktif tidak valid"})
    @IsNotEmpty({message:"Role tidak boleh kosong!"})
    activeRole: Role;
}