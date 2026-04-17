# Sprint Sync API

A robust, production-ready backend API for the Sprint Sync project built with Node.js, TypeScript, Express, and MongoDB.

## Overview

Sprint Sync API is a comprehensive task and project management backend service that provides:

- **Task Management**: Create, update, and manage tasks with real-time progress tracking
- **User Management**: Admin and user role-based access control
- **Time Logging**: Track time spent on tasks
- **AI Integration**: OpenAI-powered task suggestions and analysis
- **Authentication**: JWT-based secure authentication with refresh tokens
- **API Documentation**: Swagger/OpenAPI documentation included
- **Monitoring**: Sentry integration for error tracking and monitoring

## Quick Start

### Using Docker Compose

```bash
docker-compose up -d
```

The API will be available at `http://localhost:3000`

### Using Docker

```bash
docker run -d \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_USER=sprintsync \
  -e DB_PASSWORD=your_password \
  -e JWT_ISSUER=sprint-sync \
  -e JWT_AUDIENCE=sprint-sync-users \
  samuelmpwanyi/sprint-sync:v1.1
```

## Image Variants

- `v1.1` - Latest stable release
- `latest` - Points to the latest stable release

## Features

✅ **Type-Safe**: Built with TypeScript for better development experience and fewer runtime errors
✅ **Production-Ready**: Multi-stage Docker builds, health checks, and proper error handling
✅ **Scalable**: Connection pooling for database, optimized queries, and efficient logging
✅ **Secure**: JWT authentication, role-based access control, and secret management
✅ **Well-Documented**: Comprehensive Swagger/OpenAPI documentation
✅ **Monitored**: Sentry integration for error tracking
✅ **Tested**: Unit and integration tests with Jest

## Environment Variables

### Required

- `NODE_ENV` - Environment (development, test, production)
- `PORT` - Port to run the API (default: 3000)
- `DB_USER` - MongoDB username
- `DB_PASSWORD` - MongoDB password
- `JWT_ISSUER` - JWT issuer identifier
- `JWT_AUDIENCE` - JWT audience identifier

### Optional

- `DB_HOST` - MongoDB host (default: mongodb)
- `DB_PORT` - MongoDB port (default: 27017)
- `DB_NAME` - Database name (default: sprint-sync)
- `DB_MIN_POOL_SIZE` - Min connection pool size (default: 5)
- `DB_MAX_POOL_SIZE` - Max connection pool size (default: 10)
- `JWT_ACCESS_TOKEN_VALIDITY` - Access token validity in seconds (default: 3600)
- `JWT_REFRESH_TOKEN_VALIDITY` - Refresh token validity in seconds (default: 86400)
- `OPENAI_KEY` - OpenAI API key for AI features
- `SENTRY_DSN` - Sentry error tracking DSN
- `CORS_URL` - CORS allowed origins
- `LOG_DIR` - Log directory (default: logs)

## API Endpoints

### Health Check

- `GET /api/health` - Check API health status

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Tasks

