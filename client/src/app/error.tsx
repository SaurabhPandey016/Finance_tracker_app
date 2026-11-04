"use client";
export default function ErrorPage({ reset }: { reset: () => void }) { return <main className="grid min-h-[60vh] place-items-center px-4 text-center"><div><h1 className="text-3xl font-bold">Something went wrong</h1><p className="mt-3 text-muted-foreground">FinTrack could not load this page.</p><button className="mt-6 rounded-lg bg-primary px-5 py-3 text-primary-foreground" onClick={reset}>Try again</button></div></main>; }

