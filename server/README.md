# FinTrack Server

The FinTrack API is a production-oriented Express 5 and TypeScript service using ESM, Prisma, PostgreSQL, Zod, JWT cookies, and an MVC structure.

## Purpose

- Authenticate users and maintain the HTTP-only session cookie
- Store user-scoped income and expense transactions
- Validate and normalize money and dates
- Provide dashboard and chart analytics
- Report API/database availability without making `/api/health` database-dependent

## Stack

- Node.js and Express 5
- TypeScript with NodeNext ESM
- Prisma 6 and PostgreSQL/Supabase
- Zod
- JWT, bcryptjs, cookie-parser, Helmet, CORS, compression, Morgan
- `express-rate-limit`

## MVC Structure

```text
src/
├── config/       # Environment validation and Prisma singleton
├── controllers/  # Thin HTTP request/response handlers
├── services/     # Auth, transaction, category, and analytics logic
├── routes/       # Express route definitions and mount composition
├── middlewares/  # Authentication, validation, errors, 404, rate limits
├── validators/   # Zod schemas
├── utils/        # JWT, cookies, API responses, AppError, logger, db helpers
└── types/        # Express request declaration merging
```

Controllers validate through middleware and call services. Prisma access stays in the service/config layers, and every authenticated query is scoped by the logged-in user.

## Environment

Copy `.env.example` to `.env`.

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | HTTP port | `10000` |
| `NODE_ENV` | `development`, `test`, or `production` | `development` |
| `CLIENT_URL` | CORS origin; trailing slash is removed | `http://localhost:3000` |
| `DATABASE_URL` | Supabase pooled PostgreSQL connection | No production default |
| `DIRECT_URL` | Supabase direct PostgreSQL connection | No production default |
| `JWT_SECRET` | JWT signing secret, minimum 32 characters | Development fallback only |
| `JWT_EXPIRES_IN` | JWT and cookie lifetime | `7d` |

The server exits with a readable environment-validation error before startup when configuration is invalid.

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start `src/server.ts` with `tsx watch` |
| `npm run build` | Generate Prisma Client and compile TypeScript |
| `npm run start` | Run `dist/server.js` |
| `npm run typecheck` | TypeScript check only |
| `npm run lint` | ESLint source, scripts, and Prisma files |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:migrate` | Create and apply a development migration |
| `npm run db:deploy` | Apply migrations to production |
| `npm run db:seed` | Run the idempotent demo seed |
| `npm run db:studio` | Open Prisma Studio |
| `npm run smoke` | Run the API smoke test |

## Endpoint Reference

### Health

| Method | Path | Auth | Description | Query parameters |
|---|---|---|---|---|
| GET | `/api/health` | No | Database-independent process health | None |
| GET | `/api/status` | No | Server and database availability | None |

### Authentication

| Method | Path | Auth | Description | Query parameters |
|---|---|---|---|---|
| POST | `/api/auth/register` | No | Register; strict rate limit | None |
| POST | `/api/auth/login` | No | Login and set `token` cookie; strict rate limit | None |
| POST | `/api/auth/logout` | No | Clear the authentication cookie | None |
| GET | `/api/auth/me` | Yes | Get the current user | None |
| PATCH | `/api/auth/me` | Yes | Update name and currency | None |
| PATCH | `/api/auth/password` | Yes | Change password | None |

### Categories and Transactions

| Method | Path | Auth | Description | Query parameters |
|---|---|---|---|---|
| GET | `/api/categories` | Yes | List categories | `type=INCOME\|EXPENSE` |
| POST | `/api/transactions` | Yes | Create a transaction | None |
| GET | `/api/transactions` | Yes | List and filter transactions | `page`, `limit`, `type`, `categoryId`, `from`, `to`, `search`, `sortBy=date\|amount`, `order=asc\|desc` |
| GET | `/api/transactions/:id` | Yes | Get one owned transaction | None |
| PATCH | `/api/transactions/:id` | Yes | Update one owned transaction | None |
| DELETE | `/api/transactions/:id` | Yes | Delete one owned transaction | None |

### Analytics

| Method | Path | Auth | Description | Query parameters |
|---|---|---|---|---|
| GET | `/api/analytics/summary` | Yes | Income, expense, balance, savings rate, count | `from`, `to`, `type`, `categoryId` |
| GET | `/api/analytics/by-category` | Yes | Category totals with percentages | `type`, `from`, `to`, `categoryId` |
| GET | `/api/analytics/monthly` | Yes | Monthly totals with zero-filled months | `months` default `6`, maximum `24` |

Analytics and transaction dates accept offset ISO-8601 values. Analysis major-unit values are derived from integer amount minor units.

## Error Format

Success:

```json
{
  "success": true,
  "message": "Description",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Description",
  "errors": {}
}
```

Common database-unavailable errors use HTTP `503`:

```json
{
  "success": false,
  "code": "DB_UNAVAILABLE",
  "message": "The database is currently paused or unreachable. Please try again shortly or contact the developer for a live demo."
}
```

The central handler covers Zod validation, Prisma `P2002`/`P2025`, JWT errors, database availability, and unknown errors.

## Prisma Schema Summary

| Model | Key fields |
|---|---|
| `User` | `id`, `name`, unique lowercase-facing email application logic, `passwordHash`, `currency`, timestamps, transactions |
| `Category` | `id`, unique `[name, type]`, type, Lucide icon, hex color, system flag |
| `Transaction` | `id`, user/category IDs, type, positive `amountMinor`, optional note, date, timestamps |

Enums:

```text
TransactionType: INCOME | EXPENSE
```

Transactions index `(userId, date)`, `(userId, type)`, and `(userId, categoryId)`. The delete path for a user cascades their transactions; category deletion is intentionally guarded by Prisma relations.

## Security

- HTTP-only JWT cookie named `token`
- `SameSite=Lax`, `Secure` only in production, `Path=/`, seven-day lifetime
- `trust proxy 1` for Render
- CORS restricted to `CLIENT_URL`
- bcryptjs hashing with 12 rounds
- Password fields are never returned
- General limit: 300 requests per 15 minutes
- Authentication limit: 20 requests per 15 minutes
- Helmet, compression, JSON size limit of 1 MB, and cookie parsing
- All money is stored as integer minor units
- Unknown production errors hide stack traces

## Smoke Test

Start the API on port `10000`, ensure the database and demo seed are available, then run:

```bash
npm run smoke
```

The smoke script verifies health/status, demo login, analytics, registration, profile updates, categories, transaction CRUD and validation, ownership isolation, wrong-password handling, duplicate registration, logout, and post-logout authentication.

The script does not seed data. Run `npm run db:seed` first when a fresh database needs the demo account and categories.
