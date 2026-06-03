import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export const createNestServer = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));

  // ✅ Enable CORS for local + deployed frontend
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [
      'http://localhost:3000',
      'https://library-frontend-theta-drab.vercel.app',
    ];

  console.log('Allowed CORS origins:', allowedOrigins);

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Library Manager API')
    .setDescription('REST API for managing books, members, and borrowing operations')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api', app, document);

  // Optional health check endpoint
  app.getHttpAdapter().get('/healthz', (_req, res) => res.send('OK'));

  await app.init();
  return app;
};

// Local Dev Mode Only
if (!process.env.VERCEL) {
  createNestServer(server).then(() => {
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      console.log(`✅ Library Manager API running at http://localhost:${port}`);
      console.log(`📚 Swagger docs available at http://localhost:${port}/api`);
    });
  });
}
