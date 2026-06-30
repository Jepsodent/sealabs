import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { AppConfigService } from 'src/config/config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private config: AppConfigService){
      const adapter = new PrismaPg(
        {connectionString: config.dbUrl},
      )  
      super({adapter})
  }
  async onModuleInit() {
    // Connect to the database when the module initializes 
    await this.$connect();
  }

  async onModuleDestroy() {
    // Disconnect from the database when the application shuts down
    await this.$disconnect();
  }
}
