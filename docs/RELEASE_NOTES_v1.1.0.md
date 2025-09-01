# SprintSync Backend - Release Notes (v0.02)

**Release Date**: 1st September 2025  
**Status**: Stable  
**Compatibility**: Node.js 18+, MongoDB 6+

---

## 🎯 Overview

This release builds on the repository-pattern foundation to deliver admin management features, production-hardened JWT key handling, improved logging with authenticated user context, test reliability with in-memory MongoDB, and streamlined build/CI/Docker workflows.

---

## ✨ New Features

### 🔐 Admin Management Endpoints

- Bulk user creation with password hashing and optional admin role
  - POST `/api/admin/users`
- Bulk task creation
  - POST `/api/admin/tasks`
- Update user role (assign/unassign admin)
  - PATCH `/api/admin/users/:userId/role`

All endpoints are protected by API key and user authentication; only admins are authorized.

### 📝 Seed-Compatible Payloads

- Bulk routes accept arrays matching `src/database/seed.json` formats for users and tasks.

---

## 🔧 Technical Improvements

### 🔑 JWT Key Loading (Production-Ready)

- Removed environment-variable based key loading for JWT.
- Non-test environments:
  - Development/Test: read from `keys/public.pem` and `keys/private.pem`.
  - Production (e.g., Render): read from project root `public.pem` and `private.pem` (Render Secret Files are exposed at root automatically).
- Clear logging of loaded key path.

### 🧾 Request Logging with User Context

- `requestLogger` now optionally validates access tokens and resolves users.
- Logs include `userId` for authenticated requests; `anonymous` for public requests.
- Authentication middleware reuses resolved user/keystore to avoid redundant DB lookups.

### 🧪 Testing & Stability

- Tests use `mongodb-memory-server` for isolation and reliability.
- Jest config excludes test files from coverage collection.
- TypeScript config excludes tests from build; `skipLibCheck` enabled.

### 🛠️ Repository & Services

- `UserRepository` adds `updateById` for role updates.
- DTOs extended to support `isAdmin` on creation.

### 📦 Build & Docker

- `build:prod` ensures Swagger is generated and copied during build.
- Dockerfiles updated with healthchecks and correct start commands.
- `.dockerignore` added to reduce build context size.

### 🧰 CI/CD

- Consolidated workflows; eliminated duplicate test runs.
- Modular reusable workflows for code quality, security audit, test/build, and Docker image build.

---

## 🚀 API Endpoints (New)

### Admin

- `POST /api/admin/users` — Bulk create users (supports `isAdmin`)
- `POST /api/admin/tasks` — Bulk create tasks
- `PATCH /api/admin/users/:userId/role` — Update user admin status

Payloads mirror structures in `src/database/seed.json`.

---

## ⚠️ Breaking Changes

- JWT keys are no longer sourced from environment variables. Production must provide `public.pem` and `private.pem` files at the project root (e.g., via Render Secret Files). Development/test continue to use `keys/` directory.
- Removed `PUBLIC_KEY`/`PRIVATE_KEY` environment variable usage. Ensure secrets are provided as files.

---

## 🛠️ Upgrade Guide

1. Production JWT keys
   - Upload `public.pem` and `private.pem` as Render Secret Files (or ensure they exist at project root at runtime).
2. Environment variables
   - Remove `PUBLIC_KEY`/`PRIVATE_KEY` if previously set; they are no longer used.
3. Testing
   - No action needed; tests rely on in-memory MongoDB.

---

## 📋 Requirements

- Node.js 18+
- MongoDB 6+
- Yarn 1.22+

Environment variables (excerpt):

```env
NODE_ENV=development
PORT=8020
CORS_URL=http://localhost:3000
DB_NAME=sprint-sync
DB_MIN_POOL_SIZE=2
DB_MAX_POOL_SIZE=5
LOG_DIR=logs
JWT_ISSUER=sprintsync.com
JWT_AUDIENCE=sprintsync.com
JWT_ACCESS_TOKEN_VALIDITY=172800
JWT_REFRESH_TOKEN_VALIDITY=604800
```

---

## 📊 Highlights

- Faster authenticated requests via user resolution reuse.
- More reliable tests with in-memory MongoDB.
- Clear, file-based JWT key loading for production.
- Admin bulk operations for faster data onboarding and role management.

---

## 🐛 Bug Fixes & Polishing

- Removed deprecated Mongoose hooks and tightened schema typings.
- Fixed linter/type errors across middleware and database modules.
- Standardized scripts to use Yarn.

---

## 📚 Documentation

- Updated environment guidance for JWT keys (file-based).
- Swagger generated at build time and copied to distribution.

---

_Release notes generated for SprintSync Backend v1.1.0_
