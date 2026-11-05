"use client";

import { ArrowDownRight, ArrowUpRight, Plus, Scale, WalletCards } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import { BackendUnavailableCard } from "@/components/shared/BackendUnavailableCard";
import { TransactionFilters, presetRange, type TransactionFilterState } from "@/components/shared/TransactionFilters";
import { TransactionFormDialog } from "@/components/transactions/TransactionFormDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useCategoryBreakdown, useMonthlyTrends, useSummary, useTransactions } from "@/hooks/useDashboardData";
import { formatCurrency } from "@/lib/format";
import type { Transaction } from "@/types/dashboard";
import { formatDateOnly } from "@/lib/date-only";
import { useDataRefresh } from "@/store/data-refresh";

export default function DashboardPage() {
  return <ProtectedRoute><Dashboard /></ProtectedRoute>;
}

function AnimatedNumber({ value, currency }: { value: number; currency?: "INR" | "USD" }) {
  const [display, setDisplay] = useState(0);
  const displayRef = useRef(0);
  useEffect(() => {
    const start = performance.now();
    const duration = 650;
    const from = displayRef.current;
    let frame = 0;
    const tick = (time: number) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + (value - from) * eased;
      displayRef.current = next;
      setDisplay(next);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{formatCurrency(display, currency)}</>;
}

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [months, setMonths] = useState(6);
  const invalidate = useDataRefresh((state) => state.invalidate);
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") invalidate();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [invalidate]);

  const filters = useMemo<TransactionFilterState>(() => {
    const preset = searchParams.get("range") ?? "this-month";
    const range = searchParams.has("from") || searchParams.has("to")
      ? { from: searchParams.get("from") ?? undefined, to: searchParams.get("to") ?? undefined }
      : presetRange(preset);
    return {
      preset,
      ...range,
      categoryId: searchParams.get("categoryId") ?? undefined,
      type: searchParams.get("type") === "INCOME" || searchParams.get("type") === "EXPENSE" ? searchParams.get("type") as "INCOME" | "EXPENSE" : undefined,
    };
  }, [searchParams]);

  const apiFilters = useMemo(() => ({
    from: filters.from,
    to: filters.to,
    categoryId: filters.categoryId,
    type: filters.type,
  }), [filters.from, filters.to, filters.categoryId, filters.type]);

  const summary = useSummary(apiFilters);
  const categories = useCategoryBreakdown(apiFilters);
  const monthly = useMonthlyTrends(months, apiFilters);
  const transactions = useTransactions(apiFilters, 5);

  const updateFilters = (next: TransactionFilterState) => {
    const params = new URLSearchParams();
    params.set("range", next.preset);
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
    if (next.categoryId) params.set("categoryId", next.categoryId);
    if (next.type) params.set("type", next.type);
    router.replace(`/dashboard?${params.toString()}`, { scroll: false });
  };

  const refetchAll = () => {
    void summary.refetch();
    void categories.refetch();
    void monthly.refetch();
    void transactions.refetch();
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "there";
  const recentItems = transactions.data?.items ?? [];

  const summaryError = summary.availabilityError || categories.availabilityError || transactions.availabilityError;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">{greeting}</p>
          <h1 className="mt-1 font-heading text-2xl font-bold sm:text-3xl">{firstName}</h1>
        </div>
        <Button className="gradient-olive text-white shadow-lg" onClick={() => setDialogOpen(true)}>
          <Plus /> Add transaction
        </Button>
      </div>

      <div className="mt-6">
        <TransactionFilters value={filters} onChange={updateFilters} />
      </div>

      {summary.loading && !summary.data ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((item) => <Skeleton key={item} className="h-36 rounded-2xl" />)}
        </div>
      ) : summary.availabilityError ? (
        <div className="mt-5"><BackendUnavailableCard /></div>
      ) : summary.error ? (
        <DataError onRetry={summary.refetch} />
      ) : summary.data && (
        <div className={`mt-5 grid gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 ${summary.loading ? "opacity-70" : ""}`}>
          <SummaryCard title="Total income" value={summary.data.totalIncome} currency={user?.currency} icon={<ArrowUpRight />} iconClass="bg-income/15 text-income" />
          <SummaryCard title="Total expenses" value={summary.data.totalExpense} currency={user?.currency} icon={<ArrowDownRight />} iconClass="bg-terracotta/15 text-terracotta" />
          <SummaryCard title="Balance" value={summary.data.balance} currency={user?.currency} icon={<Scale />} iconClass="bg-amber-gold/15 text-amber-gold" badge={`${summary.data.savingsRate.toFixed(1)}% savings`} />
        </div>
      )}

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="glass overflow-hidden">
          <CardHeader><CardTitle>Spending by category</CardTitle></CardHeader>
          <CardContent className="min-h-80">
            {categories.loading && !categories.data ? <Skeleton className="h-72 w-full" /> :
              categories.availabilityError ? <BackendUnavailableCard /> :
              categories.error ? <DataError onRetry={categories.refetch} /> :
              !categories.data || categories.data.length === 0 ? (
                <EmptyState title="No category expenses yet" action="Add expense" onAction={() => setDialogOpen(true)} />
              ) : <CategoryChart data={categories.data} currency={user?.currency ?? "INR"} />}
          </CardContent>
        </Card>

        <Card className="glass overflow-hidden">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Monthly income vs expenses</CardTitle>
            <Select value={String(months)} onValueChange={(value) => setMonths(Number(value))}>
              <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 months</SelectItem>
                <SelectItem value="6">6 months</SelectItem>
                <SelectItem value="12">12 months</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="min-h-80">
            {monthly.loading && !monthly.data ? <Skeleton className="h-72 w-full" /> :
              monthly.availabilityError ? <BackendUnavailableCard /> :
              monthly.error ? <DataError onRetry={monthly.refetch} /> :
              <MonthlyChart data={monthly.data ?? []} currency={user?.currency ?? "INR"} />}
          </CardContent>
        </Card>
      </div>

      <Card className="glass mt-5">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent transactions</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => router.push("/transactions")}>View all</Button>
        </CardHeader>
        <CardContent>
          {transactions.loading && !transactions.data ? (
            <div className="space-y-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-16" />)}</div>
          ) : transactions.availabilityError ? <BackendUnavailableCard /> :
            transactions.error ? <DataError onRetry={transactions.refetch} /> :
            recentItems.length === 0 ? <EmptyState title="No transactions in this range" action="Add transaction" onAction={() => setDialogOpen(true)} /> :
            <div className="divide-y divide-border/70">
              {recentItems.map((transaction) => <RecentTransaction key={transaction.id} transaction={transaction} currency={user?.currency ?? "INR"} />)}
            </div>}
        </CardContent>
      </Card>

      {summaryError && <span className="sr-only">Some dashboard data is currently unavailable.</span>}

      <TransactionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={refetchAll} />
    </main>
  );
}

