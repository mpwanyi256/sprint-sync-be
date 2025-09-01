import express from 'express';
import {
  AuthFailureError,
  AccessTokenError,
  TokenExpiredError,
  BadTokenError,
} from '../core/ApiErrors';
import asyncHandler from '../core/AsyncHandler';
import { ProtectedRequest } from '../types/AppRequests';
import { getAccessToken, validateTokenData } from '../helpers/authUtils';
import JWT from '../core/JWT';
import { userService } from '../services/user';
import { KeystoreRepository } from '../repositories/KeystoreRepository';
import Logger from '../core/Logger';

const router = express.Router();

export default router.use(
  asyncHandler(async (req: ProtectedRequest, res, next) => {
    try {
      // Check if user was already resolved by requestLogger middleware
      if (req.userResolvedByLogger && req.user && req.keystore) {
        Logger.debug('Using user and keystore resolved by requestLogger', {
          userId: req.user._id,
          email: req.user.email,
        });
        return next();
      }

      // Fallback to original authentication logic if requestLogger didn't resolve user
      Logger.debug(
        'RequestLogger did not resolve user, performing full authentication'
      );

      // Extract access token from Authorization header
      const accessToken = getAccessToken(req.headers.authorization);
      req.accessToken = accessToken;

      // Validate JWT token
      const payload = await JWT.validate(accessToken);

      // Validate token data (issuer, audience, subject, etc.)
      validateTokenData(payload);

      // Find user by ID from token subject
      const user = await userService.findUserById(payload.sub);
      if (!user) {
        Logger.warn(`User not found for token subject: ${payload.sub}`);
        throw new AuthFailureError('User not registered');
      }

      req.user = user;

      // Validate keystore to ensure token is still valid
      const keystoreRepo = new KeystoreRepository();
      const keystore = await keystoreRepo.findforKey(req.user, payload.prm);
      if (!keystore) {
        Logger.warn(`Invalid keystore for user: ${user.email}`);
        throw new AuthFailureError('Invalid access token');
      }

      req.keystore = keystore;

      return next();
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        Logger.warn('Token expired.');
        throw new AccessTokenError(error.message);
      }

      if (error instanceof BadTokenError) {
        Logger.warn('Invalid token');
        throw new AuthFailureError('Invalid access token');
      }

      if (error instanceof AuthFailureError) {
        Logger.warn(`Authentication failed: ${error.message}`);
        throw error;
      }

      Logger.error('Unexpected authentication error:', error);
      throw new AuthFailureError('Authentication failed');
    }
  })
);
