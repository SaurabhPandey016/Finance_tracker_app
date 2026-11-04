# FinTrack

FinTrack is a full-stack personal finance tracker with a Next.js client and Express/Prisma API.

## Local setup

Start the API:

```bash
cd server
cp .env.example .env
npm install
npm run db:generate
npm run dev
```

Start the client:

```bash
cd client
cp .env.example .env.local
npm install
npm run dev
```

## Production seed

Do not seed during the Render build or migration deploy. When the production database is available, seed it once manually from `/server` with production environment variables loaded:

```bash
npx prisma db seed
```

## Deployment

- Render deploys the API using the repository-root `render.yaml`.
- Vercel deploys `/client` and requires `API_ORIGIN` plus the optional public metadata variables.
