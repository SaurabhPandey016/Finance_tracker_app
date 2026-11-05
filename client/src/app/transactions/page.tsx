"use client";

import {
  Download, Pencil, Plus, Search, Trash2, WalletCards,
} from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import { BackendUnavailableCard } from "@/components/shared/BackendUnavailableCard";
import { TransactionFilters, presetRange, type TransactionFilterState } from "@/components/shared/TransactionFilters";
import { TransactionFormDialog } from "@/components/transactions/TransactionFormDialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { isBackendUnavailable } from "@/lib/backend-status";
import { formatCurrency } from "@/lib/format";
import { formatDateOnly, todayDateOnly } from "@/lib/date-only";
import { useDataRefresh } from "@/store/data-refresh";
import type { Transaction } from "@/types/dashboard";

interface TransactionPageData {
  items: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export default function TransactionsPage() {
  return <ProtectedRoute><Transactions /></ProtectedRoute>;
}

function Transactions() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = useState<TransactionPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState(false);
  const [error, setError] = useState(false);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [deleting, setDeleting] = useState<Transaction | undefined>();
  const requestVersion = useRef(0);
  const refreshVersion = useDataRefresh((state) => state.version);
  const invalidate = useDataRefresh((state) => state.invalidate);

  const filters = useMemo<TransactionFilterState>(() => {
    const preset = searchParams.get("range") ?? "all";
    const range = searchParams.has("from") || searchParams.has("to")
      ? { from: searchParams.get("from") ?? undefined, to: searchParams.get("to") ?? undefined }
      : presetRange(preset);
    return {
      preset,
      ...range,
      categoryId: searchParams.get("categoryId") ?? undefined,
      type: searchParams.get("type") === "INCOME" || searchParams.get("type") === "EXPENSE"
        ? searchParams.get("type") as "INCOME" | "EXPENSE"
        : undefined,
    };
  }, [searchParams]);

  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = [10, 20, 50].includes(Number(searchParams.get("limit"))) ? Number(searchParams.get("limit")) : 10;
  const sortBy = searchParams.get("sortBy") === "amount" ? "amount" : "date";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const search = searchParams.get("search") ?? "";

