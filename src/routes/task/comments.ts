import { Router } from 'express';
import { SuccessResponse } from '../../core/ApiResponses';
import asyncHandler from '../../core/AsyncHandler';
import validator, { ValidationSource } from '../../helpers/validator';
import taskCommentService from '../../services/taskComment';
import { ProtectedRequest } from '../../types/AppRequests';
import schema from './schema';

const router = Router({ mergeParams: true });

// Helper function to format comment response
const formatCommentResponse = (comment: any) => {
  const userId = comment.userId;
  const userObj =
    typeof userId === 'object' && userId !== null
      ? {
          id: userId._id?.toString() || userId.id,
          firstName: userId.firstName || '',
          lastName: userId.lastName || '',
          email: userId.email || '',
        }
      : {
          id: userId,
          firstName: '',
          lastName: '',
          email: '',
        };

  return {
    id: comment._id?.toString() || comment.id,
    taskId: comment.taskId?.toString() || comment.taskId,
    user: userObj,
    message: comment.message,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
};

// Create comment on a task
router.post(
  '/',
  validator(schema.commentParams, ValidationSource.PARAM),
  validator(schema.createComment, ValidationSource.BODY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Task Comments']
    const { taskId } = req.params as { taskId: string };
    const { message } = req.body;
    const userId = req.user._id.toString();

    const comment = await taskCommentService.createComment(
      taskId,
      userId,
      message
    );

    const formattedComment = {
      id: comment._id?.toString(),
      taskId: comment.taskId?.toString() || comment.taskId,
      user: {
        id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
      },
      message: comment.message,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };

    new SuccessResponse('Comment created successfully', formattedComment).send(
      res
    );
  })
);

// Get all comments for a task
router.get(
  '/',
  validator(schema.commentParams, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Task Comments']
    const { taskId } = req.params as { taskId: string };
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const result = await taskCommentService.getTaskComments(
      taskId,
      page,
      limit
    );

    const formattedComments = result.comments.map(comment =>
      formatCommentResponse(comment)
    );

    new SuccessResponse('Comments fetched successfully', {
      comments: formattedComments,
      pagination: {
        page: result.page,
        limit: result.limit,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
      },
    }).send(res);
  })
);

// Get a specific comment
router.get(
  '/:commentId',
  validator(schema.commentIdParams, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Task Comments']
    const { commentId } = req.params as { commentId: string };

    const comment = await taskCommentService.getCommentById(commentId);
    const formattedComment = formatCommentResponse(comment);

    new SuccessResponse('Comment fetched successfully', formattedComment).send(
      res
    );
  })
);

// Update a comment (only by owner)
router.patch(
  '/:commentId',
  validator(schema.commentIdParams, ValidationSource.PARAM),
  validator(schema.updateComment, ValidationSource.BODY),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Task Comments']
    const { commentId } = req.params as { commentId: string };
    const { message } = req.body;
    const userId = req.user._id.toString();

    const comment = await taskCommentService.updateComment(
      commentId,
      userId,
      message
    );

    const formattedComment = formatCommentResponse(comment);

    new SuccessResponse('Comment updated successfully', formattedComment).send(
      res
    );
  })
);

// Delete a comment (only by owner)
router.delete(
  '/:commentId',
  validator(schema.commentIdParams, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    // #swagger.tags = ['Task Comments']
    const { commentId } = req.params as { commentId: string };
    const userId = req.user._id.toString();

    await taskCommentService.deleteComment(commentId, userId);

    new SuccessResponse('Comment deleted successfully', {
      message: 'Comment has been deleted',
    }).send(res);
  })
);

export default router;
