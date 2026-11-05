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
  if (loading) return (
    <main className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[.9fr_1.1fr]">
      <aside className="gradient-olive hidden lg:block" />
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
        <div className="glass w-full max-w-md rounded-2xl border border-border/60 p-6 sm:p-8">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="mt-5 h-8 w-48" />
          <Skeleton className="mt-2 h-5 w-64" />
          <Skeleton className="mt-5 h-11 w-full" />
          <Skeleton className="mt-4 h-11 w-full" />
          <Skeleton className="mt-4 h-11 w-full" />
        </div>
      </section>
    </main>
  );
  return !isAuthenticated ? <>{children}</> : null;
}
