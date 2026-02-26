import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MetricsInterceptor } from "./metrics/metrics.interceptor";
import { MetricsService } from "./metrics/metrics.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ["http://localhost:8080", "http://localhost:5173"],
    credentials: true,
  });

  // Global Metrics Interceptor
  const metricsService = app.get(MetricsService);
  app.useGlobalInterceptors(new MetricsInterceptor(metricsService));

  const port = process.env.PORT || 3004;
  await app.listen(port);
  console.log(`Fraud Detection Service running on port ${port}`);
}

bootstrap();
