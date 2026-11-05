const baseUrl = `http://localhost:${process.env.PORT ?? 10000}`;
let cookie = "";

const request = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);
  if (cookie) headers.set("cookie", cookie);
  if (options.body) headers.set("content-type", "application/json");
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie?.startsWith("token=")) cookie = setCookie.split(";", 1)[0];
  const body = await response.json().catch(() => null);
  return { status: response.status, body: body as Record<string, unknown> };
};

const pass = (name: string, ok: boolean) => console.log(`${ok ? "PASS" : "FAIL"} ${name}`);

await request("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email: "demo@fintrack.app", password: "Demo@1234" }),
});

const expenseCategories = await request("/api/categories?type=EXPENSE");
const incomeCategories = await request("/api/categories?type=INCOME");
const categoryData = expenseCategories.body.data as { categories: Array<{ id: string }> } | undefined;
const incomeData = incomeCategories.body.data as { categories: Array<{ id: string }> } | undefined;
const expenseCategoryId = categoryData?.categories[0]?.id;
const incomeCategoryId = incomeData?.categories[0]?.id;
if (!expenseCategoryId || !incomeCategoryId) {
  console.log("FAIL category setup");
  process.exit(1);
}

const today = new Date();
const first = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-01`;
const last = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)).getUTCDate()).padStart(2, "0")}`;
const createdIds: string[] = [];

try {
  const todayOnly = `${today.getUTCFullYear()}-${String(today.getUTCMonth() + 1).padStart(2, "0")}-${String(today.getUTCDate()).padStart(2, "0")}`;
  const transactions = [
    { type: "INCOME", categoryId: incomeCategoryId, amount: 12345, date: first, note: "accuracy-income" },
    { type: "EXPENSE", categoryId: expenseCategoryId, amount: 2345, date: first, note: "accuracy-expense-1" },
    ...(last <= todayOnly ? [{ type: "EXPENSE", categoryId: expenseCategoryId, amount: 3456, date: last, note: "accuracy-expense-last" }] : []),
  ] as Array<{ type: string; categoryId: string; amount: number; date: string; note: string }>;
  for (const transaction of transactions) {
    const created = await request("/api/transactions", {
      method: "POST",
      body: JSON.stringify(transaction),
    });
    const createdData = created.body.data as { id?: string } | undefined;
    if (createdData?.id) createdIds.push(createdData.id);
  }

  const summaryResponse = await request(`/api/analytics/summary?from=${first}&to=${last}`);
  const summary = (summaryResponse.body.data ?? {}) as { totalIncome?: number; totalExpense?: number };
  const transactionItems: Array<{ type: string; amount: number }> = [];
  let accuracyPage = 1;
  while (true) {
    const transactionResponse = await request(`/api/transactions?limit=50&page=${accuracyPage}&sortBy=date&order=desc&from=${first}&to=${last}`);
    const transactionPage = transactionResponse.body.data as { items: Array<{ type: string; amount: number }>; pagination: { hasNext: boolean } };
    transactionItems.push(...transactionPage.items);
    if (!transactionPage.pagination.hasNext) break;
    accuracyPage += 1;
  }
  const income = transactionItems.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + item.amount, 0);
  const expense = transactionItems.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + item.amount, 0);

  pass("Summary income equals test transactions", summary.totalIncome === income);
  pass("Summary expense equals test transactions", summary.totalExpense === expense);
  const categoriesResponse = await request(`/api/analytics/by-category?type=EXPENSE&from=${first}&to=${last}`);
  const categories = (categoriesResponse.body.data ?? []) as Array<{ total: number }>;
  pass("By-category total equals expense", categories.reduce((sum, item) => sum + item.total, 0) === expense);
  const monthlyResponse = await request("/api/analytics/monthly?months=6");
  const monthly = (monthlyResponse.body.data ?? []) as Array<{ month: string; income: number; expense: number }>;
  const monthKey = first.slice(0, 7);
  const current = monthly.find((item) => item.month === monthKey);
  pass("Current month matches this-month summary", current?.income === summary.totalIncome && current?.expense === summary.totalExpense);

  if (last <= todayOnly) {
    const lastDayResponse = await request(`/api/analytics/summary?from=${last}&to=${last}`);
    const lastDay = (lastDayResponse.body.data ?? {}) as { totalExpense?: number };
    pass("Last day of month is included", (lastDay.totalExpense ?? 0) >= 3456);
  } else {
    const rejected = await request("/api/transactions", {
      method: "POST",
      body: JSON.stringify({ type: "EXPENSE", categoryId: expenseCategoryId, amount: 3456, date: last, note: "accuracy-future-rejected" }),
    });
    pass("Future-dated last-day transaction is rejected", rejected.status === 400);
  }
} finally {
  for (const id of createdIds) await request(`/api/transactions/${id}`, { method: "DELETE" });
  await request("/api/auth/logout", { method: "POST" });
}
