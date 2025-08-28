# Sprint Sync Backend

A Node.js backend API built with Express, TypeScript, and MongoDB, implementing clean architecture patterns for scalability and maintainability.

## 🚀 Features

- **Authentication System** - JWT-based authentication with refresh tokens
- **Repository Pattern** - Clean separation of data access and business logic
- **TypeScript** - Full type safety and modern JavaScript features
- **MongoDB** - Document database with Mongoose ODM
- **API Key Authentication** - Secure API access control
- **Structured Logging** - Winston-based logging with file rotation
- **Error Handling** - Centralized error handling with custom error classes
- **Validation** - Request validation using Joi schemas

## 🏗️ Architecture

This project follows the **Repository Pattern** and **Clean Architecture** principles:

```
src/
├── repositories/           # Data Access Layer
│   ├── interfaces/         # Repository contracts
│   ├── UserRepository.ts   # User data operations
│   └── KeystoreRepository.ts # Keystore operations
├── services/               # Business Logic Layer
│   ├── user/              # User business logic
│   └── apiKey/            # API key management
├── routes/                 # HTTP Layer
│   └── auth/              # Authentication endpoints
├── models/                 # Database Models
├── core/                   # Core utilities
│   ├── TokenFactory.ts    # Token generation
│   ├── ApiErrors.ts       # Error handling
│   └── Logger.ts          # Logging
└── helpers/                # Utility functions
```

## 🛠️ Prerequisites

- **Node.js** (v18 or higher)
- **Yarn** package manager
- **MongoDB** (v6 or higher)
- **TypeScript** knowledge

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sprint-sync-be
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Start MongoDB**
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # Or start manually
   mongod --dbpath /usr/local/var/mongodb
   ```

4. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=8020
   CORS_URL=http://localhost:3000
   DB_NAME=sprint-sync
   DB_MIN_POOL_SIZE=2
   DB_MAX_POOL_SIZE=5
   LOG_DIR=logs
   JWT_ISSUER=sprint-sync
   JWT_AUDIENCE=sprint-sync
   JWT_ACCESS_TOKEN_VALIDITY=1h
   JWT_REFRESH_TOKEN_VALIDITY=7d
   ```

## 🚀 Development

### Start Development Server
```bash
yarn dev
```

The server will start on port 8020 (or the port specified in your `.env` file).

### Build for Production
```bash
yarn build
```

### Run Tests
```bash
yarn test
```

## 🏗️ Repository Pattern Implementation

### Why Repository Pattern?

The Repository Pattern provides several benefits:
- **Separation of Concerns** - Business logic is separate from data access
- **Testability** - Easy to mock repositories for unit testing
- **Consistency** - All database operations follow the same patterns
- **Maintainability** - Database changes only affect repository layer
- **Flexibility** - Easy to add caching, logging, or switch databases

### Repository Structure

#### 1. Interface Definition
```typescript
// repositories/interfaces/IUserRepository.ts
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(userData: CreateUserDto): Promise<User>;
  findById(id: string): Promise<User | null>;
}
```

#### 2. Implementation
```typescript
// repositories/UserRepository.ts
export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await UserModel
        .findOne({ email })
        .select('+firstName +lastName +email +password +isAdmin')
        .lean()
        .exec();
      
      return user as User;
    } catch (error: any) {
      Logger.error('Error finding user by email:', error);
      throw new DatabaseError('Failed to find user by email', error);
    }
  }
}
```

#### 3. Service Layer
```typescript
// services/user/index.ts
export class UserService {
  constructor(
    private userRepo: IUserRepository = new UserRepository(),
    private keystoreRepo: IKeystoreRepository = new KeystoreRepository()
  ) {}

  async authenticateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new BadRequestError('User not found');
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new BadRequestError('Invalid password');
    
    return user;
  }
}
```

### Token Factory Pattern

Centralized token generation eliminates code duplication:

```typescript
// core/TokenFactory.ts
export class TokenFactory {
  static createTokenPair(): TokenPair {
    return {
      accessKey: this.createAccessTokenKey(),
      refreshKey: this.createRefreshTokenKey()
    };
  }
}
```

