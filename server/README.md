# JeevanSetu API

## Setup
1. Install PostgreSQL and create a database named `jeevansetu`.
2. Copy `.env.example` to `.env` and set DATABASE_URL plus a random JWT_SECRET (32+ characters).
3. Run `npm install` from the repository root, then `npm install --prefix server`.
4. Run `npm run prisma:generate --prefix server`.
5. Run `npm run prisma:migrate --prefix server -- --name init`.
6. Run `npm run db:seed --prefix server`.
7. Start the API with `npm run dev --prefix server`; start Vite in another terminal with `npm run dev`.

The seeded scheme entries are sourced from official Government of India pages and include source URLs and a verification date. Re-check each source before publishing; the app does not claim to be an official eligibility decision service.

## API
- `GET /api/health`
- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/schemes?q=&category=&state=&verified=true`
- `GET /api/schemes/:id-or-slug`
- Authenticated: `GET /api/schemes/user/saved`, `POST|DELETE /api/schemes/:id/save`
- Authenticated: `GET /api/schemes/user/applications`, `POST /api/schemes/:id/applications`, `PATCH /api/schemes/applications/:applicationId`
- Admin: `POST /api/schemes`, `PATCH /api/schemes/:id/admin`, `POST /api/schemes/:id/verify`

Promote an account to admin manually in PostgreSQL after registration:
`UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-admin-email@example.com';`
