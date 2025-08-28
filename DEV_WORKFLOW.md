# Development Workflow

## Quick Development (Recommended)

For most development work, use:

```bash
yarn dev
```

This gives you:
- ✅ **Fast startup** - No compilation needed
- ✅ **Direct execution** - ts-node runs TypeScript directly
- ✅ **No rebuild loops** - Simple and efficient
- ✅ **Immediate feedback** - See changes instantly

## Development with Auto-Restart

When you want the server to automatically restart on file changes:

```bash
yarn dev:watch
```

This gives you:
- ✅ **Auto-restart** - Server restarts when you save files
- ✅ **File watching** - Monitors `src/` directory for changes
- ✅ **No infinite loops** - Smart watching that avoids rebuild issues
- ✅ **Development efficiency** - Focus on coding, not manual restarts

## Type Checking During Development

To continuously check TypeScript types while developing:

```bash
yarn build:watch
```

This gives you:
- ✅ **Type checking** - Catches TypeScript errors as you code
- ✅ **Compilation feedback** - See build errors in real-time
- ✅ **No server restart** - Just type checking, no server changes

## Production-Like Testing

To test the compiled version (like production):

```bash
yarn prod:test
```

This gives you:
- ✅ **Production build** - Tests the actual compiled JavaScript
- ✅ **Module resolution** - Tests production module loading
- ✅ **Performance testing** - See how the compiled version performs

## Development Workflow Recommendations

### Daily Development
```bash
# Terminal 1: Start development server
yarn dev:watch

# Terminal 2: Type checking (optional)
yarn build:watch
```

### Testing Changes
```bash
# Quick test
yarn dev

# Test with auto-restart
yarn dev:watch
```

### Before Committing
```bash
# Check types
yarn check

# Build to ensure everything compiles
yarn build

# Test production build
yarn prod:test
```

### Debugging Issues
```bash
# Check TypeScript compilation
yarn build:watch

# Test production-like environment
yarn prod:test

# Check logs
tail -f logs/app.log
```

## Why This Setup?

### Problem with Previous Setup
- ❌ **Infinite rebuild loops** - `build:watch` + `server:watch` caused endless cycles
- ❌ **Complex dependencies** - Multiple processes that could interfere
- ❌ **Slow development** - Always waiting for compilation

### Benefits of New Setup
- ✅ **No rebuild loops** - Each script has a single responsibility
- ✅ **Fast development** - ts-node for immediate feedback
- ✅ **Flexible options** - Choose the right tool for the job
- ✅ **Efficient watching** - Smart file monitoring without conflicts

## Troubleshooting

### "Port already in use"
```bash
# Kill existing processes
lsof -ti:8020 | xargs kill -9

# Or use a different port
PORT=8021 yarn dev
```

### "Module not found"
```bash
# Clean and rebuild
yarn clean && yarn build

# Check tsconfig paths
yarn check
```

### "Server not restarting"
```bash
# Check if nodemon is running
ps aux | grep nodemon

# Restart with explicit watching
yarn dev:watch
```

### "TypeScript errors"
```bash
# Check types without building
yarn check

# Watch for type errors
yarn build:watch
```

## Environment Variables

Make sure you have a `.env` file:

```bash
# Copy example
cp env.example .env

# Edit with your values
nano .env
```

Required for JWT authentication:
```bash
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```
