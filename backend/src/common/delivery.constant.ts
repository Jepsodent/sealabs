import { DeliveryMethod } from "@prisma/client";


export const DeliveryPrice: Record<DeliveryMethod, number> = { 
    INSTANT: 20000,
    NEXT_DAY: 12000,
    REGULAR: 7000
}
export const DeliveryTime: Record<DeliveryMethod, number> = {
    INSTANT: 1,
    NEXT_DAY: 2,
    REGULAR: 4
}


export const ppnTax:number = 0.12 //12%
