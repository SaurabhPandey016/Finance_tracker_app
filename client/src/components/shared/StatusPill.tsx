"use client";
import { useBackendStatus } from "@/providers/BackendStatusProvider";

export function StatusPill({ mobile = false }: { mobile?: boolean }) {
  const { state, dialogOpen, setDialogOpen } = useBackendStatus();
  const copy = state === "online" ? ["Live", "olive", "Server and database are online"] : state === "db-paused" || state === "offline" ? ["Paused", "terracotta", state === "offline" ? "Server could not be reached" : "Demo database is paused"] : [state === "checking" ? "Checking" : "Waking up", "amber", state === "checking" ? "Checking backend status" : "Demo server is starting"];
  return <button type="button" aria-label={`Backend status: ${copy[0]}. ${copy[2]}`} aria-live="polite" title={copy[2]} onClick={() => setDialogOpen(!dialogOpen)} className={`inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-xs font-semibold ${mobile ? "w-fit" : "hidden sm:inline-flex"}`}><span className={`size-2 rounded-full ${copy[1] === "olive" ? "bg-primary" : copy[1] === "amber" ? "animate-pulse bg-[#d6a73d]" : "bg-terracotta"}`}/><span>{copy[0]}</span></button>;
}
