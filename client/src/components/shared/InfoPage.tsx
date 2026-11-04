export function InfoPage({ title }: { title: string }) {
  return <main className="mx-auto min-h-[60vh] max-w-4xl px-4 py-20 sm:px-6"><div className="glass rounded-3xl p-8 sm:p-12"><p className="text-sm font-semibold uppercase tracking-widest text-primary">FinTrack</p><h1 className="mt-3 text-3xl font-bold sm:text-5xl">{title}</h1><p className="mt-6 max-w-2xl text-muted-foreground">This page is part of the FinTrack resource hub. Detailed content will be added as the product evolves.</p></div></main>;
}
