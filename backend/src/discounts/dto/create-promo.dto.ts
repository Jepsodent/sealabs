import { Type } from "class-transformer";
import { IsBoolean, IsDate, IsNotEmpty, IsNumber, IsString, MaxLength, Min } from "class-validator";
import { IsFutureDate } from "../decorator/date-validator.decorator";



export class CreatePromoDto{
    @IsString()
    @MaxLength(30, {message: "Maximal panjang karakter code adalah 30!"})
    @IsNotEmpty({message: "Code tidak boleh kosong!"})
    code: string

    @IsNumber()
    @IsNotEmpty({message: "Harga discount tidak boleh kosong!"})
    @Min(1, {message: "Minimal discount value harus lebih dari 0" })
    discountValue: number  
    
    @IsBoolean()    
    @IsNotEmpty({message: "Status persen tidak boleh kosong!"})
    isPercent: boolean      
    
    @IsDate()
    @Type(() => Date)
    @IsFutureDate()
    expiryDate:Date     
}