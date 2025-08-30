import { KeystoreModel } from '../models/KeyStore';
import { Keystore } from '../types/AppRequests';
import { User } from '../types/User';
import { DatabaseError } from '../core/ApiErrors';
import { IKeystoreRepository } from './interfaces/IKeystoreRepository';
import Logger from '../core/Logger';

export class KeystoreRepository implements IKeystoreRepository {
  async findByKey(client: User, key: string): Promise<Keystore | null> {
    try {
      const keystore = await KeystoreModel.findOne({
        client: client,
        primaryKey: key,
        status: true,
      })
        .lean()
        .exec();

      if (!keystore) {
        Logger.debug(`Keystore not found for key: ${key}`);
        return null;
      }

      return keystore as Keystore;
    } catch (error: any) {
      Logger.error('Error finding keystore by key:', error);
      throw new DatabaseError('Failed to find keystore by key', error);
    }
  }

  async findforKey(client: User, key: string): Promise<Keystore | null> {
    try {
      const keystore = await KeystoreModel.findOne({
        client: client,
        primaryKey: key,
        status: true,
      })
        .lean()
        .exec();

      if (!keystore) {
        Logger.debug(`Keystore not found for key: ${key}`);
        return null;
      }

      return keystore as Keystore;
    } catch (error: any) {
      Logger.error('Error finding keystore for key:', error);
      throw new DatabaseError('Failed to find keystore for key', error);
    }
  }

  async create(
    client: User,
    primaryKey: string,
    secondaryKey: string
  ): Promise<Keystore> {
    try {
      const now = new Date();
      const keystore = await KeystoreModel.create({
        client,
        primaryKey,
        secondaryKey,
        createdAt: now,
        updatedAt: now,
      });

      Logger.info(`Keystore created for user: ${client.email}`);
      return keystore.toObject() as Keystore;
    } catch (error: any) {
      Logger.error('Error creating keystore:', error);
      throw new DatabaseError('Failed to create keystore', error);
    }
  }

  async remove(id: string): Promise<boolean> {
    try {
      const result = await KeystoreModel.findByIdAndDelete(id).lean().exec();
      const success = !!result;

      if (success) {
        Logger.info(`Keystore removed with id: ${id}`);
      } else {
        Logger.debug(`Keystore not found for removal with id: ${id}`);
      }

      return success;
    } catch (error: any) {
      Logger.error('Error removing keystore:', error);
      throw new DatabaseError('Failed to remove keystore', error);
    }
  }

  async removeAllForClient(client: User): Promise<boolean> {
    try {
      const result = await KeystoreModel.deleteMany({ client: client }).exec();
      const success = result.deletedCount > 0;

      Logger.info(
        `Removed ${result.deletedCount} keystores for user: ${client.email}`
      );
      return success;
    } catch (error: any) {
      Logger.error('Error removing keystores for client:', error);
      throw new DatabaseError('Failed to remove keystores for client', error);
    }
  }

  async removeAllByUserId(userId: string): Promise<boolean> {
    try {
      const result = await KeystoreModel.deleteMany({ client: userId }).exec();
      const success = result.deletedCount > 0;

      Logger.info(
        `Removed ${result.deletedCount} keystores for user ID: ${userId}`
      );
      return success;
    } catch (error: any) {
      Logger.error('Error removing keystores by user ID:', error);
      throw new DatabaseError('Failed to remove keystores by user ID', error);
    }
  }

  async find(
    client: User,
    primaryKey: string,
    secondaryKey: string
  ): Promise<Keystore | null> {
    try {
      const keystore = await KeystoreModel.findOne({
        client: client,
        primaryKey: primaryKey,
        secondaryKey: secondaryKey,
      })
        .lean()
        .exec();

      if (!keystore) {
        Logger.debug(`Keystore not found for client: ${client.email}`);
        return null;
      }

      return keystore as Keystore;
    } catch (error: any) {
      Logger.error('Error finding keystore:', error);
      throw new DatabaseError('Failed to find keystore', error);
    }
  }
}
