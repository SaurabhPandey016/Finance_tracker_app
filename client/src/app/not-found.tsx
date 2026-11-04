import Link from "next/link";
export default function NotFound() { return <main className="grid min-h-[60vh] place-items-center px-4 text-center"><div><p className="gradient-text text-7xl font-bold">404</p><h1 className="mt-4 text-2xl font-bold">Page not found</h1><Link href="/" className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 text-primary-foreground">Back home</Link></div></main>; }
