import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';

function isAbortedRequest(exception: unknown): boolean {
  if (typeof exception !== 'object' || exception === null) {
    return false;
  }

  const error = exception as { type?: string; code?: string };
  return error.type === 'request.aborted' || error.code === 'ECONNABORTED';
}

@Catch()
export class AbortedRequestFilter
  extends BaseExceptionFilter
  implements ExceptionFilter
{
  constructor(protected readonly httpAdapterHost: HttpAdapterHost) {
    super(httpAdapterHost.httpAdapter);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    if (isAbortedRequest(exception)) {
      const response = host.switchToHttp().getResponse<{ headersSent?: boolean; end: () => void }>();
      if (!response.headersSent) {
        response.end();
      }
      return;
    }

    super.catch(exception, host);
  }
}
