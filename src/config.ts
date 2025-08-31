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
const dbName = process.env.DB_NAME!;
const dbUser = process.env.DB_USER!;
const dbPassword = process.env.DB_PASSWORD!;
export const dbMinPoolSize = process.env.DB_MIN_POOL_SIZE!;
export const dbMaxPoolSize = process.env.DB_MAX_POOL_SIZE!;

export const dbUri = {
  development: `mongodb://localhost:27017/${dbName}`,
  production: `mongodb+srv://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@sprintsync.q5lzcgb.mongodb.net/${dbName}?retryWrites=true&w=majority`,
  test: `mongodb://localhost:27017/test`,
};