  const fetchTransactions = async () => {
    const version = ++requestVersion.current;
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        sortBy,
        order,
      });
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.type) params.set("type", filters.type);
      if (search) params.set("search", search);
      const response = await api.get<{ data: TransactionPageData }>(`/transactions?${params.toString()}`);
      if (version !== requestVersion.current) return;
      setData(response.data.data);
      setError(false);
      setAvailabilityError(false);
      setLoading(false);
    } catch (requestError: unknown) {
      if (version !== requestVersion.current) return;
      setError(true);
      setAvailabilityError(isBackendUnavailable(requestError));
      setLoading(false);
    }
  };

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") invalidate();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [invalidate]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      sortBy,
      order,
    });
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.type) params.set("type", filters.type);
    if (search) params.set("search", search);
    api.get<{ data: TransactionPageData }>(`/transactions?${params.toString()}`)
      .then((response) => {
        if (!active) return;
        setData(response.data.data);
        setError(false);
        setAvailabilityError(false);
        setLoading(false);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(true);
        setAvailabilityError(isBackendUnavailable(requestError));
        setLoading(false);
      });
    return () => { active = false; };
  }, [page, limit, sortBy, order, search, filters.from, filters.to, filters.categoryId, filters.type, refreshVersion]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (searchInput !== search) {
        const params = new URLSearchParams(searchParams.toString());
        if (searchInput) params.set("search", searchInput);
        else params.delete("search");
        params.set("page", "1");
        router.replace(`/transactions?${params.toString()}`, { scroll: false });
      }
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [searchInput, search, router, searchParams]);

  const updateUrl = (changes: Record<string, string | undefined>, replace = true) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined) params.delete(key);
      else params.set(key, value);
    });
    router[replace ? "replace" : "push"](`/transactions?${params.toString()}`, { scroll: false });
  };

  const updateFilters = (next: TransactionFilterState) => {
    const changes: Record<string, string | undefined> = {
      range: next.preset,
      from: next.from,
      to: next.to,
      categoryId: next.categoryId,
      type: next.type,
      page: "1",
    };
    const params = new URLSearchParams();
    Object.entries(changes).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (search) params.set("search", search);
    params.set("limit", String(limit));
    params.set("sortBy", sortBy);
    params.set("order", order);
    router.replace(`/transactions?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    router.replace("/transactions", { scroll: false });
    setSearchInput("");
  };

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "1000",
        sortBy,
        order,
      });
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      if (filters.categoryId) params.set("categoryId", filters.categoryId);
      if (filters.type) params.set("type", filters.type);
      if (search) params.set("search", search);
      const response = await api.get<{ data: TransactionPageData }>(`/transactions?${params.toString()}`);
      const rows = [
        ["Date", "Category", "Type", "Note", "Amount", "Currency"],
        ...response.data.data.items.map((item) => [
          item.date.slice(0, 10),
          item.category.name,
          item.type,
          item.note ?? "",
          String(item.amount),
          user?.currency ?? "INR",
        ]),
      ];
      const csv = rows.map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(",")).join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `fintrack-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch (requestError: unknown) {
      toast.error(requestError instanceof Error ? requestError.message : "Unable to export transactions");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const removed = deleting;
    const previousItems = data?.items ?? [];
    const previousIndex = previousItems.findIndex((item) => item.id === removed.id);
    setData((current) => current ? {
      ...current,
      items: current.items.filter((item) => item.id !== removed.id),
      pagination: { ...current.pagination, total: Math.max(0, current.pagination.total - 1) },
    } : current);
    setDeleting(undefined);
    invalidate();
    try {
      await api.delete(`/transactions/${removed.id}`);
      toast.success(`${removed.note || removed.category.name} deleted`);
      void fetchTransactions();
    } catch (requestError: unknown) {
      setData((current) => {
        if (!current) return current;
        const items = [...current.items];
        items.splice(Math.max(0, previousIndex), 0, removed);
        return { ...current, items, pagination: { ...current.pagination, total: current.pagination.total + 1 } };
      });
      toast.error(requestError instanceof Error ? requestError.message : "Unable to delete transaction");
      invalidate();
    }
  };

  const openEdit = (transaction: Transaction) => {
    setEditing(transaction);
    setDialogOpen(true);
  };

  const hasActiveFilters = Boolean(search || filters.categoryId || filters.type || (filters.preset && filters.preset !== "all"));
  const items = data?.items ?? [];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-primary">Your activity</p>
          <h1 className="mt-1 font-heading text-3xl font-bold">Transactions</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void exportCsv()}><Download /> <span className="hidden sm:inline">Export CSV</span></Button>
          <Button className="gradient-olive text-white" onClick={() => { setEditing(undefined); setDialogOpen(true); }}>
            <Plus /> <span className="hidden sm:inline">Add transaction</span>
          </Button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <TransactionFilters value={filters} onChange={updateFilters} />
        <div className="glass flex flex-col gap-3 rounded-2xl border p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Search transaction notes"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search notes..."
              className="pl-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Select value={sortBy} onValueChange={(value) => updateUrl({ sortBy: value, page: "1" })}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="date">Sort by Date</SelectItem><SelectItem value="amount">Sort by Amount</SelectItem></SelectContent>
            </Select>
            <Select value={order} onValueChange={(value) => updateUrl({ order: value, page: "1" })}>
              <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="desc">Descending</SelectItem><SelectItem value="asc">Ascending</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="mt-5">
        {loading ? <LoadingRows /> :
          availabilityError ? <BackendUnavailableCard /> :
          error ? <Card className="p-6 text-center"><p className="text-destructive">Unable to load transactions.</p><Button variant="outline" size="sm" className="mt-3" onClick={() => void fetchTransactions()}>Retry</Button></Card> :
          items.length === 0 ? (
            <Card className="p-10 text-center">
              <p className="font-medium">{hasActiveFilters ? "No results for these filters" : "No transactions yet"}</p>
              {hasActiveFilters ? (
                <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear filters</Button>
              ) : (
                <Button className="mt-4 gradient-olive text-white" onClick={() => { setEditing(undefined); setDialogOpen(true); }}><Plus /> Add transaction</Button>
              )}
            </Card>
          ) : (
            <>
              <TransactionTable items={items} currency={user?.currency ?? "INR"} onEdit={openEdit} onDelete={setDeleting} />
              <TransactionCards items={items} currency={user?.currency ?? "INR"} onEdit={openEdit} onDelete={setDeleting} />
            </>
          )}
      </div>

      {!loading && data && data.items.length > 0 && (
        <PaginationBar
          data={data}
          onPage={(next) => updateUrl({ page: String(next) })}
          onLimit={(next) => updateUrl({ limit: next, page: "1" })}
        />
      )}

      <TransactionFormDialog
        key={editing?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        transaction={editing}
        onSaved={() => { invalidate(); void fetchTransactions(); }}
      />

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(undefined); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The transaction will be removed from your account.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => void confirmDelete()}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function dateHeading(dateValue: string) {
  const value = dateValue.slice(0, 10);
  const today = todayDateOnly();
  if (value === today) return "Today";
  const [year, month, day] = today.split("-").map(Number);
  const yesterday = new Date(year, month - 1, day - 1);
  const yesterdayOnly = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;
  if (value === yesterdayOnly) return "Yesterday";
  return formatDateOnly(value);
}

function groupTransactions(items: Transaction[]) {
  const groups = new Map<string, Transaction[]>();
  items.forEach((item) => {
    const heading = dateHeading(item.date);
    groups.set(heading, [...(groups.get(heading) ?? []), item]);
  });
  return Array.from(groups.entries());
}

function TransactionTable({ items, currency, onEdit, onDelete }: {
  items: Transaction[];
  currency: "INR" | "USD";
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  return (
    <Card className="glass hidden overflow-hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Note</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groupTransactions(items).map(([heading, groupedItems]) => (
            <Fragment key={heading}>
              <TableRow key={`${heading}-heading`} className="hover:bg-transparent">
                <TableCell colSpan={6} className="bg-muted/40 py-2 font-heading text-xs font-semibold text-muted-foreground">{heading}</TableCell>
              </TableRow>
              {groupedItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-muted-foreground">{formatDateOnly(item.date)}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1">
                      <span className="size-2 rounded-full" style={{ backgroundColor: item.category.color }} />
                      <WalletCards className="size-3.5 text-muted-foreground" />
                      <span>{item.category.name}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={item.type === "INCOME" ? "border-income/30 text-income" : "border-terracotta/30 text-terracotta"}>
                      {item.type === "INCOME" ? "Income" : "Expense"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-52 truncate text-muted-foreground">{item.note || "-"}</TableCell>
                  <TableCell className={`text-right font-bold ${item.type === "INCOME" ? "text-income" : "text-terracotta"}`}>
                    {item.type === "INCOME" ? "+" : "-"}{formatCurrency(item.amount, currency)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label={`Edit ${item.note || item.category.name}`} onClick={() => onEdit(item)}><Pencil /></Button>
                      <Button variant="ghost" size="icon-sm" aria-label={`Delete ${item.note || item.category.name}`} className="text-destructive hover:text-destructive" onClick={() => onDelete(item)}><Trash2 /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function TransactionCards({ items, currency, onEdit, onDelete }: {
  items: Transaction[];
  currency: "INR" | "USD";
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}) {
  return (
    <div className="space-y-5 md:hidden">
      {groupTransactions(items).map(([heading, groupedItems]) => (
        <section key={heading}>
          <h2 className="mb-2 px-1 text-xs font-semibold text-muted-foreground">{heading}</h2>
          <div className="space-y-2">
            {groupedItems.map((item) => (
              <Card key={item.id} className="glass p-3">
                <div className="flex items-start gap-3">
                  <div className={`grid size-10 shrink-0 place-items-center rounded-xl ${item.type === "INCOME" ? "bg-income/15 text-income" : "bg-terracotta/15 text-terracotta"}`}>
                    <WalletCards className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{item.note || item.category.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.category.name} · {formatDateOnly(item.date)}</p>
                      </div>
                      <p className={`shrink-0 font-bold ${item.type === "INCOME" ? "text-income" : "text-terracotta"}`}>
                        {item.type === "INCOME" ? "+" : "-"}{formatCurrency(item.amount, currency)}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline" className={item.type === "INCOME" ? "border-income/30 text-income" : "border-terracotta/30 text-terracotta"}>
                        {item.type === "INCOME" ? "Income" : "Expense"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon-sm" aria-label={`Edit ${item.note || item.category.name}`} onClick={() => onEdit(item)}><Pencil /></Button>
                        <Button variant="ghost" size="icon-sm" aria-label={`Delete ${item.note || item.category.name}`} className="text-destructive hover:text-destructive" onClick={() => onDelete(item)}><Trash2 /></Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {[0, 1, 2, 3, 4].map((item) => <Skeleton key={item} className="h-16 rounded-xl" />)}
    </div>
  );
}

function PaginationBar({ data, onPage, onLimit }: {
  data: TransactionPageData;
  onPage: (page: number) => void;
  onLimit: (limit: string) => void;
}) {
  const { page, limit, total, hasPrev, hasNext } = data.pagination;
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border bg-card/40 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">Showing {start}-{end} of {total}</p>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Select value={String(limit)} onValueChange={onLimit}>
          <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="10">10 / page</SelectItem><SelectItem value="20">20 / page</SelectItem><SelectItem value="50">50 / page</SelectItem></SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={!hasPrev} onClick={() => onPage(page - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={!hasNext} onClick={() => onPage(page + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