## 🔐 Authentication Flow

### 1. User Registration
```
POST /api/auth/signup
{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john@example.com",
  "password": "securepassword"
}
```

### 2. User Login
```
POST /api/auth/signin
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### 3. API Key Authentication
All API requests require an `x-api-key` header:
```
x-api-key: your-api-key-here
```

## 📊 Database Models

### User Model
```typescript
{
  firstName: String (required),
  lastName: String (required),
  email: String (required, unique),
  password: String (required, select: false),
  isAdmin: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

### Keystore Model
```typescript
{
  client: ObjectId (ref: User),
  primaryKey: String (access token),
  secondaryKey: String (refresh token),
  status: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 Testing

### Unit Testing
```bash
# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run specific test file
yarn test src/services/user/index.test.ts
```

### Testing with Repositories
The Repository Pattern makes testing easy:

```typescript
// Mock repository for testing
const mockUserRepo: IUserRepository = {
  findByEmail: jest.fn().mockResolvedValue(mockUser),
  create: jest.fn().mockResolvedValue(mockUser),
  findById: jest.fn().mockResolvedValue(mockUser)
};

// Inject mock into service
const userService = new UserService(mockUserRepo, mockKeystoreRepo);
```

## 🔧 Configuration

### Database Configuration
- **MongoDB URI**: `mongodb://localhost:27017/sprint-sync`
- **Connection Pool**: Min 2, Max 5 connections
- **Timeout**: 30 seconds connection timeout

### Logging Configuration
- **Development**: Console + File logging
- **Production**: File logging only
- **Rotation**: Daily log files with 14-day retention
- **Max Size**: 20MB per log file

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t sprint-sync-be .

# Run container
docker run -p 8020:8020 sprint-sync-be
```

### Environment Variables
Set these in production:
- `NODE_ENV=production`
- `PORT=8020`
- `DB_URI=mongodb://your-production-db`
- `CORS_URL=https://your-frontend-domain.com`

## 📁 Project Structure

```
sprint-sync-be/
├── src/
│   ├── repositories/          # Data access layer
│   │   ├── interfaces/        # Repository contracts
│   │   ├── UserRepository.ts  # User data operations
│   │   └── KeystoreRepository.ts
│   ├── services/              # Business logic
│   │   ├── user/             # User operations
│   │   └── apiKey/           # API key management
│   ├── routes/                # HTTP endpoints
│   │   └── auth/             # Authentication routes
│   ├── models/                # Database schemas
│   ├── core/                  # Core utilities
│   │   ├── TokenFactory.ts   # Token generation
│   │   ├── ApiErrors.ts      # Error handling
│   │   └── Logger.ts         # Logging
│   ├── helpers/               # Utility functions
│   ├── database/              # Database connection
│   ├── app.ts                 # Express app setup
│   └── server.ts              # Server entry point
├── tests/                     # Test files
├── logs/                      # Application logs
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── README.md                  # This file
```

## 🤝 Contributing

1. **Follow the Repository Pattern** - Keep data access in repositories
2. **Use TypeScript** - Maintain type safety
3. **Add Tests** - New features should include tests
4. **Follow Error Handling** - Use custom error classes
5. **Logging** - Add appropriate logging at repository and service layers

## 📝 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | User registration | No |
| POST | `/api/auth/signin` | User login | No |

### Request Headers
```
x-api-key: your-api-key
Content-Type: application/json
```

### Response Format
```json
{
  "statusCode": "10000",
  "message": "Success message",
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running: `brew services list | grep mongodb`
   - Check connection string in logs

2. **Module Resolution Errors**
   - All imports use relative paths (no `@/` imports)
   - Check file paths and import statements

3. **Port Already in Use**
   - Change PORT in `.env` file
   - Kill existing process: `lsof -ti:8020 | xargs kill`

4. **TypeScript Compilation Errors**
   - Run `yarn build` to see detailed errors
   - Check import paths and type definitions

## 📚 Additional Resources

- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)

## 📄 License

This project is licensed under the MIT License.
