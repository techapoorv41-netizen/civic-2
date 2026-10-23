# CivicSense Backend API — Unified Architecture & Integration Specification

Production-ready, consolidated REST API backend service for **CivicSense**, a civic issue reporting, verification, dispatch, and AI-assisted resolution platform.

Built with Node.js 20 LTS, Express 4.21.2, CommonJS, and MongoDB Atlas + Mongoose. Follows strict RESTful design, Zod-based runtime validation, role-based access control (RBAC), rotating JWT refresh tokens, OpenAPI 3 / Swagger documentation, and automated testing with Jest and Supertest.

---

## 1. Executive System Architecture

The CivicSense platform operates on a single canonical REST backend (`civic-backend`) serving both the React Web Application (`civic-frontend`) and the React Native / Expo Mobile Application (`civic-mobile`) against MongoDB Atlas, Cloudinary, and Google Gemini AI.

```
React Web Client (Vite) ─────┐
                             ├── HTTPS REST API (/api/v1) ── MongoDB Atlas (M0 / Production)
Mobile Client (Expo / RN) ───┘          │
                                        ├── Cloudinary (Multer Memory Storage)
                                        └── Google Gemini 1.5 Pro / Flash API
```

### Complete Unified Directory Layout

```
civic-backend/
├── .env.example
├── .gitignore
├── jest.config.js
├── package.json
├── README.md
├── scripts/
│   ├── dev-server.js          # In-memory dev server with auto-seeding
│   ├── seed-admin.js          # Production admin bootstrap
│   └── seed-categories.js     # Default municipal categories seeder
├── src/
│   ├── app.js                 # Express application & middleware stack
│   ├── server.js              # HTTP server entrypoint
│   ├── routes.js              # Central router registry for all 12 modules
│   ├── config/
│   │   ├── env.js             # Zod environment validation with production guards
│   │   └── cors.js            # Exact-origin CORS configuration
│   ├── database/
│   │   ├── connection.js      # Resilient MongoDB connection with auto-reconnect
│   │   └── models.js          # Central database models export (13 models)
│   ├── middleware/
│   │   ├── asyncHandler.js    # Promise error forwarding
│   │   ├── auth.js            # JWT verification & RBAC authorization
│   │   ├── errorHandler.js    # Centralized D3/D4 error responder
│   │   ├── logger.js          # Pino structured HTTP logger with secret redaction
│   │   ├── rateLimiter.js     # IP rate limiters (auth & general)
│   │   └── validate.js        # Zod request validator (body, query, params)
│   ├── shared/
│   │   ├── constants/
│   │   │   ├── auditActions.js
│   │   │   ├── notificationTypes.js
│   │   │   └── roles.js
│   │   ├── contracts/
│   │   │   ├── audit.js
│   │   │   ├── issueLookup.js
│   │   │   ├── issueStats.js
│   │   │   ├── notification.js
│   │   │   └── userDirectory.js
│   │   ├── errors/
│   │   │   └── AppError.js
│   │   ├── pagination/
│   │   │   └── pagination.js
│   │   └── response/
│   │       └── apiResponse.js
│   ├── modules/
│   │   ├── auth/              # Registration, login, token rotation, logout, /me
│   │   ├── users/             # Profile management, admin user listing, block/unblock
│   │   ├── officials/         # Official profile, department verification, lookup
│   │   ├── comments/          # Issue comments & stakeholder notifications
│   │   ├── notifications/     # Central notifications inbox, read/read-all
│   │   ├── admin/             # Audit log queries, dashboard statistics, governance
│   │   ├── categories/        # Municipal category management
│   │   ├── issues/            # Issue reporting, state machine, filtering, verification
│   │   ├── issueHistory/      # Audit trail for all status transitions & remarks
│   │   ├── assignments/       # Admin dispatch, official accept, reject, complete
│   │   ├── attachments/       # Multer file upload & Cloudinary integration
│   │   └── ai/                # AI severity scoring, category detection, chat bot
│   └── docs/
│       ├── swagger.js         # Swagger UI integration at /api/docs
│       └── swagger.json       # OpenAPI 3.0 specification
└── tests/
    ├── setup.js               # In-memory MongoMemoryServer test harness
    ├── health.test.js
    ├── auth.test.js
    ├── users.test.js
    ├── officials.test.js
    ├── comments.test.js
    ├── notifications.test.js
    ├── admin.test.js
    └── issuesAndModules.test.js
```

---

## 2. API Conventions & Standard Response Envelopes

