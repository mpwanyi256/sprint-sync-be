import fs from 'fs';

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

// Helper function to read secret from file or environment variable
const readSecret = (envVar: string, fileEnvVar?: string): string => {
  if (fileEnvVar && process.env[fileEnvVar]) {
    const filePath = process.env[fileEnvVar]!;
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8').trim();
    }
  }
  return process.env[envVar]!;
};

export const jwtSecret = readSecret('JWT_SECRET', 'JWT_SECRET_FILE');

export const openAIKey = readSecret('OPENAI_KEY', 'OPENAI_KEY_FILE')!;

export const expressLimit = process.env.EXPRESS_LIMIT!;

export const parameterLimit = process.env.PARAMETER_LIMIT
  ? Number(process.env.PARAMETER_LIMIT)
  : 50000;

export const appApiKey = readSecret('APP_API_KEY', 'APP_API_KEY_FILE')!;

export const dbMinPoolSize = process.env.DB_MIN_POOL_SIZE!;
export const dbMaxPoolSize = process.env.DB_MAX_POOL_SIZE!;
const prodUser = process.env.DB_USER_PROD!;
const prodPassword = process.env.DB_PASSWORD_PROD!;
const dbUser = process.env.DB_USER!;
const dbPassword = process.env.DB_PASSWORD!;

export const dbUri = {
  development: `mongodb://${encodeURIComponent(dbUser)}:${encodeURIComponent(dbPassword)}@mongodb:27017`,
  production: `mongodb+srv://${encodeURIComponent(prodUser!)}:${encodeURIComponent(prodPassword!)}@sprint-sync.vxahh0d.mongodb.net/sprint-sync?retryWrites=true&w=majority`,
  test: 'mongodb://localhost:27017/test',
};

export const sentryDsn = readSecret('SENTRY_DSN', 'SENTRY_DSN_FILE');
