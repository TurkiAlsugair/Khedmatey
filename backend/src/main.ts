import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //automatillcy apply validation on the request based on the dto used in the route
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,// strips unknown properties
  }));

  await app.listen(8000);
}
bootstrap();
