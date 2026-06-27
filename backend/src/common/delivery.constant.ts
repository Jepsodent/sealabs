import { DeliveryMethod } from "@prisma/client";


export const DeliveryPrice: Record<DeliveryMethod, number> = { 
    INSTANT: 20000,
    NEXT_DAY: 12000,
    REGULAR: 7000
}
export const ppnTax:number = 0.12 //12%
