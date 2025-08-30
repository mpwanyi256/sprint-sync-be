import { Response, NextFunction } from 'express';
import { ForbiddenError } from '../core/ApiErrors';
import { PublicRequest } from '../types/AppRequests';

export default (permission: string) =>
  (req: PublicRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.apiKey?.permissions)
        return next(new ForbiddenError('Permission Denied'));

      const exists = req.apiKey.permissions.find(entry => entry === permission);
      if (!exists) return next(new ForbiddenError('Permission Denied'));

      next();
    } catch (error) {
      next(error);
    }
  };
