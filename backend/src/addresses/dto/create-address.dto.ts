import { IsBoolean, IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateAddressDto{ 
    @IsString()
    @MaxLength(40, {message: "Label terlalu panjang!"})
    @IsNotEmpty()
    label: string

    @IsString()
    @IsNotEmpty()
    @MaxLength(300, {message: "Address terlalu panjang!"})
    fullAddress: string

    @IsBoolean()
    @IsNotEmpty()
    isDefault :boolean

}