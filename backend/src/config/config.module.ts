import { Global, Module } from '@nestjs/common';
import { AppConfigService } from './config.service';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports:[NestConfigModule.forRoot()],
  providers: [AppConfigService],
  exports: [AppConfigService],
})
export class ConfigModule {}
