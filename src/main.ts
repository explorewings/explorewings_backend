import { NestFactory } from '@nestjs/core';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { assertEnv, logConfigSummary } from './common/env-check';

async function bootstrap(): Promise<void> {
  assertEnv();

  const app = await NestFactory.create(AppModule);

  app.use(compression());
  app.setGlobalPrefix('rest/v1', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });
  app.enableCors({
    origin: true,
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 3000);
  // Hostless and similar PaaS set HOST; binding loopback makes the app
  // unreachable from the platform proxy even when the port is right.
  const host = process.env.HOST ?? '0.0.0.0';
  await app.listen(port, host);

  logConfigSummary();
  console.log(`[explore-wings-api] listening on ${host}:${port}`);
  console.log('[explore-wings-api] base path: /rest/v1');
}

bootstrap().catch((err: unknown) => {
  console.error(
    '[explore-wings-api] failed to start:',
    err instanceof Error ? err.message : err,
  );
  process.exit(1);
});
