# Development Setup

## Quick Start

1. **Install dependencies**
   ```bash
   yarn install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server**
   ```bash
   yarn dev
   ```

## Development Scripts

### `yarn dev` (Recommended for development)
- **Direct ts-node execution** (no compilation needed)
- **Fast startup** and runtime
- **Good for active development**

### `yarn dev:watch` (Recommended for development with auto-restart)
- **Nodemon monitoring** of source files
- **Auto-restart** when TypeScript/JavaScript files change
- **No infinite rebuild loops**
- **Efficient file watching**

### `yarn build:watch`
- **TypeScript compilation** only
- **Watches for changes** and recompiles
- **Useful for type checking** during development

### `yarn server:watch`
- **Nodemon monitoring** of build directory
- **Restarts server** when compiled files change
- **Useful for production-like testing**

## Environment Variables

Create a `.env` file based on `env.example`:

```bash
# Required for JWT authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database configuration
DB_NAME=sprint-sync
DB_MIN_POOL_SIZE=2
DB_MAX_POOL_SIZE=5

# Server configuration
PORT=8020
NODE_ENV=development
```

## JWT Authentication

### Development Mode
- Uses **HMAC (HS256)** for token signing
- **Symmetric key** from `JWT_SECRET` environment variable
- **No RSA keys required**

### Production Mode
- Uses **RSA (RS256)** for token signing
- **Asymmetric keys** from `keys/` directory
- **More secure** but requires key management

## Database

### Local Development
- **MongoDB** running on `localhost:27017`
- **Database name**: `sprint-sync`
- **No authentication** required

### Production
- **MongoDB Atlas** or other cloud provider
- **Environment variables** for connection
- **Authentication** required

## Troubleshooting

### "authorization contains an invalid value"
- Check if `JWT_SECRET` is set in `.env`
- Verify Authorization header format: `Bearer <token>`
- Ensure token is valid and not expired

### "Database connection failed"
- Verify MongoDB is running locally
- Check database connection string
- Ensure network connectivity

### "Token validation failed"
- Check JWT secret configuration
- Verify token format and expiration
- Check keystore validation

## File Watching

The development setup automatically:
- **Compiles TypeScript** on file changes
- **Restarts server** when build files change
- **Provides hot reload** experience

## Logging

Development mode includes:
- **Debug logging** for authentication flow
- **Request/response logging**
- **Error details** for debugging

Set `LOG_LEVEL=debug` in `.env` for verbose logging.
