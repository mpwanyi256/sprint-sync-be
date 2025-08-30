import express from 'express';
import ApiKeyService from '../../services/apiKey';
import { ForbiddenError } from '../../core/ApiErrors';
import { PublicRequest } from '../../types/AppRequests';
import schema from '../schema';
import validator, { ValidationSource } from '../../helpers/validator';
import asyncHandler from '../../core/AsyncHandler';
import { Header } from '../../core/utils';

const router = express.Router();

export default router.use(
  validator(schema.apiKey, ValidationSource.HEADER),
  asyncHandler(async (req: PublicRequest, res, next) => {
    const key = req.headers[Header.API_KEY]?.toString();

    if (!key) throw new ForbiddenError();

    const apiKey = await ApiKeyService.findByKey(key);
    if (!apiKey) throw new ForbiddenError();

    req.apiKey = apiKey;
    return next();
  })
);
