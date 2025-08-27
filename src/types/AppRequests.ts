import { Types } from 'mongoose';
import { Request } from 'express';
import { User } from './User';

export interface PublicRequest extends Request {
    apiKey: ApiKey;
}

export enum Permission {
    GENERAL = 'GENERAL',
    ADMIN = 'ADMIN',
}
  
export default interface ApiKey {
    _id: Types.ObjectId;
    key: string;
    version: number;
    permissions: Permission[];
    comments: string[];
    status?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface Tokens {
    accessToken: string;
    refreshToken: string;
}

export interface Keystore {
    _id: Types.ObjectId;
    client: User;
    primaryKey: string;
    secondaryKey: string;
    status?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}