import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const response = exception.getResponse();

    let message: string;
      
    if (typeof response === "string") {
      message = response;
    } else if (typeof response === "object" && response !== null) {
      message = (response as any).message || "An error occurred";
    } else {
      message = "An error occurred";
    }

    this.logger.error(`Error processing request for ${req.method} ${req.url}, Message: ${exception["message"]}, Stack: ${exception["stack"]}`);
    
    res.status(status).json({
      success: false,
      status_code: status,
      message
    })
  }
}