import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, InternalServerErrorException, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators"

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> | Promise<Observable<unknown>> {
    return next.handle().pipe(
      map((res: { message: string, data: unknown }) => this.responseHandler(res, context)),
      catchError((err: unknown) => {
        if (err instanceof HttpException) throw err;
        return throwError(() => this.errorHandler(err, context))
      })
    )
  };

  errorHandler(exception: unknown, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    this.logger.error(
      `Error processing request for ${req.method} ${req.url}, Message: ${exception["message"]}, Stack: ${exception["stack"]}`
    );
    return new InternalServerErrorException({
      success: false,
      status_code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Internal server error",
    });
  };

  responseHandler(
    res: { message: string; data: unknown, access_token?: string },
    context: ExecutionContext
  ) {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const status_code = response.statusCode;

    response.setHeader("Content-Type", "application/json");
    if (typeof res === "object") {
      const { message, access_token, ...data } = res;

      return {
        success: true,
        status_code,
        message,
        ...data,
        ...(access_token ? { access_token } : {})
      }
    } else {
      return res;
    }
  }
}