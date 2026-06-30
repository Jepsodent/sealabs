import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true
  }
  ))
  app.enableCors({
    origin:[
      'http://localhost:3001',
      'http://localhost:3000',
      'https://sealabs.vercel.app/',
    ],
    credentials:true
  })
  const config = new DocumentBuilder().setTitle("SEAPEDIA API").setDescription('Dokumentasi API untuk SEAPEDIA').setVersion("1.0").addBearerAuth().build();
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app ,document)

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
