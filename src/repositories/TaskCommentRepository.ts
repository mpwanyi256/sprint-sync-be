import { Types } from 'mongoose';
import { DatabaseError } from '../core/ApiErrors';
import Logger from '../core/Logger';
import { ITaskComment, TaskCommentModel } from '../models/TaskComment';

export interface CreateCommentDto {
  taskId: Types.ObjectId | string;
  userId: Types.ObjectId | string;
  message: string;
}

export interface UpdateCommentDto {
  message: string;
}

export interface ITaskCommentRepository {
  create(commentData: CreateCommentDto): Promise<ITaskComment>;
  findById(id: string): Promise<ITaskComment | null>;
  findByTaskId(
    taskId: string,
    options?: PaginationOptions
  ): Promise<PaginatedCommentsResult>;
  updateById(
    id: string,
    updateData: UpdateCommentDto
  ): Promise<ITaskComment | null>;
  deleteById(id: string): Promise<boolean>;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedCommentsResult {
  comments: ITaskComment[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class TaskCommentRepository implements ITaskCommentRepository {
  async create(commentData: CreateCommentDto): Promise<ITaskComment> {
    try {
      const comment = await TaskCommentModel.create({
        taskId: new Types.ObjectId(commentData.taskId as string),
        userId: new Types.ObjectId(commentData.userId as string),
        message: commentData.message,
      });

      Logger.info(
        `Comment created on task ${commentData.taskId} by user ${commentData.userId}`
      );
      return comment.toObject() as ITaskComment;
    } catch (error: any) {
      Logger.error('Error creating comment:', error);
      throw new DatabaseError('Failed to create comment', error);
    }
  }

  async findById(id: string): Promise<ITaskComment | null> {
    try {
      const comment = await TaskCommentModel.findById(id)
        .populate('userId', 'firstName lastName email')
        .populate('taskId', 'title')
        .lean()
        .exec();

      if (!comment) {
        Logger.debug(`Comment not found for id: ${id}`);
        return null;
      }

      Logger.debug(`Comment found: ${id}`);
      return comment as ITaskComment;
    } catch (error: any) {
      Logger.error('Error finding comment by id:', error);
      throw new DatabaseError('Failed to find comment', error);
    }
  }

  async findByTaskId(
    taskId: string,
    options?: PaginationOptions
  ): Promise<PaginatedCommentsResult> {
    try {
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const skip = (page - 1) * limit;

      const [comments, totalCount] = await Promise.all([
        TaskCommentModel.find({ taskId: new Types.ObjectId(taskId as string) })
          .populate('userId', 'firstName lastName email _id')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean()
          .exec(),
        TaskCommentModel.countDocuments({
          taskId: new Types.ObjectId(taskId as string),
        }),
      ]);

      const totalPages = Math.ceil(totalCount / limit);

      Logger.debug(`Found ${comments.length} comments for task: ${taskId}`);
      return {
        comments: comments as ITaskComment[],
        totalCount,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      Logger.error('Error finding comments by task id:', error);
      throw new DatabaseError('Failed to find comments', error);
    }
  }

  async updateById(
    id: string,
    updateData: UpdateCommentDto
  ): Promise<ITaskComment | null> {
    try {
      const comment = await TaskCommentModel.findByIdAndUpdate(
        id,
        {
          message: updateData.message,
          updatedAt: new Date(),
        },
        { new: true }
      )
        .populate('userId', 'firstName lastName email')
        .lean()
        .exec();

      if (!comment) {
        Logger.debug(`Comment not found for update: ${id}`);
        return null;
      }

      Logger.info(`Comment updated: ${id}`);
      return comment as ITaskComment;
    } catch (error: any) {
      Logger.error('Error updating comment:', error);
      throw new DatabaseError('Failed to update comment', error);
    }
  }

  async deleteById(id: string): Promise<boolean> {
    try {
      const result = await TaskCommentModel.findByIdAndDelete(id).exec();

      if (!result) {
        Logger.debug(`Comment not found for deletion: ${id}`);
        return false;
      }

      Logger.info(`Comment deleted: ${id}`);
      return true;
    } catch (error: any) {
      Logger.error('Error deleting comment:', error);
      throw new DatabaseError('Failed to delete comment', error);
    }
  }
}
