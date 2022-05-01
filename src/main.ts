import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from './modules/config/config.module';
import { ConfigService } from './modules/config/config.service';

async function getCorsDomains() {
  const configContext = await NestFactory.createApplicationContext(
    ConfigModule,
  );
  const configService = configContext.get(ConfigService);
  const corsDomains = configService.get('ENABLED_CORS_DOMAINS').split(',');
  await configContext.close();
  return corsDomains;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      skipMissingProperties: true,
      whitelist: true,
    }),
  );
  app.enableCors({
    origin: await getCorsDomains(),
  });
  await app.listen(3000);
}
bootstrap();
