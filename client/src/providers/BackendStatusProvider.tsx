"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { BackendStatusDialog } from "@/components/shared/BackendStatusDialog";
import { checkBackendStatus, type BackendStatus } from "@/lib/backend-status";

interface BackendStatusContextValue { state: BackendStatus; lastChecked: Date | null; secondsWaiting: number; retryNow: () => void; isReady: boolean; dialogOpen: boolean; setDialogOpen: (open: boolean) => void; }
const BackendStatusContext = createContext<BackendStatusContextValue | null>(null);

export function BackendStatusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BackendStatus>("checking"); const [lastChecked, setLastChecked] = useState<Date | null>(null); const [secondsWaiting, setSecondsWaiting] = useState(0); const [dialogOpen, setDialogOpen] = useState(false);
  const unavailableSince = useRef<number | null>(null); const wakingStarted = useRef<number | null>(null); const inFlight = useRef(false); const timer = useRef<ReturnType<typeof setInterval> | null>(null); const previousState = useRef<BackendStatus>("checking");

  const runCheck = useCallback(async () => {
    if (inFlight.current) return; inFlight.current = true; const started = Date.now();
    const slowTimer = window.setTimeout(() => { if (!unavailableSince.current) unavailableSince.current = started; if (!wakingStarted.current) wakingStarted.current = started; setState("waking"); }, 4000);
    const result = await checkBackendStatus(60000); window.clearTimeout(slowTimer); setLastChecked(new Date());
        if (result.kind === "online") { unavailableSince.current = null; wakingStarted.current = null; setSecondsWaiting(0); setState((current) => { previousState.current = current; return "online"; }); }
        else if (result.kind === "db-paused") { if (!unavailableSince.current) unavailableSince.current = Date.now(); setState((current) => { previousState.current = current; return "db-paused"; }); }
        else { if (!unavailableSince.current) unavailableSince.current = Date.now(); if (!wakingStarted.current) wakingStarted.current = Date.now(); const elapsed = Date.now() - unavailableSince.current; setState((current) => { previousState.current = current; return elapsed >= 180000 ? "offline" : "waking"; }); }
    inFlight.current = false;
      }, []);

  useEffect(() => { const timeout = window.setTimeout(() => void runCheck(), 0); return () => window.clearTimeout(timeout); }, [runCheck]);
  useEffect(() => { if (timer.current) clearInterval(timer.current); timer.current = setInterval(() => { if (state === "online") { if (document.visibilityState === "visible") void runCheck(); } else void runCheck(); }, state === "online" ? 60000 : 5000); return () => { if (timer.current) clearInterval(timer.current); }; }, [state, runCheck]);
  useEffect(() => { if (state !== "waking") return; const id = window.setInterval(() => { if (wakingStarted.current) setSecondsWaiting(Math.floor((Date.now() - wakingStarted.current) / 1000)); }, 1000); return () => window.clearInterval(id); }, [state]);
  useEffect(() => { const handleUnavailable = () => { setDialogOpen(true); void runCheck(); }; window.addEventListener("fintrack:backend-unavailable", handleUnavailable); return () => window.removeEventListener("fintrack:backend-unavailable", handleUnavailable); }, [runCheck]);
  useEffect(() => { if (state === "online" && previousState.current !== "online" && dialogOpen) { toast.success("Server is ready"); const timeout = window.setTimeout(() => setDialogOpen(false), 1500); return () => window.clearTimeout(timeout); } }, [state, dialogOpen]);

  const value = useMemo(() => ({ state, lastChecked, secondsWaiting, retryNow: () => void runCheck(), isReady: state === "online", dialogOpen, setDialogOpen }), [state, lastChecked, secondsWaiting, runCheck, dialogOpen]);
  return <BackendStatusContext.Provider value={value}>{children}<BackendStatusDialog/></BackendStatusContext.Provider>;
}

export function useBackendStatus() { const context = useContext(BackendStatusContext); if (!context) throw new Error("useBackendStatus must be used within BackendStatusProvider"); return context; }
