"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { isBackendUnavailable } from "@/lib/backend-status";
import type { CategoryData, MonthlyData, SummaryData, Transaction } from "@/types/dashboard";
import { useDataRefresh } from "@/store/data-refresh";

export interface DashboardFilters {
  from?: string;
  to?: string;
  type?: "INCOME" | "EXPENSE";
  categoryId?: string;
}

function toQuery(filters: DashboardFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

export function useSummary(filters: DashboardFilters) {
  return useData<SummaryData>(
    `/analytics/summary${toQuery(filters) ? `?${toQuery(filters)}` : ""}`,
  );
}

export function useCategoryBreakdown(filters: DashboardFilters) {
  const params = new URLSearchParams();
  params.set("type", filters.type === "INCOME" ? "INCOME" : "EXPENSE");
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  return useData<CategoryData[]>(`/analytics/by-category?${params.toString()}`);
}

export function useMonthlyTrends(months: number, filters?: DashboardFilters) {
  const params = new URLSearchParams({ months: String(months) });
  if (filters?.from) params.set("from", filters.from);
  if (filters?.to) params.set("to", filters.to);
  if (filters?.type) params.set("type", filters.type);
  if (filters?.categoryId) params.set("categoryId", filters.categoryId);
  return useData<MonthlyData[]>(`/analytics/monthly?${params.toString()}`);
}

export function useTransactions(filters: DashboardFilters, limit = 5) {
  const params = new URLSearchParams({ page: "1", limit: String(limit), sortBy: "date", order: "desc" });
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.type) params.set("type", filters.type);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  return useData<{ items: Transaction[] }>(`/transactions?${params.toString()}`);
}

function useData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [availabilityError, setAvailabilityError] = useState(false);
  const version = useDataRefresh((state) => state.version);

  const requestRef = useRef(0);
  const refetch = useCallback(async () => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setError(null);
    setAvailabilityError(false);
    try {
      const response = await api.get<{ data: T }>(url);
      if (requestId !== requestRef.current) return;
      setData(response.data.data);
    } catch (requestError: unknown) {
      if (requestId !== requestRef.current) return;
      setAvailabilityError(isBackendUnavailable(requestError));
      setError(requestError instanceof ApiError ? requestError : new ApiError("Unable to load data."));
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    let active = true;
    const requestId = ++requestRef.current;
    api.get<{ data: T }>(url).then((response) => {
      if (!active || requestId !== requestRef.current) return;
      setData(response.data.data);
      setError(null);
      setAvailabilityError(false);
      setLoading(false);
    }).catch((requestError: unknown) => {
      if (!active || requestId !== requestRef.current) return;
      setAvailabilityError(isBackendUnavailable(requestError));
      setError(requestError instanceof ApiError ? requestError : new ApiError("Unable to load data."));
      setLoading(false);
    });
    return () => { active = false; };
  }, [url, version]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") void refetch();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refetch]);

  return { data, loading, error, availabilityError, refetch };
}
