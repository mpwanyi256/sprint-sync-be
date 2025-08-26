export const port = process.env.PORT || 3000;

export const corsUrl = process.env.CORS_URL || 'http://localhost:3000';
export const environment = process.env.NODE_ENV || 'development';

export const isDev = environment === 'development';

export const logDirectory = process.env.LOG_DIR || 'logs';

const dbName = process.env.DB_NAME || 'sprint-sync';
const dbUser = process.env.DB_USER || '';
const dbPassword = process.env.DB_PASSWORD || '';
const dbMinPoolSize = process.env.DB_MIN_POOL_SIZE || '5';
const dbMaxPoolSize = process.env.DB_MAX_POOL_SIZE || '10';

const dbUri = isDev 
  ? `mongodb://localhost:27017/${dbName}` 
  : `mongodb+srv://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@sprintsync.q5lzcgb.mongodb.net/${dbName}?retryWrites=true&w=majority`;

export const db = {
  uri: dbUri,
  minPoolSize: dbMinPoolSize,
  maxPoolSize: dbMaxPoolSize,
};
