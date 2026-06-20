import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { DeleteReviewDto } from './dto/delete-review-dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma:PrismaService){}

    async createReview(dto: CreateReviewDto){
        const reviewName = dto.reviewerName ? dto.reviewerName : "Guest"
        return this.prisma.appReview.create({
            data: {
                comment: dto.comment,
                rating: dto.rating,
                reviewerName: reviewName
            }
        })
    }


    async getReview(){
        return this.prisma.appReview.findMany({
            orderBy: {
                createdAt: "desc"
            } 
        })
    }

    async deleteReviews(dto: DeleteReviewDto){
        const result = await this.prisma.appReview.deleteMany({
            where: {
                id: dto.id
            }
        }) 
        const {count} = result
        return {
            success: count == 0 ? false: true 
        }
    }
}
