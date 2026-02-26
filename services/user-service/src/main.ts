import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { MetricsInterceptor } from "./metrics/metrics.interceptor";
import { MetricsService } from "./metrics/metrics.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: ["http://localhost:8080", "http://localhost:5173"],
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

  // Global Metrics Interceptor
  const metricsService = app.get(MetricsService);
  app.useGlobalInterceptors(new MetricsInterceptor(metricsService));

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`User Service running on port ${port}`);
}

bootstrap();
