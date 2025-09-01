import { Request, Response, NextFunction } from 'express';
import Logger from '../core/Logger';
import { ProtectedRequest } from '../types/AppRequests';
import { ApiError, InternalError } from '../core/ApiErrors';
import { isDev } from '../config';
import { getAccessToken, validateTokenData } from '../helpers/authUtils';
import JWT from '../core/JWT';
import { userService } from '../services/user';
import { KeystoreRepository } from '../repositories/KeystoreRepository';
import asyncHandler from '../core/AsyncHandler';
import { User } from '../types/User';
import { Keystore } from '../types/AppRequests';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RequestLogData } from '../types/express';

// Generate a simple request ID
const generateRequestId = (): string => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

// Optional user resolution from authorization header
const resolveUserFromToken = async (
  req: Request
): Promise<{ user?: User; userId?: string; keystore?: Keystore }> => {
  try {
    // Check if Authorization header exists
    const authorization = req.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return { userId: 'anonymous' };
    }

    // Extract and validate access token
    const accessToken = getAccessToken(authorization);
    const payload = await JWT.validate(accessToken);
    validateTokenData(payload);

    // Find user by ID from token subject
    const user = await userService.findUserById(payload.sub);
    if (!user) {
      Logger.warn(`User not found for token subject: ${payload.sub}`, {
        requestAuth: true,
      });
      return { userId: 'invalid-token' };
    }

    // Validate keystore to ensure token is still valid
    const keystoreRepo = new KeystoreRepository();
    const keystore = await keystoreRepo.findforKey(user, payload.prm);
    if (!keystore) {
      Logger.warn(`Invalid keystore for user: ${user.email}`, {
        requestAuth: true,
      });
      return { userId: 'invalid-keystore' };
    }

    return {
      user,
      userId: user._id.toString(),
      keystore,
    };
  } catch (error) {
    // Silent failure for optional token resolution
    Logger.debug('Token resolution failed (optional)', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return { userId: 'token-error' };
  }
};

// Request type extension is now in src/types/express.d.ts

const requestLoggerAsync = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const startTime = Date.now();
  const requestId = generateRequestId();

  // Synchronous user resolution for proper logging
  const { user, userId, keystore } = await resolveUserFromToken(req);

  // Set resolved user data on request for authentication middleware to reuse
  if (user && keystore) {
    (req as ProtectedRequest).user = user;
    (req as ProtectedRequest).keystore = keystore;
    (req as ProtectedRequest).accessToken =
      req.headers.authorization?.split(' ')[1] || '';
    // Set a flag to indicate user was resolved by requestLogger
    req.userResolvedByLogger = true;
  }

  // Store request data for use in response logging
  req.requestLogData = {
    method: req.method,
    path: req.originalUrl || req.url,
    userId: userId || 'anonymous',
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress || 'unknown',
    startTime,
    requestId,
  };

  // Log incoming request with actual user ID
  Logger.info('Incoming request', {
    requestId,
    method: req.method,
    path: req.originalUrl || req.url,
    ip: req.requestLogData.ip,
    userAgent: req.requestLogData.userAgent,
    userId: req.requestLogData.userId,
    userResolved: !!user,
  });

  // Override res.json to log response
  const originalJson = res.json;
  res.json = function (body: unknown) {
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
  res.send = function (body: unknown) {
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

// Export wrapped with asyncHandler for proper error handling
export const requestLogger = asyncHandler(requestLoggerAsync);

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
