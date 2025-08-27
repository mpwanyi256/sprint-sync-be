import mongoose from 'mongoose';
import { db } from '../config';
import Logger from '../core/Logger';
import { initializeDBData } from './initializeData';

const options = {
    autoIndex: true,
    minPoolSize: Number(db.minPoolSize),
    maxPoolSize: Number(db.maxPoolSize),
    connectTimeoutMS: 60000,
    socketTimeoutMS: 45000,
};

let isConnected = false;

function setRunValidators() {
    this.setOptions({ runValidators: true });
}

mongoose.set('strictQuery', true);

mongoose.plugin((schema: any) => {
    schema.pre('findOneAndUpdate', setRunValidators);
    schema.pre('updateMany', setRunValidators);
    schema.pre('updateOne', setRunValidators);
    schema.pre('update', setRunValidators);
});

export async function connectToDatabase(): Promise<void> {
    if (isConnected) {
        Logger.debug('Database already connected');
        return;
    }

    try {
        if (!db.uri) {
            throw new Error('Database URI is not configured');
        }

        Logger.debug(`Database config - URI: ${db.uri}, MinPool: ${db.minPoolSize}, MaxPool: ${db.maxPoolSize}`);
        Logger.debug(`Connecting to MongoDB via ${db.uri}`);
        
        // Add connection timeout and better error handling
        const connectionPromise = mongoose.connect(db.uri, options);
        
        // Set a timeout for the connection
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Connection timeout after 30 seconds')), 30000);
        });
        
        await Promise.race([connectionPromise, timeoutPromise]);
        
        isConnected = true;
        await initializeDBData(mongoose);
        Logger.info('Mongoose connection established successfully');
        
        mongoose.connection.on('connected', () => {
            Logger.debug('Successfully connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            Logger.error('Mongoose connection error: ' + err);
            isConnected = false;
        });

        mongoose.connection.on('disconnected', () => {
            Logger.warn('Mongoose connection disconnected');
            isConnected = false;
        });

        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                Logger.info('Mongoose connection closed through app termination');
                process.exit(0);
            } catch (err) {
                Logger.error('Error closing database connection:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        Logger.error('Failed to connect to MongoDB:', error);
        Logger.error('Database URI:', db.uri);
        Logger.error('Connection options:', options);
        
        // Provide helpful error messages for common issues
        if (error instanceof Error) {
            if (error.message.includes('ECONNREFUSED')) {
                Logger.error('Connection refused. Make sure MongoDB is running on localhost:27017');
            } else if (error.message.includes('ENOTFOUND')) {
                Logger.error('Host not found. Check your database URI and network connection');
            } else if (error.message.includes('timeout')) {
                Logger.error('Connection timeout. Check if MongoDB is accessible and not overloaded');
            }
        }
        
        isConnected = false;
        throw error;
    }
}

export function getConnectionStatus(): boolean {
    return isConnected && mongoose.connection.readyState === 1;
}

export const connection = mongoose.connection;
