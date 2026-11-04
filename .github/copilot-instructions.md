# FinTrack project rules (always follow)

- Monorepo: /client (Next.js App Router, TypeScript) and /server (Express, TypeScript, ESM).
- Server is ESM only: package.json has "type": "module", tsconfig uses "module": "NodeNext" and "moduleResolution": "NodeNext". Relative imports MUST end in .js. Never use require or module.exports.
- Server follows MVC: src/config, src/controllers, src/services, src/routes, src/middlewares, src/validators (zod), src/utils, src/types. Prisma access lives in services (the "model" layer). Controllers stay thin: validate -> call service -> respond.
- Every async controller uses asyncHandler. Errors use a custom AppError class and ONE central errorHandler. API response shape: { success: boolean, message: string, data?: T, errors?: unknown }.
- Auth: JWT in an httpOnly cookie named "token" (sameSite=lax, secure in production, path "/"). Never return the token in JSON, never use localStorage for auth.
- Validate all input with zod. Hash passwords with bcryptjs (12 rounds). Never return passwordHash. Every query is scoped by the logged-in userId (users can only touch their own data).
- Money is stored as an integer in minor units (paise/cents). Convert to display values only on the client with Intl.NumberFormat. Never use floats for money.
- Client calls the API only at the relative path "/api/..." (Next.js rewrite proxies to Express). Never hardcode a backend URL in client code.
- Client: Tailwind + shadcn/ui + lucide-react + Recharts. Olive green design tokens in globals.css. Fixed navbar, enterprise footer, mobile-first, accessible. Every data view has a skeleton loading state, an empty state and an error state.
- Code style: strict TypeScript, no "any", small files, descriptive names, comments only where logic is non-obvious, Prettier (2 spaces, double quotes, semicolons).
- After finishing any task: run typecheck, lint and build for the part you touched and fix every error before stopping.