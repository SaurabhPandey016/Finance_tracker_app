"use client";

import { CalendarDays, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/types/dashboard";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TransactionFilterState {
  preset: string;
  from?: string;
  to?: string;
  categoryId?: string;
  type?: "INCOME" | "EXPENSE";
}

export function presetRange(preset: string): Pick<TransactionFilterState, "from" | "to"> {
  const now = new Date();
  if (preset === "this-month") return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(), to: endOfDay(now).toISOString() };
  if (preset === "last-month") {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return { from: start.toISOString(), to: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)).toISOString() };
  }
  if (preset === "last-3-months") return { from: new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString(), to: endOfDay(now).toISOString() };
  if (preset === "this-year") return { from: new Date(now.getFullYear(), 0, 1).toISOString(), to: endOfDay(now).toISOString() };
  return {};
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

export function TransactionFilters({ value, onChange }: {
  value: TransactionFilterState;
  onChange: (next: TransactionFilterState) => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [customFrom, setCustomFrom] = useState<Date | undefined>();
  const [customTo, setCustomTo] = useState<Date | undefined>();

  useEffect(() => {
    api.get<{ data: { categories: Category[] } }>(`/categories${value.type ? `?type=${value.type}` : ""}`)
      .then((response) => setCategories(response.data.data.categories))
      .catch(() => setCategories([]));
  }, [value.type]);

  const setPreset = (preset: string) => {
    const range = presetRange(preset);
    onChange({ ...value, preset, ...range });
  };

  return (
    <div className="glass rounded-2xl border p-3 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs value={value.type ?? "ALL"} onValueChange={(next) => onChange({ ...value, type: next === "ALL" ? undefined : next as "INCOME" | "EXPENSE", categoryId: undefined })}>
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="INCOME">Income</TabsTrigger>
            <TabsTrigger value="EXPENSE">Expense</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          <Select value={value.preset} onValueChange={setPreset}>
            <SelectTrigger className="w-[145px]"><CalendarDays className="size-4" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="this-month">This month</SelectItem>
              <SelectItem value="last-month">Last month</SelectItem>
              <SelectItem value="last-3-months">Last 3 months</SelectItem>
              <SelectItem value="this-year">This year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          {value.preset === "custom" && (
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" size="sm"><ChevronDown />{customFrom && customTo ? `${customFrom.toLocaleDateString()} - ${customTo.toLocaleDateString()}` : "Choose dates"}</Button></PopoverTrigger>
              <PopoverContent className="w-auto p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Calendar mode="single" selected={customFrom} onSelect={setCustomFrom} />
                  <Calendar mode="single" selected={customTo} onSelect={setCustomTo} />
                </div>
                <Button size="sm" className="mt-2 w-full" disabled={!customFrom || !customTo} onClick={() => {
                  if (customFrom && customTo) {
                    onChange({ ...value, from: customFrom.toISOString(), to: endOfDay(customTo).toISOString() });
                  }
                }}>Apply range</Button>
              </PopoverContent>
            </Popover>
          )}

          <Select value={value.categoryId ?? "all"} onValueChange={(categoryId) => onChange({ ...value, categoryId: categoryId === "all" ? undefined : categoryId })}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
