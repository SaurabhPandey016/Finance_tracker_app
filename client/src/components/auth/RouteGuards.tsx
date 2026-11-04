"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !isAuthenticated) router.replace(`/auth?redirect=${encodeURIComponent(window.location.pathname)}`); }, [isAuthenticated, loading, router]);
  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-12 w-full"/><Skeleton className="h-64 w-full"/></div>;
  return isAuthenticated ? <>{children}</> : null;
}

export function GuestRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && isAuthenticated) router.replace("/dashboard"); }, [isAuthenticated, loading, router]);
  if (loading) return null;
  return !isAuthenticated ? <>{children}</> : null;
}
