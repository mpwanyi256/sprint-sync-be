import { Schema, model, Types } from 'mongoose';

export interface ITaskProgress {
  _id?: Types.ObjectId;
  task: Types.ObjectId;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  user: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DOCUMENT_NAME = 'TaskProgress';
const COLLECTION_NAME = 'task_progress';

const taskProgressSchema = new Schema<ITaskProgress>({
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  status: {
    type: String,
    enum: ['TODO', 'IN_PROGRESS', 'DONE'],
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    required: true,
    default: Date.now
  }
}, {
  versionKey: false,
  timestamps: true
});

// Indexes for better query performance
taskProgressSchema.index({ task: 1, createdAt: -1 });
taskProgressSchema.index({ user: 1, createdAt: -1 });
taskProgressSchema.index({ status: 1, createdAt: -1 });
taskProgressSchema.index({ task: 1, status: 1 });

// Pre-save middleware to update the updatedAt timestamp
taskProgressSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware to ensure runValidators
taskProgressSchema.pre('findOneAndUpdate', function(next) {
  this.setOptions({ runValidators: true });
  next();
});

export const TaskProgressModel = model<ITaskProgress>(DOCUMENT_NAME, taskProgressSchema, COLLECTION_NAME);
