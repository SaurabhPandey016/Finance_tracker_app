import { Prisma, TransactionType } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { buildTransactionWhere, endDateOnlyUtc, parseDateOnlyUtc, type TransactionFilters } from "./transaction.service.js";

const minorToMajor = (minor: number): number => minor / 100;

interface MonthlyRow {
  month: Date;
  income: bigint;
  expense: bigint;
}

export const analyticsService = {
  async summary(userId: string, filters: Omit<TransactionFilters, "userId">) {
    const where = buildTransactionWhere({ userId, ...filters });
    const [income, expense, transactionCount] = await prisma.$transaction([
      prisma.transaction.aggregate({ where: { ...where, type: TransactionType.INCOME }, _sum: { amountMinor: true }, _count: { _all: true } }),
      prisma.transaction.aggregate({ where: { ...where, type: TransactionType.EXPENSE }, _sum: { amountMinor: true }, _count: { _all: true } }),
      prisma.transaction.count({ where }),
    ]);

    const totalIncomeMinor = income._sum.amountMinor ?? 0;
    const totalExpenseMinor = expense._sum.amountMinor ?? 0;
    const balanceMinor = totalIncomeMinor - totalExpenseMinor;
    const totalIncome = minorToMajor(totalIncomeMinor);
    const totalExpense = minorToMajor(totalExpenseMinor);
    const balance = minorToMajor(balanceMinor);
    const savingsRate = totalIncomeMinor === 0 ? 0 : Number((((totalIncomeMinor - totalExpenseMinor) / totalIncomeMinor) * 100).toFixed(2));

    return { totalIncome, totalExpense, balance, savingsRate, transactionCount };
  },

  async byCategory(userId: string, type: TransactionType, filters: { from?: string; to?: string; categoryId?: string }) {
    const where = buildTransactionWhere({ userId, type, ...filters });
    const groups = await prisma.transaction.groupBy({
      by: ["categoryId"], where, _sum: { amountMinor: true }, orderBy: { _sum: { amountMinor: "desc" } } });
    const categoryIds = groups.map((group) => group.categoryId);
    const categories = categoryIds.length === 0 ? [] : await prisma.category.findMany({ where: { id: { in: categoryIds } }, select: { id: true, name: true, color: true, icon: true } });
    const categoryMap = new Map(categories.map((category) => [category.id, category]));
    const totalMinor = groups.reduce((sum, group) => sum + (group._sum.amountMinor ?? 0), 0);

    return groups.flatMap((group) => {
      const category = categoryMap.get(group.categoryId);
      const minor = group._sum.amountMinor ?? 0;
      return category ? [{ categoryId: category.id, name: category.name, color: category.color, icon: category.icon,
        total: minorToMajor(minor), percentage: totalMinor === 0 ? 0 : Number(((minor / totalMinor) * 100).toFixed(2)) }] : [];
    });
  },

  async monthly(userId: string, months: number, filters: Omit<TransactionFilters, "userId"> = {}) {
    const now = new Date();
    const firstMonth = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    const endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const start = filters.from ? parseDateOnlyUtc(filters.from) : firstMonth;
    const end = filters.to ? endDateOnlyUtc(filters.to) : endOfCurrentMonth;

    const rows = await prisma.$queryRaw<MonthlyRow[]>(Prisma.sql`
      SELECT date_trunc('month', date) AS month,
        COALESCE(SUM(CASE WHEN type = 'INCOME' THEN "amountMinor" ELSE 0 END), 0)::bigint AS income,
        COALESCE(SUM(CASE WHEN type = 'EXPENSE' THEN "amountMinor" ELSE 0 END), 0)::bigint AS expense
      FROM "Transaction"
      WHERE "userId" = ${userId}
        AND date >= ${start}
        AND date <= ${end}
        ${filters.type ? Prisma.sql`AND type = ${filters.type}::"TransactionType"` : Prisma.empty}
        ${filters.categoryId ? Prisma.sql`AND "categoryId" = ${filters.categoryId}` : Prisma.empty}
      GROUP BY date_trunc('month', date)
      ORDER BY month ASC
    `);

    const values = new Map(rows.map((row) => {
      const key = row.month.toISOString().slice(0, 7);
      return [key, {
        incomeMinor: Number(row.income),
        expenseMinor: Number(row.expense),
      }] as const;
    }));

    const result = [];
    for (let index = 0; index < months; index++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - months + 1 + index, 1);
      const month = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
      const label = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(monthDate);
      const totals = values.get(month) ?? { incomeMinor: 0, expenseMinor: 0 };
      const income = minorToMajor(totals.incomeMinor);
      const expense = minorToMajor(totals.expenseMinor);
      result.push({ month, label, income, expense, net: income - expense });
    }
    return result;
  },
};
