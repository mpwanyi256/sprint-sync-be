import { Schema, model, Types } from 'mongoose';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface ITask {
  _id?: Types.ObjectId;
  title: string;
  description: string;
  createdBy: Types.ObjectId;
  totalMinutes: number;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

const DOCUMENT_NAME = 'Task';
const COLLECTION_NAME = 'tasks';

const taskSchema = new Schema<ITask>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  totalMinutes: {
    type: Number,
    required: true,
    min: 1,
  },
  status: {
    type: String,
    required: true,
    enum: ['TODO', 'IN_PROGRESS', 'DONE'],
    default: 'TODO'
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
taskSchema.index({ createdBy: 1, createdAt: -1 });
taskSchema.index({ title: 'text', description: 'text' });

// Pre-save middleware to update the updatedAt timestamp
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware to ensure runValidators
taskSchema.pre('findOneAndUpdate', function(next) {
  this.setOptions({ runValidators: true });
  next();
});

export const TaskModel = model<ITask>(DOCUMENT_NAME, taskSchema, COLLECTION_NAME);
