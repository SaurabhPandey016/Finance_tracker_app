"use client";
import { CloudOff, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { useBackendStatus } from "@/providers/BackendStatusProvider";

export function BackendUnavailableCard({ onRetry }: { onRetry?: () => void }) {
  const { retryNow, secondsWaiting } = useBackendStatus();
  const retry = () => { retryNow(); onRetry?.(); };
  return <div role="alert" aria-live="polite" className="glass flex flex-col gap-4 rounded-2xl border border-amber-500/20 p-5 sm:flex-row sm:items-center"><CloudOff className="size-7 shrink-0 text-[#d6a73d]"/><div className="flex-1"><p className="font-semibold">FinTrack is waking up</p><p className="mt-1 text-sm text-muted-foreground">The demo server is temporarily unavailable.{secondsWaiting > 0 ? ` Waiting ${secondsWaiting}s.` : " Please retry shortly."}</p></div><div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" onClick={retry}><RotateCcw className="mr-2 size-4"/>Retry</Button><Link href={siteConfig.demoRequestMailto} className="text-sm font-medium text-primary underline underline-offset-4">Request a live demo</Link></div></div>;
}
