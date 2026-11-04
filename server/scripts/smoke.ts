const baseUrl = `http://localhost:${process.env.PORT ?? 10000}`;
let cookie = "";

const request = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);
  if (cookie) headers.set("cookie", cookie);
  if (options.body) headers.set("content-type", "application/json");
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const setCookie = response.headers.get("set-cookie") ?? "";
  if (setCookie) {
    const pair = setCookie.split(";", 1)[0];
    if (pair.startsWith("token=")) {
      cookie = pair.endsWith("token=") ? "" : pair;
    }
  }
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
};

const report = (name: string, result: { status: number; body: unknown }) => {
  console.log(`${name}: ${result.status} ${JSON.stringify(result.body)}`);
};

const email = `smoke-${Date.now()}@fintrack.app`;
const password = "Smoke1234";

const health = await request("/api/health");
report("Health", health);
const status = await request("/api/status");
report("Status", status);

// Manual resilience test:
// 1. Back up .env, then temporarily set DATABASE_URL and DIRECT_URL to invalid PostgreSQL hosts.
// 2. Start `npm run dev`; keep it running even though database calls fail.
// 3. Verify GET /api/health returns 200, GET /api/status returns database "down",
//    and POST /api/auth/login returns 503 with code "DB_UNAVAILABLE".
// 4. Restore the real DATABASE_URL and DIRECT_URL values before continuing normal smoke tests.

const demoLogin = await request("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: "demo@fintrack.app", password: "Demo@1234" }),
});
report("Demo login for analytics", demoLogin);

const analyticsSummary = await request("/api/analytics/summary");
report("Analytics summary", analyticsSummary);
const analyticsByCategory = await request("/api/analytics/by-category?type=EXPENSE");
report("Analytics by category", analyticsByCategory);
const analyticsMonthly = await request("/api/analytics/monthly?months=6");
report("Analytics monthly", analyticsMonthly);

const summaryBody = analyticsSummary.body as { data?: { totalIncome: number; totalExpense: number; balance: number; savingsRate: number; transactionCount: number } };
const categoryBody = analyticsByCategory.body as { data?: Array<{ percentage: number }> };
const summaryValid = summaryBody.data !== undefined && Math.abs(summaryBody.data.balance - (summaryBody.data.totalIncome - summaryBody.data.totalExpense)) < 0.000001;
const categoryPercentage = categoryBody.data?.reduce((sum, category) => sum + category.percentage, 0) ?? 0;
const categoryValid = categoryBody.data === undefined || categoryBody.data.length === 0 || Math.abs(categoryPercentage - 100) < 0.2;
console.log(`Analytics checks: balance=${summaryValid ? "valid" : "invalid"}, by-category-percentage=${categoryValid ? "~100" : "invalid"}`);
await request("/api/auth/logout", { method: "POST" });

const registered = await request("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ name: "Smoke User", email, password }),
});
report("Register", registered);

const me = await request("/api/auth/me");
report("Get /me with cookie", me);

const updated = await request("/api/auth/me", {
  method: "PATCH",
  body: JSON.stringify({ name: "Updated Smoke User", currency: "USD" }),
});
report("Update profile", updated);

const categoriesResult = await request("/api/categories?type=EXPENSE");
report("List expense categories", categoriesResult);
const categoriesBody = categoriesResult.body as { data?: { categories?: Array<{ id: string; name: string; type: string }> } };
const expenseCategory = categoriesBody.data?.categories?.[0];
const allCategoriesResult = await request("/api/categories?type=INCOME");
const allCategoriesBody = allCategoriesResult.body as { data?: { categories?: Array<{ id: string; name: string; type: string }> } };
const incomeCategory = allCategoriesBody.data?.categories?.[0];

const mismatched = expenseCategory && incomeCategory
  ? await request("/api/transactions", { method: "POST", body: JSON.stringify({ type: "INCOME", categoryId: expenseCategory.id, amount: 1499.5, note: "Mismatch smoke", date: new Date().toISOString() }) })
  : { status: 0, body: null };
report("Mismatched category type", mismatched);

const income = incomeCategory
  ? await request("/api/transactions", { method: "POST", body: JSON.stringify({ type: "INCOME", categoryId: incomeCategory.id, amount: 1499.5, note: "Smoke salary", date: new Date().toISOString() }) })
  : { status: 0, body: null };
report("Create income transaction", income);

const expense = expenseCategory
  ? await request("/api/transactions", { method: "POST", body: JSON.stringify({ type: "EXPENSE", categoryId: expenseCategory.id, amount: 249.25, note: "Smoke groceries", date: new Date().toISOString() }) })
  : { status: 0, body: null };
report("Create expense transaction", expense);

const listFiltered = await request("/api/transactions?page=1&limit=2&type=EXPENSE&search=groceries&sortBy=amount&order=desc");
report("List filtered paginated transactions", listFiltered);

const incomeBody = income.body as { data?: { transaction?: { id: string } } };
const incomeId = incomeBody.data?.transaction?.id;
const updatedTransaction = incomeId
  ? await request(`/api/transactions/${incomeId}`, { method: "PATCH", body: JSON.stringify({ amount: 1500, note: "Updated smoke income" }) })
  : { status: 0, body: null };
report("Update transaction", updatedTransaction);

const firstUserCookie = cookie;
const secondEmail = `second-${Date.now()}@fintrack.app`;
const secondUser = await request("/api/auth/register", { method: "POST", body: JSON.stringify({ name: "Second User", email: secondEmail, password }) });
report("Register second user", secondUser);
const otherUserTransaction = incomeId ? await request(`/api/transactions/${incomeId}`) : { status: 0, body: null };
report("Second user reads first transaction", otherUserTransaction);
cookie = firstUserCookie;

const expenseBody = expense.body as { data?: { transaction?: { id: string } } };
const expenseId = expenseBody.data?.transaction?.id;
const deleted = expenseId ? await request(`/api/transactions/${expenseId}`, { method: "DELETE" }) : { status: 0, body: null };
report("Delete expense transaction", deleted);

const wrongLogin = await request("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password: "Wrong1234" }),
});
report("Login with wrong password", wrongLogin);

const duplicate = await request("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ name: "Smoke User", email, password }),
});
report("Duplicate registration", duplicate);

const logout = await request("/api/auth/logout", { method: "POST" });
report("Logout", logout);

const afterLogout = await request("/api/auth/me");
report("Get /me after logout", afterLogout);

const failed = [health.status !== 200, status.status !== 200,
  demoLogin.status !== 200, analyticsSummary.status !== 200, analyticsByCategory.status !== 200,
  analyticsMonthly.status !== 200, !summaryValid || !categoryValid,
  registered.status !== 201, me.status !== 200, updated.status !== 200,
  mismatched.status !== 400, income.status !== 201, expense.status !== 201, listFiltered.status !== 200,
  updatedTransaction.status !== 200, secondUser.status !== 201, otherUserTransaction.status !== 404,
  deleted.status !== 200, wrongLogin.status !== 401, duplicate.status !== 409, logout.status !== 200,
  afterLogout.status !== 401].some(Boolean);
if (failed) process.exitCode = 1;
