import bcrypt from 'bcrypt';
import asyncHandler from '../../core/AsyncHandler';
import validator from '../../helpers/validator';
import schema from './schema';
import adminAuth from '../../middleware/adminAuth';
import { SuccessResponse } from '../../core/ApiResponses';
import { UserRepository } from '../../repositories/UserRepository';
import { BadRequestError } from '../../core/ApiErrors';
import Logger from '../../core/Logger';
import { ProtectedRequest } from '../../types/AppRequests';

const userRepository = new UserRepository();

export const createUsers = [
  adminAuth,
  validator(schema.createUsers),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Admin']
    // #swagger.summary = 'Bulk create users (Admin only)'
    // #swagger.description = 'Create multiple users at once with password hashing. Supports creating admin users.'

    const { users } = req.body;
    const createdUsers = [];
    const failedUsers = [];

    Logger.info(
      `Admin ${req.user?.email} initiated bulk user creation for ${users.length} users`
    );

    for (const userData of users) {
      try {
        // Check if user already exists
        const existingUser = await userRepository.findByEmail(userData.email);
        if (existingUser) {
          failedUsers.push({
            email: userData.email,
            reason: 'User already exists',
          });
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user
        const newUser = await userRepository.create({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: hashedPassword,
          isAdmin: userData.isAdmin || false,
        });

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userResponse } = newUser;
        createdUsers.push(userResponse);

        Logger.info(
          `User created successfully: ${userData.email} (Admin: ${userData.isAdmin})`
        );
      } catch (error) {
        Logger.error(`Failed to create user ${userData.email}:`, error);
        failedUsers.push({
          email: userData.email,
          reason: 'Failed to create user',
        });
      }
    }

    if (createdUsers.length === 0 && failedUsers.length > 0) {
      throw new BadRequestError(
        'No users were created. Check the failed users list.'
      );
    }

    const response = {
      message: `Successfully created ${createdUsers.length} out of ${users.length} users`,
      created: createdUsers,
      failed: failedUsers,
      summary: {
        total: users.length,
        successful: createdUsers.length,
        failed: failedUsers.length,
      },
    };

    Logger.info(
      `Bulk user creation completed. Success: ${createdUsers.length}, Failed: ${failedUsers.length}`
    );

    new SuccessResponse('Bulk user creation completed', response).send(res);
  }),
];
