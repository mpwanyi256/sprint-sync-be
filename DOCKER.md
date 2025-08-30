# Docker Setup for Sprint Sync API

This document explains how to run the Sprint Sync API using Docker.

## Prerequisites

- Docker Engine 20.0+
- Docker Compose 2.0+

## Quick Start

### Development Environment

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd sprint-sync-be
   ```

2. **Create environment file**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start development environment**

   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

4. **Access the application**
   - API: http://localhost:3000
   - API Documentation: http://localhost:3000/api-docs
   - Health Check: http://localhost:3000/health
   - MongoDB Express: http://localhost:8081 (admin/pass)

### Production Environment

1. **Build and start production environment**

   ```bash
   docker-compose up --build -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f app
   ```

## Services

### Application (sprint-sync-api)

- **Port**: 3000
- **Environment**: Configurable via environment variables
- **Health Check**: Built-in health check endpoint
- **Logs**: Structured logging with request tracking

### MongoDB (sprint-sync-db)

- **Port**: 27017
- **Username**: sprintsync
- **Password**: sprintsync123
- **Database**: sprint-sync
- **Data Persistence**: Volume mounted for data persistence

### Mongo Express (sprint-sync-mongo-express)

- **Port**: 8081
- **Username**: admin
- **Password**: pass
- **Purpose**: Web-based MongoDB administration interface

## Environment Variables

| Variable      | Description           | Default                 |
| ------------- | --------------------- | ----------------------- |
| `NODE_ENV`    | Environment mode      | `development`           |
| `PORT`        | Application port      | `3000`                  |
| `DB_NAME`     | MongoDB database name | `sprint-sync`           |
| `DB_USER`     | MongoDB username      | `sprintsync`            |
| `DB_PASSWORD` | MongoDB password      | `sprintsync123`         |
| `JWT_SECRET`  | JWT secret key        | `dev-secret-key`        |
| `OPENAI_KEY`  | OpenAI API key        | _(optional)_            |
| `CORS_URL`    | Allowed CORS origin   | `http://localhost:3001` |

## Data Seeding

### Seed Complete Dataset

```bash
docker-compose exec app yarn seed:data
```

### Seed Users Only

```bash
docker-compose exec app yarn seed:users
```

### Seed Tasks Only

```bash
docker-compose exec app yarn seed:tasks
```

## Useful Commands

### Development

```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up

# Start with rebuild
docker-compose -f docker-compose.dev.yml up --build

# Run in background
docker-compose -f docker-compose.dev.yml up -d

# Stop services
docker-compose -f docker-compose.dev.yml down

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Execute commands in container
docker-compose -f docker-compose.dev.yml exec app bash
```

### Production

```bash
# Start production environment
docker-compose up -d

# Stop and remove everything
docker-compose down

# Remove volumes (data will be lost)
docker-compose down -v

# Update and restart
docker-compose up --build -d
```

### Debugging

```bash
# Check container status
docker-compose ps

# View container logs
docker-compose logs app
docker-compose logs mongodb

# Execute shell in app container
docker-compose exec app sh

# Execute MongoDB shell
docker-compose exec mongodb mongosh -u sprintsync -p sprintsync123
```

## Network Configuration

The services communicate through a custom Docker network:

- **Network Name**: `sprint-sync-network`
- **Driver**: bridge
- **Services**: app, mongodb, mongo-express

## Data Persistence

- **MongoDB Data**: Stored in Docker volume `mongodb_data`
- **Application Logs**: Mounted to `./logs` directory
- **Development**: Source code mounted for hot reloading

## Health Checks

Both development and production containers include health checks:

- **Endpoint**: `/health`
- **Interval**: 30 seconds
- **Timeout**: 3 seconds
- **Retries**: 3

## Security Considerations

### Production

- Change default passwords in environment variables
- Use strong JWT secrets
- Implement proper CORS configuration
- Use HTTPS in production
- Limit MongoDB access to application network

### Development

- Default credentials are for development only
- MongoDB is exposed on localhost for debugging
- Mongo Express is available for database inspection

## Troubleshooting

### Common Issues

1. **Port conflicts**

   ```bash
   # Check what's using the port
   lsof -i :3000
   # Change port in docker-compose.yml
   ```

2. **Permission issues**

   ```bash
   # Fix ownership
   sudo chown -R $USER:$USER .
   ```

3. **Database connection issues**

   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   # Verify network connectivity
   docker-compose exec app ping mongodb
   ```

4. **Memory issues**
   ```bash
   # Check Docker resources
   docker system df
   # Clean up unused resources
   docker system prune
   ```

### Logs

- **Application logs**: Structured JSON logs with request tracking
- **Database logs**: MongoDB connection and query logs
- **Container logs**: Docker container stdout/stderr

### Monitoring

Access logs and metrics:

```bash
# Follow application logs
docker-compose logs -f app

# Monitor resource usage
docker stats

# Check health status
curl http://localhost:3000/health
```

## API Documentation

Once the containers are running, access the interactive API documentation at:
**http://localhost:3000/api-docs**

This provides:

- Complete API endpoint documentation
- Request/response examples
- Interactive testing interface
- Authentication examples
