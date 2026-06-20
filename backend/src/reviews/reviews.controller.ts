import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewsService } from './reviews.service';
import { DeleteReviewDto } from './dto/delete-review-dto';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewService: ReviewsService){}
    @Post()
    async createReview(@Body() dto: CreateReviewDto){
        return this.reviewService.createReview(dto)
    }

    @Get()
    async getReview(){
        return this.reviewService.getReview()
    }

    @Delete()
    async DeleteReviewDto(@Body() dto: DeleteReviewDto){
        return this.reviewService.deleteReviews(dto)
    }

}
