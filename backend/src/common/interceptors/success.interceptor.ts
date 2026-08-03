import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // For paginated responses with data and meta
        if (data && typeof data === 'object' && 'data' in data && 'meta' in data) {
          return {
            success: true,
            message: data?.message || 'Success',
            data: data.data,
            meta: data.meta,
            timestamp: new Date().toISOString(),
          };
        }
        // For simple responses
        return {
          success: true,
          message: data?.message || 'Success',
          data: data?.data ?? data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