- **API Base Prefix**: `/api/v1`
- **Health Endpoint**: `GET /health` (root level)
- **JSON Standard**: Strict camelCase keys, ISO 8601 UTC timestamps, string IDs (`id`).
- **Data Protection**: `passwordHash`, `tokenHash`, and sensitive secrets are never emitted in logs or API responses.
- **Default Pagination**: `page=1`, `limit=10` (maximum 100), sorted by `-createdAt`.

### Single Record Response
```json
{
  "success": true,
  "data": {
    "id": "6ad4ee67a4d08c21934713d9",
    "title": "Hazardous open manhole near Model Town Metro",
    "status": "resolved"
  },
  "meta": null
}
```

### Paginated List Response
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

### Error Response Envelope
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable explanation of error",
    "details": [
      { "field": "email", "message": "Invalid email address format" }
    ]
  }
}
```

### Standard Error Codes & HTTP Mapping
| Error Code | HTTP Status | Trigger Condition |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Zod schema validation failure |
| `UNAUTHORIZED` | 401 | Missing, malformed, or expired Bearer token |
| `INVALID_CREDENTIALS` | 401 | Incorrect password or unverified email lookup |
| `FORBIDDEN` | 403 | Role-based permission denied |
| `USER_BLOCKED` | 403 | Account is marked blocked by administrator |
| `NOT_FOUND` | 404 | Resource does not exist |
| `CONFLICT` | 409 | Duplicate unique key or state transition conflict |
| `INVALID_STATUS_TRANSITION` | 409 | Illegal state machine transition |
| `INVALID_ASSIGNMENT_STATE` | 409 | Operation not allowed in current assignment state |
| `TOO_MANY_REQUESTS` | 429 | Exceeded IP rate limiter |
| `AI_UNAVAILABLE` | 503 | Gemini API failure or quota exhaustion |
| `INTERNAL_ERROR` | 500 | Unhandled server exception |

---

## 3. Comprehensive Endpoints Registry (All 12 Modules)

### Authentication (`/api/v1/auth`)
- `POST /register` — Register citizen or official account (Admin registration rejected with 422).
- `POST /login` — Login with email/password; returns `{ accessToken, refreshToken, user }`.
- `POST /refresh` — Rotate refresh token; detects token reuse and revokes compromised session chains.
- `POST /logout` — Revoke submitted refresh token (always 200).
- `GET /me` — Authenticated profile lookup (includes `isVerified` for officials).

### Users (`/api/v1/users`)
- `GET /:id` — User profile (full profile for self/admin; restricted `{ id, name, role }` for peers).
- `PATCH /me` — Update current user's `name` and `phone` (rejects role/email edits with 422).
- `GET /` — Admin listing with `role`, `isBlocked`, and search filters.

### Officials (`/api/v1/officials`)
- `POST /` — Create official profile (`department`, `designation`, `employeeId`, `area`).
- `GET /` — Admin list with `isVerified`, `department`, search, and pagination.
- `GET /:id` — Official profile by profile ID or user ID.
- `PATCH /:id/verify` — Admin verification of official; generates audit log & notification.

### Issues (`/api/v1/issues`)
- `POST /` — Citizen reports new issue with `categoryName`, `coordinates`, `address`. Status starts `pending`.
- `GET /` — Role-based list: Citizens see verified issues + own pending; Officials/Admin see all.
- `GET /:id` — Full issue details including category, assignment, and status.
- `PATCH /:id` — Update issue attributes (status transitions governed by state machine).
- `PATCH /:id/verify` — Admin anti-spam verification (`pending` -> `verified`).

### Issue Status History (`/api/v1/issues/:issueId/history`)
- `GET /` — Chronological timeline of all status changes, timestamps, actors, and remarks.

### Assignments (`/api/v1/assignments` & `/api/v1/issues/:issueId/assign`)
- `POST /api/v1/issues/:issueId/assign` — Admin assigns verified issue to official (`officialId`).
- `GET /api/v1/assignments/mine` — Official assignment inbox queue.
- `GET /api/v1/assignments` — Admin global assignment overview.
- `PATCH /api/v1/assignments/:id/accept` — Official accepts task (`verified` -> `in_progress`).
- `PATCH /api/v1/assignments/:id/reject` — Official rejects task with remarks (clears assignment).
- `PATCH /api/v1/assignments/:id/complete` — Official completes task with remarks (`in_progress` -> `resolved`).

### Categories (`/api/v1/categories`)
- `GET /` — Public listing of active municipal categories.
- `POST /` — Admin creates category (`name`, `department`, `description`, `icon`).

### Comments (`/api/v1/issues/:issueId/comments`)
- `POST /` — Post comment on issue (reporter, assigned official, or admin only).
- `GET /` — Chronological comments list with sanitized author `{ id, name, role }`.

### Attachments (`/api/v1/issues/:issueId/attachments`)
- `POST /` — Upload image proof (Multer memory upload -> Cloudinary or local static fallback).

### AI Analysis & Assistant (`/api/v1/issues/:issueId`)
- `GET /ai-analysis` — Returns `{ success: true, data: null }` if not analyzed (D15 rule; never 404).
- `POST /ai-analysis` — Generates severity rating, department prediction, and action checklist.
- `POST /ai-responses` — AI assistant Q&A bot for citizen queries regarding the issue.

### Central Notifications (`/api/v1/notifications`)
- `GET /` — Authenticated user's notification feed with `meta.unreadCount`.
- `PATCH /:id/read` — Mark single notification as read (404 on peer notification).
- `PATCH /read-all` — Mark all user notifications as read.

### Admin, Governance & Audit (`/api/v1/admin`)
- `PATCH /users/:id/block` — Admin blocks user; revokes sessions; prevents self/admin block.
- `PATCH /users/:id/unblock` — Admin unblocks user.
- `GET /actions` — Paginated audit log history with filter by actor, action, and target.
- `GET /stats` — System statistics (user counts, issue counts by status/category, pending officials).

---

## 4. Mobile & Frontend Network Configuration

Both `civic-frontend` and `civic-mobile` consume this exact backend.

### Frontend Configuration (`civic-frontend/.env`)
```bash
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

