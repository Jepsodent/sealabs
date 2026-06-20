import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from "class-validator";


export class CreateReviewDto { 
    @IsString()
    @IsOptional()
    reviewerName?: string

    @IsInt()
    @Min(1)
    @Max(5)
    @IsNotEmpty()
    rating: number

    @IsString()
    @IsNotEmpty()
    @MaxLength(500, {message: "Maximal karakter 500"} )
    comment: string
}