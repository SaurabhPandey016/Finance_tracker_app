import Link from "next/link";
import { Mail, Wallet } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const columns = [
  ["Product", ["Live demo", "Dashboard", "Transactions", "Charts", "Pricing"]],
  ["Company", ["About", "Careers", "Blog", "Contact"]],
  ["Resources", ["Help Center", "Docs", "FAQ", "Security"]],
  ["Legal", ["Terms of Service", "Privacy Policy", "Cookie Policy"]],
] as const;
const slug = (value: string) => value.toLowerCase().replaceAll(" ", "-");

export function Footer() {
  return <footer className="relative mt-20 border-t border-border bg-card/60"><div className="footer-glow absolute inset-x-0 top-0 h-px"/><div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.35fr_2fr]"><div><Link href="/" className="flex items-center gap-2"><span className="gradient-olive grid size-9 place-items-center rounded-xl text-white"><Wallet size={20}/></span><span className="font-heading text-xl font-bold">{siteConfig.appName}</span></Link><p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">Track every rupee. Understand every habit.</p><div className="mt-5 flex gap-2"><a aria-label="LinkedIn" href={siteConfig.developer.linkedin} target="_blank" rel="noreferrer" className="social-button"><span className="text-xs font-bold">in</span></a><a aria-label="GitHub" href={siteConfig.developer.github} target="_blank" rel="noreferrer" className="social-button"><span className="text-xs font-bold">GH</span></a><a aria-label="Email" href={`mailto:${siteConfig.developer.email}`} className="social-button"><Mail size={18}/></a></div></div><div className="grid grid-cols-2 gap-8 sm:grid-cols-4">{columns.map(([title, links]) => <div key={title}><h3 className="text-sm font-semibold">{title}</h3><ul className="mt-4 space-y-3">{links.map((label) => <li key={label}><Link className="text-sm text-muted-foreground hover:text-primary" href={label === "Live demo" ? "/#demo-availability" : `/${slug(label)}`}>{label}</Link></li>)}</ul></div>)}</div><div className="lg:col-span-2"><div className="rounded-2xl border border-border/70 bg-background/40 p-5"><p className="font-semibold">{siteConfig.developer.name} <span className="font-normal text-muted-foreground">— {siteConfig.developer.role}</span></p><p className="mt-1 text-sm text-muted-foreground">Madhya Pradesh, India · {siteConfig.developer.email}</p><div className="mt-4 flex flex-wrap gap-2">{["Next.js","TypeScript","Tailwind","shadcn/ui","Recharts","Express","Prisma","Supabase"].map((item) => <span key={item} className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs text-primary">{item}</span>)}</div></div></div></div><div className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-sm text-muted-foreground sm:px-6 md:flex-row"><p>© 2026 FinTrack. All rights reserved.</p><p>Made with <span className="heartbeat inline-block text-terracotta">❤️</span> by <a href={siteConfig.developer.linkedin} target="_blank" rel="noreferrer" className="gradient-text font-semibold">{siteConfig.developer.name}</a></p></div></div></footer>;
}

