import { Router } from 'express';
import bcrypt from 'bcrypt';
import schema from './schema';
import validator from '../../helpers/validator';
import asyncHandler from '../../core/AsyncHandler';
import { userService } from '../../services/user';
import { TokenFactory } from '../../core/TokenFactory';
import { createTokens } from '../../helpers/authUtils';
import { SuccessResponse } from '../../core/ApiResponses';
import { getUserData } from './utils';
import { KeystoreRepository } from '../../repositories/KeystoreRepository';
import { ProtectedRequest } from '../../types/AppRequests';
import authentication from '../../middleware/authentication';

const router = Router();
const keystoreRepository = new KeystoreRepository();

router.post(
  '/signup',
  validator(schema.signup),
  asyncHandler(async (req, res) => {
    // #swagger.tags = ['Authentication']
    const { firstName, lastName, email, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);
    const { accessKey, refreshKey } = TokenFactory.createTokenPair();

    const { user, keystore } = await userService.createUserWithKeystore(
      { firstName, lastName, email, password: passwordHash },
      accessKey,
      refreshKey
    );

    const tokens = await createTokens(
      user,
      keystore.primaryKey,
      keystore.secondaryKey
    );

    new SuccessResponse('Signup Successful', {
      user: getUserData(user),
      tokens,
    }).send(res);
  })
);

router.post(
  '/signin',
  validator(schema.login),
  asyncHandler(async (req, res) => {
    // #swagger.tags = ['Authentication']
    const { email, password } = req.body;

    const user = await userService.authenticateUser(email, password);
    const { accessKey, refreshKey } = TokenFactory.createTokenPair();

    await keystoreRepository.create(user, accessKey, refreshKey);
    const tokens = await createTokens(user, accessKey, refreshKey);
    const userData = getUserData(user);

    new SuccessResponse('Login Success', {
      user: userData,
      tokens,
    }).send(res);
  })
);

router.use(authentication);

router.get(
  '/me',
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Authentication']
    const userData = getUserData(req.user);
    new SuccessResponse('User details', userData).send(res);
  })
);

router.post(
  '/logout',
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Authentication']
    const userId = req.user._id.toString();

    // Remove all keystores for the user to invalidate all tokens
    await keystoreRepository.removeAllByUserId(userId);

    new SuccessResponse('Logout successful', {
      message: 'All sessions have been terminated',
    }).send(res);
  })
);

export default router;
