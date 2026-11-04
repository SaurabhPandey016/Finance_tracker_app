"use client";

import { Plus, WalletCards } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import { BackendUnavailableCard } from "@/components/shared/BackendUnavailableCard";
import { TransactionFilters, presetRange, type TransactionFilterState } from "@/components/shared/TransactionFilters";
import { TransactionFormDialog } from "@/components/transactions/TransactionFormDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useTransactions } from "@/hooks/useDashboardData";
import { formatCurrency } from "@/lib/format";

export default function TransactionsPage() {
  return <ProtectedRoute><Transactions /></ProtectedRoute>;
}

function Transactions() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
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

  const data = useTransactions({
    from: filters.from,
    to: filters.to,
    categoryId: filters.categoryId,
    type: filters.type,
  }, 50);

  const updateFilters = (next: TransactionFilterState) => {
    const params = new URLSearchParams();
    params.set("range", next.preset);
    if (next.from) params.set("from", next.from);
    if (next.to) params.set("to", next.to);
    if (next.categoryId) params.set("categoryId", next.categoryId);
    if (next.type) params.set("type", next.type);
    router.replace(`/transactions?${params.toString()}`, { scroll: false });
  };

  const items = data.data?.items ?? [];
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-primary">Your activity</p>
          <h1 className="mt-1 font-heading text-3xl font-bold">Transactions</h1>
        </div>
        <Button className="gradient-olive text-white" onClick={() => setDialogOpen(true)}><Plus /> <span className="hidden sm:inline">Add transaction</span></Button>
      </div>
      <div className="mt-6"><TransactionFilters value={filters} onChange={updateFilters} /></div>

      <div className="mt-5">
        {data.loading ? (
          <div className="space-y-3">{[0, 1, 2, 3].map((item) => <Skeleton key={item} className="h-20 rounded-xl" />)}</div>
        ) : data.availabilityError ? <BackendUnavailableCard /> : data.error ? (
          <Card className="p-6 text-center"><p className="text-destructive">Unable to load transactions.</p><Button variant="outline" size="sm" className="mt-3" onClick={() => void data.refetch()}>Retry</Button></Card>
        ) : items.length === 0 ? (
          <Card className="mt-5 p-10 text-center"><p className="text-muted-foreground">No transactions in this range.</p><Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}><Plus /> Add transaction</Button></Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="glass p-4">
                <div className="flex items-center gap-3">
                  <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${item.type === "INCOME" ? "bg-income/15 text-income" : "bg-terracotta/15 text-terracotta"}`}>
                    <WalletCards className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.note || item.category.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.category.name} · {formatDistanceToNow(new Date(item.date), { addSuffix: true })}</p>
                  </div>
                  <p className={`shrink-0 font-bold ${item.type === "INCOME" ? "text-income" : "text-terracotta"}`}>
                    {item.type === "INCOME" ? "+" : "-"}{formatCurrency(item.amount, user?.currency)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      <TransactionFormDialog open={dialogOpen} onOpenChange={setDialogOpen} onSaved={() => void data.refetch()} />
    </main>
  );
}
