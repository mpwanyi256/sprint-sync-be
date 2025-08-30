import { SuccessResponse } from '../../core/ApiResponses';
import validator, { ValidationSource } from '../../helpers/validator';
import { userService } from '../../services/user';
import { ProtectedRequest } from '../../types/AppRequests';
import schema from './schema';
import asyncHandler from '../../core/AsyncHandler';
import { Router } from 'express';

const router = Router();

// Get all users with pagination and filtering
router.get(
  '/',
  validator(schema.getUsers, ValidationSource.QUERY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Users']
    // Extract query parameters for pagination and filtering
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const isAdmin = req.query.isAdmin as string;

    const filters = {
      search,
      isAdmin: isAdmin ? isAdmin === 'true' : undefined,
    };

    const pagination = { page, limit };

    const result = await userService.getAllUsersWithPagination(
      filters,
      pagination
    );

    const formattedUsers = result.users.map(user => ({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    new SuccessResponse('Users retrieved successfully with pagination', {
      users: formattedUsers,
      pagination: result.pagination,
    }).send(res);
  })
);

// Get user by ID
router.get(
  '/:id',
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Users']
    const { id } = req.params;
    const user = await userService.getUserById(id);

    const formattedUser = {
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    new SuccessResponse('User retrieved successfully', {
      user: formattedUser,
    }).send(res);
  })
);

export default router;
