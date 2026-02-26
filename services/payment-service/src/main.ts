import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { MetricsInterceptor } from "./metrics/metrics.interceptor";
import { MetricsService } from "./metrics/metrics.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ["http://localhost:8080", "http://localhost:5173"],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global Metrics Interceptor
  const metricsService = app.get(MetricsService);
  app.useGlobalInterceptors(new MetricsInterceptor(metricsService));

  const port = process.env.PORT || 3003;
  await app.listen(port);
  console.log(`Payment Service running on port ${port}`);
}

bootstrap();
