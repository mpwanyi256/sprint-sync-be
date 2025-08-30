import { Request, Response, NextFunction } from 'express';
import Logger from '../core/Logger';
import { ProtectedRequest } from '../types/AppRequests';
import { ApiError, InternalError } from '../core/ApiErrors';
import { isDev } from '../config';

export interface RequestLogData {
  method: string;
  path: string;
  userId?: string;
  userAgent?: string;
  ip: string;
  startTime: number;
  requestId: string;
}

// Generate a simple request ID
const generateRequestId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Request type extension is now in src/types/express.d.ts

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();
  const requestId = generateRequestId();

  // Store request data for use in response logging
  req.requestLogData = {
    method: req.method,
    path: req.originalUrl || req.url,
    userId: (req as ProtectedRequest).user?._id?.toString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    startTime,
    requestId,
  };

  // Log incoming request
  Logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.requestLogData.ip,
    userAgent: req.requestLogData.userAgent,
    userId: req.requestLogData.userId || 'anonymous',
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (body: any) {
    const endTime = Date.now();
    const latency = endTime - startTime;

    // Log response
    Logger.info('Request completed', {
      requestId,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      latency: `${latency}ms`,
      userId: req.requestLogData?.userId || 'anonymous',
      ip: req.requestLogData?.ip,
      responseSize: JSON.stringify(body).length,
    });

    // Call original json method
    return originalJson.call(this, body);
  };

  // Override res.send to log response for non-JSON responses
  const originalSend = res.send;
  res.send = function (body: any) {
    const endTime = Date.now();
    const latency = endTime - startTime;

    // Only log if json hasn't been called (to avoid double logging)
    if (res.json === originalJson) {
      Logger.info('Request completed', {
        requestId,
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        latency: `${latency}ms`,
        userId: req.requestLogData?.userId || 'anonymous',
        ip: req.requestLogData?.ip,
        responseSize:
          typeof body === 'string' ? body.length : JSON.stringify(body).length,
      });
    }

    return originalSend.call(this, body);
  };

  next();
};

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const endTime = Date.now();
  const latency = req.requestLogData
    ? endTime - req.requestLogData.startTime
    : 0;

  // Log the error with full context as required by the challenge
  Logger.error('Request error', {
    requestId: req.requestLogData?.requestId || 'unknown',
    method: req.method,
    path: req.originalUrl || req.url,
    statusCode: res.statusCode || 500,
    latency: `${latency}ms`,
    userId: req.requestLogData?.userId || 'anonymous',
    ip: req.requestLogData?.ip || 'unknown',
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });

  // Handle the error response based on type and environment
  if (error instanceof ApiError) {
    // ApiError instances are always returned to user regardless of environment
    ApiError.handle(error, res);
  } else {
    // For runtime and internal server errors, only show details in development
    ApiError.handle(
      new InternalError(isDev ? error.message : 'Internal Server Error'),
      res
    );
  }
};
