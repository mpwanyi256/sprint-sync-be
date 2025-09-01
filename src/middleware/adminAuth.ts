import { Response, NextFunction } from 'express';
import { ForbiddenError } from '../core/ApiErrors';
import { ProtectedRequest } from '../types/AppRequests';

export default (req: ProtectedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required'));
    }

    if (!req.user.isAdmin) {
      return next(new ForbiddenError('Admin privileges required'));
    }

    next();
  } catch (error) {
    next(error);
  }
};
