import { Schema, model, Types } from 'mongoose';

export interface ITaskAssignment {
  _id?: Types.ObjectId;
  task: Types.ObjectId;
  assignedTo: Types.ObjectId;
  assignedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DOCUMENT_NAME = 'TaskAssignment';
const COLLECTION_NAME = 'task_assignments';

const taskAssignmentSchema = new Schema<ITaskAssignment>({
  task: {
    type: Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
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
taskAssignmentSchema.index({ task: 1, createdAt: -1 });
taskAssignmentSchema.index({ assignedTo: 1, createdAt: -1 });
taskAssignmentSchema.index({ assignedBy: 1, createdAt: -1 });

// Pre-save middleware to update the updatedAt timestamp
taskAssignmentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware to ensure runValidators
taskAssignmentSchema.pre('findOneAndUpdate', function(next) {
  this.setOptions({ runValidators: true });
  next();
});

export const TaskAssignmentModel = model<ITaskAssignment>(DOCUMENT_NAME, taskAssignmentSchema, COLLECTION_NAME);
