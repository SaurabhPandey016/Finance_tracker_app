"use client";

import { useEffect, type ReactNode } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export function AuthProvider({ children }: { children: ReactNode }) {
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);

  useEffect(() => {
    api.get("/auth/me").then((response) => setUser(response.data.data.user)).catch(() => setUser(null)).finally(() => setLoading(false));
  }, [setLoading, setUser]);

  return <>{children}</>;
}
