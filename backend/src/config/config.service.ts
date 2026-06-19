import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
    constructor(private readonly config:ConfigService ){}
    get dbUrl():string{
        return this.config.getOrThrow<string>('DATABASE_URL')
    }
}


