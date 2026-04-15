export const port = process.env.PORT!;

export const corsUrl = process.env.CORS_URL!;
export const environment = process.env.NODE_ENV!;

export const isDev = environment === 'development';

export const logDirectory = process.env.LOG_DIR!;

export const tokenInfo = {
  issuer: process.env.JWT_ISSUER!,
  audience: process.env.JWT_AUDIENCE!,
  accessTokenValidity: Number(process.env.JWT_ACCESS_TOKEN_VALIDITY)!,
  refreshTokenValidity: Number(process.env.JWT_REFRESH_TOKEN_VALIDITY)!,
};

export const jwtSecret = process.env.JWT_SECRET;

export const openAIKey = process.env.OPENAI_KEY!;

export const expressLimit = process.env.EXPRESS_LIMIT!;

export const parameterLimit = process.env.PARAMETER_LIMIT
  ? Number(process.env.PARAMETER_LIMIT)
  : 50000;

// Database
const dbName = process.env.DB_NAME || 'sprint-sync';
const explicitDbUri =
  process.env.DB_URI ||
  process.env.MONGODB_URI ||
  process.env.MONGO_URL ||
  process.env.DATABASE_URL;
const dbHost = process.env.DB_HOST;
const dbPort = process.env.DB_PORT || '27017';
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbAuthSource = process.env.DB_AUTH_SOURCE;
export const dbMinPoolSize = process.env.DB_MIN_POOL_SIZE!;
export const dbMaxPoolSize = process.env.DB_MAX_POOL_SIZE!;
const prodUser = process.env.DB_USER_PROD!;
const prodPassword = process.env.DB_PASSWORD_PROD!;

const buildMongoUri = (databaseName: string, fallbackHost = 'localhost') => {
  if (explicitDbUri) return explicitDbUri;
  const host = dbHost || fallbackHost;

  if (!host) {
    throw new Error(
      'MongoDB connection is not configured. Set DB_URI, MONGODB_URI, MONGO_URL, DATABASE_URL, or DB_HOST.'
    );
  }

  const useCredentials = Boolean(dbUser && dbPassword);
  const credentials = useCredentials
    ? `${encodeURIComponent(dbUser!)}:${encodeURIComponent(dbPassword!)}@`
    : '';
  const authSource = useCredentials
    ? `?authSource=${encodeURIComponent(dbAuthSource || databaseName)}`
    : '';

  return `mongodb://${credentials}${host}:${dbPort}/${databaseName}${authSource}`;
};

export const dbUri = {
  development: explicitDbUri || buildMongoUri(dbName, 'localhost'),
  production: `mongodb+srv://${encodeURIComponent(prodUser!)}:${encodeURIComponent(prodPassword!)}@sprint-sync.vxahh0d.mongodb.net/sprint-sync?retryWrites=true&w=majority`,
  test: explicitDbUri || process.env.DB_URI || 'mongodb://localhost:27017/test',
};
export const sentryDsn = process.env.SENTRY_DSN!;
