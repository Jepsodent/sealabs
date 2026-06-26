import { IsInt, IsNotEmpty, Min } from "class-validator";


export class TopUpDto{
    @IsInt()
    @Min(1000)
    @IsNotEmpty()
    amount: number
    
}