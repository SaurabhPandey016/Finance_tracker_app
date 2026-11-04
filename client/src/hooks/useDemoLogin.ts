"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useBackendStatus } from "@/providers/BackendStatusProvider";
import { useAuthStore } from "@/store/auth-store";

export function useDemoLogin() {
  const router = useRouter();
  const { state, dialogOpen, setDialogOpen } = useBackendStatus();
  const setUser = useAuthStore((current) => current.setUser);
  const [loading, setLoading] = useState(false);
  const waitingForOnline = useRef(false);

  const login = useCallback(async () => {
    try {
      const response = await api.post("/auth/login", {
        email: "demo@fintrack.app",
        password: "Demo@1234",
      });
      setUser(response.data.data.user);
      toast.success("Demo account ready");
      router.replace("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the demo");
      setLoading(false);
    }
  }, [router, setUser]);

  useEffect(() => {
    if (!waitingForOnline.current) return;
    let timer: number | undefined;

    if (state === "online") {
      waitingForOnline.current = false;
      timer = window.setTimeout(() => void login(), 0);
    } else if (state === "db-paused" || state === "offline") {
      waitingForOnline.current = false;
      timer = window.setTimeout(() => setLoading(false), 0);
    } else if (!dialogOpen) {
      waitingForOnline.current = false;
      timer = window.setTimeout(() => setLoading(false), 0);
    }

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [dialogOpen, login, state]);

  const runDemo = useCallback(() => {
    if (loading) return;
    setLoading(true);

    if (state === "online") {
      void login();
      return;
    }

    if (state === "checking" || state === "waking") {
      waitingForOnline.current = true;
      setDialogOpen(true);
      return;
    }

    waitingForOnline.current = false;
    setDialogOpen(true);
    setLoading(false);
  }, [loading, login, setDialogOpen, state]);

  return { runDemo, loading };
}
