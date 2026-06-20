import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import { SafeUser } from "../types/User";


export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest<Request>()
        return request.user as SafeUser
    }
)