import { Schema, model } from 'mongoose';
import { User } from '../types/User';

const DOCUMENT_NAME = 'User';
const COLLECTION_NAME = 'users';

const userSchema = new Schema<User>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    isAdmin: { type: Boolean, required: true, default: false },
    password: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  {
    versionKey: false,
  }
);

userSchema.index({ email: 1, isAdmin: 1 });

userSchema.pre('findOneAndUpdate', function (next) {
  this.setOptions({ runValidators: true });
  next();
});

export const UserModel = model<User>(
  DOCUMENT_NAME,
  userSchema,
  COLLECTION_NAME
);
