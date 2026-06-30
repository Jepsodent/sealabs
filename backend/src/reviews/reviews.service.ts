import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { DeleteReviewDto } from './dto/delete-review-dto';

@Injectable()
export class ReviewsService {
    constructor(private prisma:PrismaService){}

    async createReview(dto: CreateReviewDto){

        // sblmnya sbnrnya sudah aman , karena prisma kita ga raw sql , dan di fe udah ditampilin normal, namun ini cara untuk rplace kata nya biar 
        const santizedComment = dto.comment
                                            .replace(/&/g, '&amp;')
                                            .replace(/</g, '&lt;')
                                            .replace(/>/g, '&gt;')
                                            .replace(/"/g, '&quot;')
                                            .replace(/'/g, '&#x27;');
        // console.log(santizedComment)
        const reviewName = dto.reviewerName ? dto.reviewerName : "Guest"
        const santizedReviewName = reviewName
                                            .replace(/&/g, '&amp;')
                                            .replace(/</g, '&lt;')
                                            .replace(/>/g, '&gt;')
                                            .replace(/"/g, '&quot;')
                                            .replace(/'/g, '&#x27;');
        

        // console.log(santizedReviewName)
        return this.prisma.appReview.create({
            data: {
                comment: santizedComment,
                rating: dto.rating,
                reviewerName: santizedReviewName
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
