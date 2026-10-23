# CivicSense — Civic Issue Reporting & Resolution Platform

Production-ready monorepo for the CivicSense platform, consisting of:
- **`civic-backend`**: Node.js & TypeScript REST API service with Express and MongoDB (Mongoose).
- **`civic-frontend`**: React web client (Vite).
- **`civic-mobile`**: React Native / Expo mobile application.

---

## 1. Prerequisites

- **Node.js**: Node.js 20 LTS or Node.js 22 (tested with Node.js v22.14.0 on Windows).
- **Package Manager**: `npm` (v10+).
- **Database**:
  - **Local Development**: MongoDB service running locally on `127.0.0.1:27017` **OR**
  - **Cloud Development**: MongoDB Atlas cluster (M0 or higher).
  - *Note:* A functioning MongoDB database connection is **mandatory** for the backend service to complete startup and handle API traffic.

---

## 2. Dependency Installation

To install dependencies for all packages from the repository root:

```powershell
# Install backend dependencies
npm --prefix civic-backend install

# Install frontend dependencies (if developing web client)
npm --prefix civic-frontend install
```

Alternatively, install dependencies inside the subfolder directly:

```powershell
cd civic-backend
npm install
cd ..
```

---

## 3. Environment Variable Configuration

Create a `.env` file inside `civic-backend/` based on the provided template:

```powershell
Copy-Item civic-backend\.env.example civic-backend\.env
```

Open `civic-backend\.env` and configure the required settings:

| Variable | Default (Dev) | Description |
|---|---|---|
| `PORT` | `5000` | HTTP port for the backend server |
| `NODE_ENV` | `development` | Runtime environment (`development`, `production`, `test`) |
| `DATABASE_URL` | `mongodb://127.0.0.1:27017/civicsense` | MongoDB connection URI (local or Atlas) |
| `JWT_SECRET` | `change-me-long-random-jwt-secret-min-32-chars` | Secret key for JWT access tokens |
| `REFRESH_TOKEN_SECRET` | `change-me-another-long-random-refresh-secret-min-32-chars` | Secret key for refresh tokens |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origins (comma-separated) |

> [!CAUTION]
> Never commit `civic-backend/.env` or any file containing real passwords or secrets to Git.

---

## 4. Starting the Backend

### Option A: From Repository Root (Recommended)

```powershell
npm run dev
```

This triggers `npm --prefix civic-backend run dev`, which starts the backend with `tsx watch src/server.ts` for live reloading.

### Option B: From `civic-backend` Directory

```powershell
cd civic-backend

# Using npm script:
npm run dev

# Or directly with node:
node src/server.js

# Or with Node's built-in file watcher:
node --watch src/server.js
```

All approaches launch the backend entry point directly.

---

## 5. Expected Server Address & Health Verification

Once started, the backend is available at:
- **Base URL**: `http://localhost:5000`
- **API Base**: `http://localhost:5000/api/v1`
- **Swagger Documentation**: `http://localhost:5000/api/docs`
- **Health Check**: `http://localhost:5000/health`

### Verifying the Health Endpoint

Verify via PowerShell:

```powershell
# Quick JSON status check:
Invoke-RestMethod -Uri http://localhost:5000/health

# Or via WebRequest:
Invoke-WebRequest -UseBasicParsing -Uri http://localhost:5000/health
```

### Understanding Liveness vs. Readiness

The health endpoints distinguish process liveness from database readiness:

- **`GET /health`** (Overall Health):
  - Returns `200 OK` (`"status": "healthy"`) when both the process is live and MongoDB is connected.
  - Returns `503 Service Unavailable` (`"status": "degraded"`) if the database is disconnected.
- **`GET /health/liveness`** (Process Liveness):
  - Always returns `200 OK` (`"status": "alive"`) as long as the Node.js HTTP process is running.
- **`GET /health/readiness`** (Dependency Readiness):
  - Returns `200 OK` (`"status": "ready"`) only when MongoDB is connected.
  - Returns `503 Service Unavailable` (`"status": "unready"`) if MongoDB is unavailable.

---

## 6. What to Do If MongoDB Is Unreachable

MongoDB is a **mandatory** dependency. If the backend cannot establish a connection on startup, it will log a structured fatal error and exit with code `1`.

### If using local MongoDB:
1. Verify if the MongoDB service is installed and running:
   ```powershell
   Get-Service -Name "*mongo*"
   ```
2. If installed but stopped, start the service in an elevated PowerShell:
   ```powershell
   net start MongoDB
   ```
3. Test if port 27017 is open:
   ```powershell
   Test-NetConnection -ComputerName 127.0.0.1 -Port 27017
   ```

### If using MongoDB Atlas:
1. Verify your network connectivity.
2. In MongoDB Atlas, go to **Network Access** and verify that your current public IP address is allowed (or `0.0.0.0/0` for development).
3. Ensure the username and password in `DATABASE_URL` in `civic-backend/.env` are correct and URL-encoded.

---

## 7. Common Startup Errors and Remedies

| Error / Symptom | Root Cause | Remedy |
|---|---|---|
| `npm error Missing script: "dev"` from root | Root `package.json` was missing the `"dev"` script shortcut. | Ensure root `package.json` contains `"scripts": { "dev": "npm --prefix civic-backend run dev" }`. |
| `Error: Cannot find module '...src/server.js'` | Node watcher was invoked on `.js` instead of `.ts`. | Run `npm run dev` (`tsx watch src/server.ts`). Do not run `node src/server.js`. |
| `listen EADDRINUSE: address already in use :::5000` | Port 5000 is occupied by another running instance. | Run `Get-NetTCPConnection -LocalPort 5000` to find the owning PID, and close the existing process. |
| `MongoDB connection initialization failed` | MongoDB is unreachable at configured host/port. | Follow the MongoDB recovery steps in Section 6. |

---

## 8. Development Verification Scripts

Inside `civic-backend`:
- `npm run type-check`: Run TypeScript compilation check (`tsc --noEmit`).
- `npm run build`: Compile TypeScript into `dist/` (`tsc`).
- `npm test`: Run automated Jest test suites with in-memory database.
- `npm run lint`: Run ESLint across TypeScript source files.
