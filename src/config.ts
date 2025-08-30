export const port = process.env.PORT!;

export const corsUrl = process.env.CORS_URL!;
export const environment = process.env.NODE_ENV!;

export const isDev = environment!;

export const logDirectory = process.env.LOG_DIR!;

const dbName = process.env.DB_NAME!;
const dbUser = process.env.DB_USER!;
const dbPassword = process.env.DB_PASSWORD!;
const dbMinPoolSize = process.env.DB_MIN_POOL_SIZE!;
const dbMaxPoolSize = process.env.DB_MAX_POOL_SIZE!;

const dbUri = isDev
  ? `mongodb://localhost:27017/${dbName}`
  : `mongodb+srv://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@sprintsync.q5lzcgb.mongodb.net/${dbName}?retryWrites=true&w=majority`;

export const db = {
  apikey: process.env.APP_API_KEY!,
  uri: dbUri,
  minPoolSize: dbMinPoolSize,
  maxPoolSize: dbMaxPoolSize,
};

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
