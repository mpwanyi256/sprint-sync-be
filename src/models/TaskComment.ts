import { model, Schema, Types } from 'mongoose';

export interface ITaskComment {
  _id?: Types.ObjectId;
  taskId: Types.ObjectId;
  userId: Types.ObjectId;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const DOCUMENT_NAME = 'TaskComment';
const COLLECTION_NAME = 'task_comments';

const taskCommentSchema = new Schema<ITaskComment>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 5000,
    },
    createdAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const TaskCommentModel = model<ITaskComment>(
  DOCUMENT_NAME,
  taskCommentSchema,
  COLLECTION_NAME
);
