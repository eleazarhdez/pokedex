import { ArgumentsHost, Catch, NotFoundException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { NotFoundError } from '../../domain/not-found.error';

@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    if (exception instanceof NotFoundError) {
      return super.catch(new NotFoundException(exception.message), host);
    }
    super.catch(exception, host);
  }
}
