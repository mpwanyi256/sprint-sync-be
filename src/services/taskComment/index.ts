import { ForbiddenError, NotFoundError } from '../../core/ApiErrors';
import Logger from '../../core/Logger';
import { ITaskComment } from '../../models/TaskComment';
import {
  CreateCommentDto,
  PaginatedCommentsResult,
  TaskCommentRepository,
  UpdateCommentDto,
} from '../../repositories/TaskCommentRepository';

export class TaskCommentService {
  private commentRepository: TaskCommentRepository;

  constructor() {
    this.commentRepository = new TaskCommentRepository();
  }

  async createComment(
    taskId: string,
    userId: string,
    message: string
  ): Promise<ITaskComment> {
    Logger.debug(`Creating comment on task ${taskId} by user ${userId}`);

    const commentData: CreateCommentDto = {
      taskId,
      userId,
      message,
    };

    return this.commentRepository.create(commentData);
  }

  async getCommentById(id: string): Promise<ITaskComment> {
    Logger.debug(`Fetching comment: ${id}`);

    const comment = await this.commentRepository.findById(id);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    return comment;
  }

  async getTaskComments(
    taskId: string,
    page?: number,
    limit?: number
  ): Promise<PaginatedCommentsResult> {
    Logger.debug(`Fetching comments for task: ${taskId}`);

    return this.commentRepository.findByTaskId(taskId, { page, limit });
  }

  async updateComment(
    commentId: string,
    userId: string,
    message: string
  ): Promise<ITaskComment> {
    Logger.debug(`Updating comment ${commentId}`);

    // Get the comment to verify ownership
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check if the user owns the comment
    const commentUserId = comment.userId as any;
    if (
      commentUserId._id
        ? commentUserId._id.toString() !== userId
        : commentUserId.toString() !== userId
    ) {
      throw new ForbiddenError('You can only update your own comments');
    }

    const updateData: UpdateCommentDto = { message };
    const updatedComment = await this.commentRepository.updateById(
      commentId,
      updateData
    );

    if (!updatedComment) {
      throw new NotFoundError('Comment not found');
    }

    return updatedComment;
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    Logger.debug(`Deleting comment ${commentId}`);

    // Get the comment to verify ownership
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check if the user owns the comment
    const commentUserId = comment.userId as any;
    if (
      commentUserId._id
        ? commentUserId._id.toString() !== userId
        : commentUserId.toString() !== userId
    ) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    const deleted = await this.commentRepository.deleteById(commentId);
    if (!deleted) {
      throw new NotFoundError('Comment not found');
    }
  }
}

export default new TaskCommentService();