function SummaryCard({ title, value, currency, icon, iconClass, badge }: {
  title: string; value: number; currency?: "INR" | "USD"; icon: React.ReactNode; iconClass: string; badge?: string;
}) {
  return (
    <Card className="glass glow-olive/30">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="mt-2 text-xl font-bold sm:text-2xl"><AnimatedNumber value={value} currency={currency} /></p>
          </div>
          <div className={`grid size-11 place-items-center rounded-xl ${iconClass}`}>{icon}</div>
        </div>
        {badge && <Badge className="mt-3 bg-amber-gold/15 text-amber-gold">{badge}</Badge>}
      </CardContent>
    </Card>
  );
}

function CategoryChart({ data, currency }: { data: Array<{ name: string; color: string; total: number; percentage: number }>; currency: "INR" | "USD" }) {
  const total = data.reduce((sum, item) => sum + item.total, 0);
  const percentages = (() => {
    const exact = data.map((item) => item.percentage);
    const floors = exact.map(Math.floor);
    const remaining = 100 - floors.reduce((sum, value) => sum + value, 0);
    const order = exact.map((value, index) => ({ index, fraction: value - floors[index] })).sort((a, b) => b.fraction - a.fraction);
    const result = [...floors];
    for (let index = 0; index < remaining && index < order.length; index++) result[order[index].index] += 1;
    return result;
  })();
  return (
    <div className="grid min-h-72 items-center gap-2 sm:grid-cols-[1fr_180px]">
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="total" nameKey="name" innerRadius="58%" outerRadius="82%" paddingAngle={2} stroke="transparent">
              {data.map((item) => <Cell key={item.name} fill={item.color} />)}
            </Pie>
            <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0), currency)} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-heading text-lg font-bold">{formatCurrency(total, currency)}</p>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="truncate text-muted-foreground">{item.name}</span>
            </span>
            <span className="font-semibold">{percentages[index]}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function compactCurrency(value: number, currency: "INR" | "USD") {
  const symbol = currency === "INR" ? "₹" : "$";
  if (currency === "INR") {
    if (value >= 10_000_000) return `${symbol}${(value / 10_000_000).toFixed(value % 10_000_000 === 0 ? 0 : 1)}Cr`;
    if (value >= 100_000) return `${symbol}${(value / 100_000).toFixed(value % 100_000 === 0 ? 0 : 1)}L`;
  }
  if (value >= 1_000) return `${symbol}${(value / 1_000).toFixed(value % 1_000 === 0 ? 0 : 1)}K`;
  return `${symbol}${Math.round(value)}`;
}

function MonthlyChart({ data, currency }: { data: Array<{ label: string; income: number; expense: number }>; currency: "INR" | "USD" }) {
  return (
    <div className="h-72 min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -16, bottom: 0 }} barGap={4}>
          <CartesianGrid vertical={false} strokeOpacity={0.2} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
          <YAxis width={currency === "INR" ? 64 : 58} tickMargin={4} tickLine={false} axisLine={false} tick={{ fontSize: 11 }} tickFormatter={(value) => compactCurrency(Number(value), currency)} />
          <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0), currency)} />
          <Bar dataKey="income" name="Income" fill="#8da242" radius={[8, 8, 0, 0]} />
          <Bar dataKey="expense" name="Expenses" fill="#c8553d" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function RecentTransaction({ transaction, currency }: { transaction: Transaction; currency: "INR" | "USD" }) {
  const income = transaction.type === "INCOME";
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${income ? "bg-income/15 text-income" : "bg-terracotta/15 text-terracotta"}`} style={{ borderColor: transaction.category.color }}>
        <WalletCards className="size-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">{transaction.note || transaction.category.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{transaction.category.name} · {formatDateOnly(transaction.date)}</p>
      </div>
      <p className={`shrink-0 font-bold ${income ? "text-income" : "text-terracotta"}`}>
        {income ? "+" : "-"}{formatCurrency(transaction.amount, currency)}
      </p>
    </div>
  );
}

function EmptyState({ title, action, onAction }: { title: string; action: string; onAction: () => void }) {
  return (
    <div className="grid min-h-64 place-items-center text-center">
      <div>
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary"><Scale className="size-5" /></div>
        <p className="mt-4 text-sm font-medium">{title}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onAction}><Plus /> {action}</Button>
      </div>
    </div>
  );
}

function DataError({ onRetry }: { onRetry: () => void | Promise<void> }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-xl border border-destructive/20 bg-destructive/5 text-center">
      <div>
        <p className="text-sm font-medium text-destructive">We could not load this data.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => void onRetry()}>Retry</Button>
      </div>
    </div>
  );
}