- `GET /tasks` - List all tasks (paginated)
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get task details
- `PATCH /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `POST /tasks/:id/assign` - Assign task to user
- `DELETE /tasks/:id/assign` - Unassign task

### Users

- `GET /users` - List all users
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user profile

### Time Logs

- `GET /time-logs` - List time logs
- `POST /time-logs` - Create time log
- `PATCH /time-logs/:id` - Update time log
- `DELETE /time-logs/:id` - Delete time log

### Admin

- `POST /admin/users` - Bulk create users
- `POST /admin/tasks` - Bulk create tasks
- `PATCH /admin/users/:id/role` - Update user role

## API Documentation

Once the API is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:3000/api-docs
- **OpenAPI JSON**: http://localhost:3000/api-docs-json

## Database

The image includes support for MongoDB. You can either:

1. **Use Docker Compose** (recommended for local development):

   ```bash
   docker-compose up -d
   ```

   MongoDB will be automatically started on port 27017

2. **Connect to external MongoDB**:
   ```bash
   docker run -d \
     -e DB_HOST=your-mongo-host \
     -e DB_USER=your_user \
     -e DB_PASSWORD=your_password \
     samuelmpwanyi/sprint-sync:v1.1
   ```

## Authentication & Keys

### JWT Keys

The image supports JWT key configuration in multiple ways:

1. **From Files** (recommended for production):
   - Place `private.pem` and `public.pem` in the container
   - Keys are automatically discovered at `/app/private.pem` and `/app/public.pem`

2. **Using Volume Mounts**:

   ```bash
   docker run -d \
     -v /path/to/private.pem:/app/private.pem:ro \
     -v /path/to/public.pem:/app/public.pem:ro \
     samuelmpwanyi/sprint-sync:v1.1
   ```

3. **Using Environment Variables** (development):
   ```bash
   docker run -d \
     -e JWT_SECRET=your-secret-key \
     samuelmpwanyi/sprint-sync:v1.1
   ```

## Monitoring & Logging

### Sentry Integration

Enable error tracking with Sentry:

```bash
docker run -d \
  -e SENTRY_DSN=https://your-sentry-dsn \
  samuelmpwanyi/sprint-sync:v1.1
```

### Logs

View container logs:

```bash
docker logs <container-id>
```

Access log files mounted to your host:

```bash
docker run -d \
  -v ./logs:/app/logs \
  samuelmpwanyi/sprint-sync:v1.1
```

## Health Checks

The image includes a health check endpoint. The container will be marked as healthy when:

```bash
curl http://localhost:3000/api/health
```

Returns a 200 status code.

## Performance & Optimization

- **Multi-stage Docker build** reduces image size
- **Production dependencies only** in final image
- **Connection pooling** for optimal database performance
- **Request logging** for debugging
- **Gzip compression** for API responses
- **Rate limiting** capabilities

## Security

- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Non-root user execution
- ✅ Minimal Docker image footprint
- ✅ Secret management support
- ✅ CORS configuration
- ✅ Input validation and sanitization

## Docker Compose Example

```yaml
version: '3.8'

services:
  app:
    image: samuelmpwanyi/sprint-sync:v1.1
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DB_USER=sprintsync
      - DB_PASSWORD=secure_password
      - JWT_ISSUER=sprint-sync
      - JWT_AUDIENCE=sprint-sync-users
    depends_on:
      - mongodb
    networks:
      - sprint-sync

  mongodb:
    image: mongo:7.0
    ports:
      - '27017:27017'
    environment:
      - MONGO_INITDB_ROOT_USERNAME=sprintsync
      - MONGO_INITDB_ROOT_PASSWORD=secure_password
    volumes:
      - mongodb_data:/data/db
    networks:
      - sprint-sync

volumes:
  mongodb_data:

networks:
  sprint-sync:
    driver: bridge
```

## Support & Issues

For bug reports, feature requests, or questions:

- 📧 Email: support@sprintsync.dev
- 🐛 Issues: [GitHub Issues](https://github.com/mpwanyi256/sprint-sync-be)
- 📖 Documentation: [Sprint Sync Docs](https://docs.sprintsync.dev)

## License

MIT License - see LICENSE file in repository

## Version History

### v1.1

- Fixed TypeScript type issues for request parameters
- Moved winston-sentry-log to production dependencies
- Improved JWT key file handling in production
- Enhanced Docker build optimization
- Fixed database connection pooling

### v1.0

- Initial release
- Core task management features
- User authentication and authorization
- Time logging system
- OpenAI integration

## Image Size

- **Compressed**: ~180MB
- **Uncompressed**: ~450MB

## Build Information

- **Base Image**: node:20-bookworm-slim
- **Build Type**: Multi-stage
- **User**: Non-root (nodeuser)
- **Exposed Port**: 3000

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

See [CONTRIBUTING.md](https://github.com/mpwanyi256/sprint-sync-be/blob/master/CONTRIBUTING.md) for details.
