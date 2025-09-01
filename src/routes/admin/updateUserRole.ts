import asyncHandler from '../../core/AsyncHandler';
import validator, { ValidationSource } from '../../helpers/validator';
import schema from './schema';
import adminAuth from '../../middleware/adminAuth';
import { SuccessResponse } from '../../core/ApiResponses';
import { UserRepository } from '../../repositories/UserRepository';
import { BadRequestError, NotFoundError } from '../../core/ApiErrors';
import Logger from '../../core/Logger';
import { ProtectedRequest } from '../../types/AppRequests';

const userRepository = new UserRepository();

export const updateUserRole = [
  adminAuth,
  validator(schema.updateUserRoleParams, ValidationSource.PARAM),
  validator(schema.updateUserRole),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Admin']
    // #swagger.summary = 'Update user admin status (Admin only)'
    // #swagger.description = 'Assign or remove admin privileges from a user. Admins can promote/demote other users.'

    const { userId } = req.params;
    const { isAdmin } = req.body;

    Logger.info(
      `Admin ${req.user?.email} attempting to update user ${userId} admin status to ${isAdmin}`
    );

    // Prevent admin from demoting themselves
    if (userId === req.user!._id && !isAdmin) {
      throw new BadRequestError('Cannot remove admin privileges from yourself');
    }

    // Find the target user
    const targetUser = await userRepository.findById(userId);
    if (!targetUser) {
      throw new NotFoundError('User not found');
    }

    // Check if the status is already what we want to set
    if (targetUser.isAdmin === isAdmin) {
      throw new BadRequestError(
        `User is already ${isAdmin ? 'an admin' : 'not an admin'}`
      );
    }

    // Update user admin status
    const updatedUser = await userRepository.updateById(userId, { isAdmin });
    if (!updatedUser) {
      throw new NotFoundError('Failed to update user');
    }

    // Remove password from response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userResponse } = updatedUser;

    const action = isAdmin ? 'promoted to admin' : 'demoted from admin';
    Logger.info(
      `User ${targetUser.email} ${action} by admin ${req.user?.email}`
    );

    new SuccessResponse(`User ${action} successfully`, {
      user: userResponse,
      action: isAdmin ? 'promoted' : 'demoted',
      updatedBy: {
        id: req.user!._id,
        email: req.user!.email,
      },
    }).send(res);
  }),
];
