import { Tokens } from '@common/types';
import { HttpStatus } from '@nestjs/common';

export class ResponseData<Entity> {
  success: boolean;
  message: string;
  statusCode: HttpStatus;
  data?: Entity;
  tokens?: Tokens;

  constructor(options: {
    success: boolean;
    message: string;
    statusCode: HttpStatus;
    data?: Entity;
    tokens?: Tokens;
  }) {
    this.success = options.success;
    this.message = options.message;
    this.statusCode = options.statusCode;
    this.data = options.data;
    this.tokens = options.tokens;
  }
}
