import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //swagger setup
  const config = new DocumentBuilder()
    .setTitle('Khedmatey API')
    .setDescription('API for the Khedmatey application')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('auth:customer', 'Customer authentication endpoints')
    .addTag('auth:service-provider', 'Service provider authentication endpoints')
    .addTag('auth:admin', 'Admin authentication endpoints')
    .addTag('customer', 'Customer management endpoints')
    .addTag('service-provider', 'Service provider management endpoints')
    .addTag('service', 'Service management endpoints')
    .addTag('request', 'Service request endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,// strips unknown properties
  }));

  await app.listen(8000);
}
bootstrap();
