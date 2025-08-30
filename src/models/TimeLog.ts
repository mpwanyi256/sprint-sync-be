import { Schema, model, Types } from 'mongoose';

export interface ITimeLog {
  _id?: Types.ObjectId;
  task: Types.ObjectId;
  user: Types.ObjectId;
  start: Date;
  end?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DOCUMENT_NAME = 'TimeLog';
const COLLECTION_NAME = 'timelogs';

const timeLogSchema = new Schema<ITimeLog>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    start: {
      type: Date,
      required: true,
      default: Date.now,
    },
    end: {
      type: Date,
      required: false,
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
    versionKey: false,
    timestamps: true,
  }
);

// Indexes for better query performance
timeLogSchema.index({ task: 1, user: 1, createdAt: -1 });
timeLogSchema.index({ user: 1, start: -1 });
timeLogSchema.index({ task: 1, start: -1 });

// Pre-save middleware to update the updatedAt timestamp
timeLogSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

// Pre-update middleware to ensure runValidators
timeLogSchema.pre('findOneAndUpdate', function (next) {
  this.setOptions({ runValidators: true });
  next();
});

export const TimeLogModel = model<ITimeLog>(
  DOCUMENT_NAME,
  timeLogSchema,
  COLLECTION_NAME
);
