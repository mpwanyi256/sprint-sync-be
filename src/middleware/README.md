# Authentication Middleware

This directory contains the authentication middleware for the SprintSync application, based on the prodev API authentication pattern.

## Overview

The authentication system uses JWT tokens with keystore validation to ensure secure access to protected routes. It follows a multi-layered approach:

1. **JWT Token Validation** - Verifies token signature and expiration
2. **Token Data Validation** - Checks issuer, audience, and subject
3. **User Validation** - Ensures user exists in database
4. **Keystore Validation** - Verifies token hasn't been revoked

## Middleware Functions

### `authentication` (Router-level)
**Router-level authentication middleware** that protects all routes under it. This follows the prodev API pattern.

```typescript
import authentication from '../middleware/authentication';

// Protect all routes in this router
router.use(authentication);

router.post('/tasks', async (req, res) => {
  // req.user is now available with authenticated user data
  const userId = req.user._id;
  // ... rest of route logic
});
```

**What it does:**
- Extracts Bearer token from Authorization header
- Validates JWT signature and expiration
- Verifies token data (issuer, audience, subject)
- Finds user in database
- Validates keystore to prevent token revocation
- Adds `user`, `accessToken`, and `keystore` to request object

**Error responses:**
- `401 Unauthorized` - Invalid or missing token
- `401 Token Expired` - Token has expired
- `401 User not registered` - User not found in database
- `401 Invalid access token` - Keystore validation failed



## Request Object Extensions

When using authentication middleware, the request object is extended with:

```typescript
interface ProtectedRequest extends Request {
  user: User;           // Authenticated user object
  accessToken: string;  // Validated JWT token
  keystore: Keystore;  // Validated keystore object
}
```

## Usage Examples

### Protecting All Routes in a Router
```typescript
import authentication from '../middleware/authentication';

// Protect all routes in this router
router.use(authentication);

router.post('/tasks', createTaskHandler);
router.get('/tasks', getTasksHandler);
router.put('/tasks/:id', updateTaskHandler);
```

### Protecting Specific Route Groups
```typescript
// Public routes (no auth required)
router.get('/public', publicHandler);

// Protected routes (auth required)
router.use('/api', authentication);
router.get('/api/tasks', getTasksHandler);
router.post('/api/tasks', createTaskHandler);
```

### Mixed Authentication in Different Routers
```typescript
// Auth router (no auth required)
router.use('/auth', authRoutes);

// Task router (auth required)
router.use('/tasks', authentication, taskRoutes);

// Admin router (auth + admin required)
router.use('/admin', authentication, adminRoutes);
```

### Custom Error Handling
```typescript
router.use('/api', authenticateToken, (err, req, res, next) => {
  if (err instanceof AccessTokenError) {
    return res.status(401).json({ 
      error: 'Token expired', 
      code: 'TOKEN_EXPIRED' 
    });
  }
  next(err);
});
```

## Security Features

### Token Validation
- **RS256 Algorithm** - Asymmetric key signing for security
- **Expiration Checking** - Automatic token expiration
- **Issuer Validation** - Ensures tokens come from trusted source
- **Audience Validation** - Prevents token misuse

### Keystore Validation
- **Token Revocation** - Invalidates tokens when user logs out
- **Session Management** - Tracks active sessions
- **Security Breach Response** - Can revoke all user tokens

### User Validation
- **Database Verification** - Ensures user still exists
- **Status Checking** - Can check if user account is active
- **Permission Validation** - Supports role-based access control

## Configuration

The authentication system uses configuration from `src/config/index.ts`:

```typescript
export const tokenInfo = {
  issuer: process.env.TOKEN_ISSUER || 'sprint-sync',
  audience: process.env.TOKEN_AUDIENCE || 'sprint-sync-api',
  accessTokenValidity: process.env.ACCESS_TOKEN_VALIDITY || '15m',
  refreshTokenValidity: process.env.REFRESH_TOKEN_VALIDITY || '7d',
};
```

## Error Handling

All authentication errors are properly typed and can be caught in your error handling middleware:

```typescript
app.use((err, req, res, next) => {
  if (err instanceof AuthFailureError) {
    return res.status(401).json({ error: err.message });
  }
  if (err instanceof AccessTokenError) {
    return res.status(401).json({ error: err.message });
  }
  // ... handle other errors
});
```

## Best Practices

1. **Always use HTTPS** in production for token transmission
2. **Set appropriate token expiration** times (15min for access, 7 days for refresh)
3. **Implement token refresh** mechanism for long-lived sessions
4. **Log authentication failures** for security monitoring
5. **Use rate limiting** to prevent brute force attacks
6. **Implement proper logout** to invalidate keystores
7. **Monitor keystore usage** for suspicious activity

## Troubleshooting

### Common Issues

1. **"Invalid Authorization"** - Missing or malformed Authorization header
2. **"Token is not valid"** - Invalid JWT signature or format
3. **"Token is expired"** - Token has passed expiration time
4. **"User not registered"** - User ID in token doesn't exist in database
5. **"Invalid access token"** - Keystore validation failed

### Debug Mode

Enable debug logging to see detailed authentication flow:

```typescript
// In your environment variables
LOG_LEVEL=debug
```

This will show:
- Token extraction steps
- Validation progress
- User lookup results
- Keystore validation status
