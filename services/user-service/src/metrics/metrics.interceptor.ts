import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { MetricsService } from "./metrics.service";

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, url } = req;

    // Ignore metrics endpoint to avoid polluting the data
    if (url === "/metrics") {
      return next.handle();
    }

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const duration = (Date.now() - startTime) / 1000;
          this.metricsService.recordRequestDuration(
            method,
            url,
            res.statusCode.toString(),
            duration,
          );
        },
        error: (error) => {
          const duration = (Date.now() - startTime) / 1000;
          const status = error.status || 500;
          this.metricsService.recordRequestDuration(
            method,
            url,
            status.toString(),
            duration,
          );
        },
      }),
    );
  }
}
