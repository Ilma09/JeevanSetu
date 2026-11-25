# JeevanSetu — Healthcare Assistance & Government Scheme Navigator

JeevanSetu is a React + Vite frontend with a Node.js/Express + PostgreSQL/Prisma API. The existing interface is retained while the Government Scheme Navigator, account registration/login, saved schemes, application tracking, and scheme administration are connected to database-backed APIs.

## Current implementation status

- Government Scheme Navigator: reads verified scheme records from PostgreSQL, with search and category filtering.
- Accounts: registration, login, JWT authentication, bcrypt password hashing, and account profile endpoint.
- Saved schemes and application trackers: authenticated API endpoints and profile display.
- Scheme administration: create, edit, activate/deactivate, and verify endpoints; basic admin screen at `/admin/schemes`.
- Seeded records: PM-JAY, PMSBY, and PMMVY, with official source URLs. Re-check each official source before relying on current terms.
- Other healthcare modules (nearby hospital capacity/wait times, blood requests, camps, family health records, AI chat and notifications) still need authorized live data integrations. They must not be interpreted as live data; some existing frontend pages still contain prototype data and are being migrated separately.

## Requirements

- Node.js 20+
- PostgreSQL 14+
- npm

## Setup

### 1. Database

Create a PostgreSQL database named `jeevansetu`. For local development, start PostgreSQL and ensure the database user/password match the connection string.

### 2. Environment

Copy `server/.env.example` to `server/.env` and configure the database and API secrets there:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/jeevansetu?schema=public"
JWT_SECRET="use-a-long-random-secret-of-at-least-32-characters"
JWT_EXPIRES_IN=1d
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
```

Copy the root `.env.example` to root `.env` for the Vite frontend:

```env
VITE_API_URL=http://localhost:4000/api
```

The API loads `server/.env`; Vite loads the root `.env`. Never commit real secrets or database credentials.

Never commit real secrets or database credentials.

### 3. Install, migrate, seed

From the repository root:

```bash
npm install
npm install --prefix server
npm run prisma:generate --prefix server
npm run prisma:migrate --prefix server -- --name init
npm run db:seed --prefix server
```

### 4. Run both applications

Terminal 1 (API):
```bash
npm run dev:api
``

Terminal 2 (React):
```bash
npm run dev
``

- Frontend: http://localhost:5173
- API health: http://localhost:4000/api/health

## First administrator

Register a normal account through `/login`, then promote that account manually using PostgreSQL:

```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';
```

Sign out and sign in again to refresh the JWT role claim. Open `/admin/schemes`. New scheme records are unverified until an administrator checks the source and explicitly verifies them.

## API overview

- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/schemes?q=&category=&state=&verified=true`
- `GET /api/schemes/:id-or-slug`
- Authenticated: `GET /api/schemes/user/saved`, `POST|DELETE /api/schemes/:id/save`
- Authenticated: `GET /api/schemes/user/applications`, `POST /api/schemes/:id/applications`, `PATCH /api/schemes/applications/:applicationId`
- Admin: `POST /api/schemes`, `PATCH /api/schemes/:id/admin`, `POST /api/schemes/:id/verify`

Creating an application tracker in JeevanSetu does not submit a form to a government department. Users must use the official scheme portal linked on each scheme record.

## Data-source policy

The myScheme portal is an official Government of India scheme discovery platform. No public, documented myScheme API was confirmed as part of this implementation; therefore the initial seed is a small curated set with official source URLs, not a claimed real-time sync. See [myScheme](https://www.myscheme.gov.in/), [National Health Authority](https://nha.gov.in/), [Department of Financial Services — PMSBY](https://financialservices.gov.in/pmsby), and [Ministry of Women and Child Development — PMMVY](https://www.wcd.gov.in/offerings/pradhan-mantri-matru-vandana-yojana).

Do not add invented eligibility rules, benefits, hospital bed availability, wait times, blood requests, or camp listings. A government source link and verification timestamp are stored with every scheme record; administrators are responsible for rechecking the source before marking a record verified.
