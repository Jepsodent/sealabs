import { IsInt, IsNotEmpty } from "class-validator";


export class UpdateTimeDto{
    @IsInt()
    @IsNotEmpty({message: "Hari tidak boleh kosong!"})
    days: number
}