### Mobile Configuration (`civic-mobile/src/config/api.js`)
Mobile environments require specific loopback addresses because `localhost` refers to the mobile device itself:

| Environment | API URL |
|---|---|
| **Android Emulator** | `http://10.0.2.2:5000/api/v1` |
| **iOS Simulator** | `http://localhost:5000/api/v1` |
| **Physical Device (Expo Go via Wi-Fi)** | `http://<YOUR_LAN_IP>:5000/api/v1` (e.g. `http://192.168.1.5:5000/api/v1`) |
| **Production Cloud Deployed** | `https://your-backend.onrender.com/api/v1` |

> [!TIP]
> When testing on a physical mobile device, ensure your computer and phone are connected to the same Wi-Fi network and your local firewall permits incoming traffic on TCP port 5000.

---

## 5. Automated Tests & Coverage

Run the complete 8-suite test suite in-memory via Jest:

```bash
cd civic-backend
npm test
```

### Test Suite Execution Output
```
PASS tests/issuesAndModules.test.js
PASS tests/auth.test.js
PASS tests/admin.test.js
PASS tests/officials.test.js
PASS tests/comments.test.js
PASS tests/users.test.js
PASS tests/notifications.test.js
PASS tests/health.test.js

Test Suites: 8 passed, 8 total
Tests:       58 passed, 58 total (100% pass)
Snapshots:   0 total
Time:        38.8 s
```

---

## 6. External Production Services Setup

### A. MongoDB Atlas (Database)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create an **M0 Free Tier Cluster**.
2. Under **Database Access**:
   - Create user `civicsense_app` with read/write access to database `civicsense`.
3. Under **Network Access**:
   - Add IP address `0.0.0.0/0` (Allow from Anywhere) to permit connections from Render's dynamic IP range.
4. Copy the connection string into `DATABASE_URL`:
   `mongodb+srv://civicsense_app:<password>@cluster0.xxxxx.mongodb.net/civicsense?retryWrites=true&w=majority`

### B. Cloudinary (Production File Storage)
1. Sign up for a free account at [Cloudinary](https://cloudinary.com).
2. Obtain your **Cloud Name**, **API Key**, and **API Secret** from the Cloudinary Dashboard.
3. Configure in `.env`:
   - `STORAGE_DRIVER=cloudinary`
   - `CLOUDINARY_CLOUD_NAME=your_cloud_name`
   - `CLOUDINARY_API_KEY=your_api_key`
   - `CLOUDINARY_API_SECRET=your_api_secret`

### C. Google Gemini API (AI Analysis & Assistant)
1. Open [Google AI Studio](https://aistudio.google.com).
2. Generate an API Key.
3. Configure in `.env`:
   - `AI_MODE=live`
   - `AI_PROVIDER=gemini`
   - `AI_API_KEY=your_gemini_api_key`

### D. Render Deployment (Web Service)
1. Log in to [Render](https://render.com) and click **New + > Web Service**.
2. Connect your GitHub repository.
3. Set the service build parameters:
   - **Root Directory**: `civic-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
4. Add all environment variables from `.env.example` with live values.
5. In the Render Web Shell, run `npm run seed:admin` to initialize the production admin.
