import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async homeResponder() {
    return { success: true, status_code: 200, message: "API responder for Order-Chat Management NestJs API, to access the docs, go to /api-docs"};
  };

  async apiResponder() {
    return { success: true, status_code: 200, message: "API responder for Order-Chat Management NestJs API"};
  }
}
