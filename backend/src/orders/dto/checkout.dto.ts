import { DeliveryMethod } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";



export class CheckoutDto{ 

    @IsString()
    @IsNotEmpty({message: "Tolong pilih address!"})
    addressId: string

    @IsEnum(DeliveryMethod)
    deliveryMethod: DeliveryMethod
    
}