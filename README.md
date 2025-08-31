# Sprint Sync Backend

A production-ready Sprint management backend API built with Node.js, Express, TypeScript, and MongoDB. This project provides comprehensive task management capabilities with AI-powered task suggestions, user authentication, and real-time collaboration features.

- [API Production URL](https://sprint-sync-be.onrender.com/api)
- [API Documentation](https://sprint-sync-be.onrender.com/api-docs)
- [![CI/CD Pipeline](https://github.com/mpwanyi256/sprint-sync-be/workflows/CI/badge.svg)]

## 🚀 Features

### Core Features

- **User Authentication**: JWT-based authentication with secure token management
- **Task Management**: Complete CRUD operations for tasks with status tracking
- **Task Assignment**: Assign tasks to team members with history tracking
- **AI Integration**: OpenAI-powered task description generation from titles
- **User Management**: User profiles, roles, and administrative functions
- **Real-time Health Monitoring**: Comprehensive health check endpoints

### Technical Highlights

- **Production Ready**: Docker containerization with optimized builds
- **Auto-generated Documentation**: Swagger/OpenAPI docs generated automatically
- **Structured Logging**: JSON-formatted logs with request correlation
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Quality Assurance**: Pre-commit hooks, linting, and comprehensive testing
- **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
- **Security**: API key authentication, input validation, and error handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v20.x or v22.x)
- **npm** or **yarn** package manager
- **MongoDB** (v7.0 or later)
- **Docker & Docker Compose** (for containerized setup)
- **Git** (for version control)

### Optional Tools

- **MongoDB Compass** (GUI for MongoDB)
- **Postman** or **Insomnia** (API testing)
- **VS Code** (recommended editor with extensions)

## 🛠️ Installation & Setup

### Option 1: Docker Setup (Recommended)

This is the fastest way to get the project running with all dependencies.

#### 1. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/your-username/sprint-sync-be.git
cd sprint-sync-be

# Switch to required Node.js version (if using nvm)
nvm use

# Install dependencies
yarn install
```

#### 2. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit the environment variables
nano .env  # or use your preferred editor
```

#### 3. Generate RSA Keys

You need RSA keys for JWT token signing. Choose one method:

**Option A: Use Online Tool**

1. Visit [RSA Key Generator](https://cryptotools.net/rsagen) or [RSA Key Pair Generator](https://www.allkeysgenerator.com/Random/RSA-key-Pair-Generator.aspx)
2. Generate 2048-bit RSA keys
3. Save private key as `keys/private.pem`
4. Save public key as `keys/public.pem`

**Option B: Use OpenSSL (if available)**

```bash
# Generate private key
openssl genrsa -out keys/private.pem 2048

# Generate public key
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
```

**Option C: Copy Example Keys (Development Only)**

```bash
# For development/testing only - NOT for production
cp keys/private.pem.example keys/private.pem
cp keys/public.pem.example keys/public.pem
```

#### 4. Start with Docker Compose

```bash
# Start all services (app + database)
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

#### 5. Seed the Database

```bash
# Seed both users and tasks
yarn seed:data

# Or seed individually
yarn seed:users
yarn seed:tasks
```

#### 6. Verify Setup

- API: http://localhost:3000/api/health
- Documentation: http://localhost:3000/api-docs
- MongoDB: localhost:27017 (if running locally)

### Option 2: Manual Setup

For local development without Docker.

#### 1. Setup MongoDB

**Option A: Local Installation**

```bash
# macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0

# Ubuntu/Debian
sudo apt-get install mongodb-org
sudo systemctl start mongod

# Windows
# Download from: https://www.mongodb.com/try/download/community
```

**Option B: MongoDB Atlas (Cloud)**

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create cluster and get connection string
3. Update `DB_URI` in `.env` file

#### 2. Clone and Install

```bash
git clone https://github.com/your-username/sprint-sync-be.git
cd sprint-sync-be

# Switch to required Node.js version (if using nvm)
nvm use

yarn install
```

#### 3. Environment Configuration

```bash
cp env.example .env
```

Update `.env` with your settings:

```env
# Database
DB_URI=mongodb://localhost:27017/sprint-sync
DB_NAME=sprint-sync

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_ISSUER=sprint-sync-api
JWT_AUDIENCE=sprint-sync-app
JWT_ACCESS_TOKEN_VALIDITY=3600
JWT_REFRESH_TOKEN_VALIDITY=86400

# OpenAI (for AI features)
OPENAI_KEY=your-openai-api-key

# Server
PORT=3000
NODE_ENV=development

# CORS
CORS_URL=*
```

#### 4. Generate RSA Keys

Follow the same RSA key generation steps from Docker setup above.

#### 5. Start Development Server

```bash
# Generate documentation and start server
yarn dev

# Or with file watching
yarn dev:watch
```

#### 6. Database Seeding

```bash
# Seed the database with demo data
yarn seed:data

# Check database
mongo sprint-sync
db.users.find()
db.tasks.find()
```

## 🎯 Request-Response Flow

Understanding the API request-response flow helps in debugging and extending the application.

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client App    │    │   Sprint Sync    │    │    Database     │
│  (Frontend/     │    │      API         │    │   (MongoDB)     │
│   Mobile)       │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │  1. HTTP Request      │                       │
         │ (+ API Key/JWT)       │                       │
         │──────────────────────>│                       │
         │                       │                       │
         │                       │  2. Middleware        │
         │                       │     Processing        │
         │                       │  - Request Logging    │
         │                       │  - API Key Validation │
         │                       │  - JWT Authentication │
         │                       │  - Permission Check   │
         │                       │                       │
         │                       │  3. Route Handler     │
         │                       │     Execution         │
         │                       │                       │
         │                       │  4. Database Query    │
         │                       │──────────────────────>│
         │                       │                       │
         │                       │  5. Database Response │
         │                       │<──────────────────────│
         │                       │                       │
         │                       │  6. Response          │
         │                       │     Formatting        │
         │                       │  - Success/Error      │
         │                       │  - Data Serialization │
         │                       │  - Response Logging   │
         │                       │                       │
         │  7. JSON Response     │                       │
         │<──────────────────────│                       │
         │                       │                       │
```

### Request Flow Details

1. **Client Request**: Includes API key and/or JWT token
2. **Middleware Chain**:
   - Request logging with correlation ID
   - API key validation (`x-api-key` header)
   - JWT token verification (Bearer token)
   - Permission-based access control
3. **Route Processing**: Business logic execution
4. **Database Operations**: MongoDB queries via Mongoose
5. **Response Generation**: Standardized JSON responses
6. **Error Handling**: Centralized error logging and response

### Authentication Levels

```
Public Routes:
├── /api/health (Health check)
└── /api-docs (API documentation)

API Key Required:
├── /api/auth/signup (User registration)
├── /api/auth/signin (User login)
└── /api/auth/logout (User logout)

JWT Required (All other routes):
├── /api/tasks/* (Task management)
├── /api/users/* (User management)
└── /api/ai/* (AI assistance)
```

## 🗃️ Database Seeding

The project includes comprehensive seed data for development and testing.

### Seed Data Structure

```json
{
  "users": [
    {
      "firstName": "Admin",
      "lastName": "User",
      "email": "admin@sprintsync.com",
      "password": "password123",
      "isAdmin": true
    }
    // ... 10 more regular users
  ],
  "tasks": [
    {
      "title": "Setup Project Infrastructure",
      "description": "Initialize the project with proper folder structure...",
      "totalMinutes": 240,
      "status": "DONE"
    }
    // ... 15 more tasks with different statuses
  ]
}
```

### Seeding Commands

```bash
# Seed everything (recommended)
yarn seed:data

# Seed only users
yarn seed:users

# Seed only tasks (requires users to exist)
yarn seed:tasks
```

### Default Users

| Email                | Password     | Role  | Purpose              |
| -------------------- | ------------ | ----- | -------------------- |
| admin@sprintsync.com | password1234 | Admin | Administrative tasks |

## 🔧 Development Workflow

### Git Workflow & Commit Standards

This project uses conventional commits and pre-commit hooks for code quality.

#### Commit Message Format

```
type(scope): subject

body

footer
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

**Examples:**

```bash
git commit -m "feat(auth): add JWT token refresh functionality"
git commit -m "fix(tasks): resolve task assignment validation issue"
git commit -m "docs(readme): update installation instructions"
```

#### Pre-commit Hooks

The project automatically runs these checks before each commit:

1. **ESLint**: Code quality and style checking
2. **Prettier**: Code formatting
3. **TypeScript**: Type checking
4. **Commit Message**: Conventional commit format validation

```bash
# These run automatically on commit
yarn lint      # ESLint check
yarn format    # Prettier formatting
yarn check     # TypeScript validation
```

#### Branch Naming Convention

```
feature/feature-name    # New features
bugfix/bug-description  # Bug fixes
hotfix/urgent-fix      # Critical fixes
docs/documentation     # Documentation updates
chore/maintenance      # Maintenance tasks
```

**Examples:**

```bash
git checkout -b feature/task-filtering
git checkout -b bugfix/auth-token-expiry
git checkout -b docs/api-documentation
```

### Development Commands

```bash
# Development
yarn dev                    # Start development server
yarn dev:watch              # Start with file watching
yarn build                  # Build for production
yarn start                  # Start production server

# Documentation
yarn swagger                # Generate API documentation

# Code Quality
yarn lint                   # Run ESLint
yarn lint --fix             # Fix ESLint issues
yarn format                 # Format code with Prettier
yarn check                  # TypeScript type checking

# Testing
yarn test                   # Run tests
yarn test:watch             # Run tests in watch mode
yarn test:coverage          # Run tests with coverage

# Database
yarn seed:data              # Seed complete database
yarn seed:users             # Seed only users
yarn seed:tasks             # Seed only tasks
```

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: http://localhost:3000/api-docs
- **Auto-generated**: Updates automatically with code changes
- **Interactive Testing**: Test endpoints directly from the browser

### Key Endpoints

#### Authentication

```
POST /api/auth/signup       # User registration
POST /api/auth/signin       # User login
POST /api/auth/logout       # User logout
```

#### Tasks

```
GET    /api/tasks           # Get all tasks (with pagination)
POST   /api/tasks           # Create new task
GET    /api/tasks/:id       # Get task by ID
PUT    /api/tasks/:id       # Update task
DELETE /api/tasks/:id       # Delete task
POST   /api/tasks/:id/assign   # Assign task to user
DELETE /api/tasks/:id/assign   # Unassign task
```

#### Users

```
GET    /api/users           # Get all users (with pagination)
GET    /api/users/:id       # Get user by ID
```

#### AI Assistance

```
POST   /api/ai/suggest      # Generate task description from title
```

#### Health & Monitoring

```
GET    /api/health          # Health check with system info
```

## 📖 Additional Resources

### Learning Resources

These resources were instrumental in building this project:

#### Architecture & Design Patterns

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices) - Comprehensive Node.js guidelines
- [Clean Architecture in Node.js](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) - Architectural principles
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html) - Express optimization

#### Authentication & Security

- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/) - JSON Web Token guidelines
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/) - Security best practices
- [OWASP API Security](https://owasp.org/www-project-api-security/) - API security guidelines
- [Swagger Docs Autogen](https://swagger-autogen.github.io/docs/getting-started/quick-start)

#### Database & MongoDB

- [MongoDB Schema Design](https://www.mongodb.com/developer/products/mongodb/mongodb-schema-design-best-practices/) - Schema best practices
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html) - ODM documentation
