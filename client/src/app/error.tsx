"use client";
import { BackendUnavailableCard } from "@/components/shared/BackendUnavailableCard";
import { isBackendUnavailable } from "@/lib/backend-status";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="grid min-h-[60vh] place-items-center px-4"><div className="w-full max-w-xl text-center">{isBackendUnavailable(error) ? <BackendUnavailableCard onRetry={reset}/> : <><h1 className="text-3xl font-bold">Something went wrong</h1><p className="mt-3 text-muted-foreground">FinTrack could not load this page.</p><button className="mt-6 rounded-lg bg-primary px-5 py-3 text-primary-foreground" onClick={reset}>Try again</button></>}</div></main>;
}

