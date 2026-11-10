import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type ErrorBody = {
  statusCode: number;
  error: string;
  message: string;
  hint?: string;
  path: string;
  timestamp: string;
};

const STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
};

/**
 * Turns every thrown error into one consistent, human-readable JSON body so the
 * frontend never has to guess at Nest's default shape. Unknown routes get a hint
 * listing the real endpoints, which is the mistake people actually make.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exceptions');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const { message, hint } = this.describe(exception, status, request);

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.originalUrl} -> ${status}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    const body: ErrorBody = {
      statusCode: status,
      error: STATUS_TEXT[status] ?? 'Error',
      message,
      path: request.originalUrl,
      timestamp: new Date().toISOString(),
    };
    if (hint) body.hint = hint;

    response.status(status).json(body);
  }

  private describe(
    exception: unknown,
    status: number,
    request: Request,
  ): { message: string; hint?: string } {
    if (exception instanceof HttpException) {
      const raw = exception.getResponse();
      const message =
        typeof raw === 'string'
          ? raw
          : Array.isArray((raw as { message?: unknown }).message)
            ? ((raw as { message: string[] }).message ?? []).join('; ')
            : ((raw as { message?: string }).message ?? exception.message);

      if (status === HttpStatus.NOT_FOUND) {
        // Nest's own unmatched-route message looks like "Cannot GET /foo".
        // Anything else ("Resort 5 not found") is a real route with a missing
        // record, and telling the caller to check the route list would be wrong.
        const unmatchedRoute = /^Cannot (GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS) /.test(
          message,
        );
        return unmatchedRoute
          ? { message, hint: this.notFoundHint(request) }
          : { message };
      }
      return { message };
    }

    if (exception instanceof Error) {
      return {
        message:
          process.env.NODE_ENV === 'production'
            ? 'Something went wrong on our side. Please try again.'
            : exception.message,
      };
    }

    return { message: 'Unknown error' };
  }

  private notFoundHint(request: Request): string {
    const base = '/rest/v1';
    const path = request.originalUrl.split('?')[0];

    if (path === base || path === `${base}/`) {
      return `${base} is the API prefix, not an endpoint. Try ${base}/health, ${base}/resorts or ${base}/tour_packages.`;
    }
    return `No route matches ${path}. Available: GET ${base}/health, GET ${base}/resorts, GET ${base}/resorts/:id, GET ${base}/tour_packages, GET ${base}/tour_packages/:id.`;
  }
}
