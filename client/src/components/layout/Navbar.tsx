"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { Menu, Moon, Sun, Wallet, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { StatusPill } from "@/components/shared/StatusPill";
import { siteConfig } from "@/lib/site-config";

function NavbarContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const themeMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const { user, isAuthenticated } = useAuth();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => { const onScroll = () => setScrolled(window.scrollY > 12); onScroll(); window.addEventListener("scroll", onScroll); return () => window.removeEventListener("scroll", onScroll); }, []);
  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      toast.success("Logged out");
      router.replace("/auth");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not log out");
    }
  };
  const publicLinks = [{ href: "/", label: "Home" }, { href: "/#features", label: "Features" }, { href: "/#how-it-works", label: "How it works" }, { href: "/#faq", label: "FAQ" }];
  const appLinks = [{ href: "/dashboard", label: "Dashboard" }, { href: "/transactions", label: "Transactions" }];
  const links = isAuthenticated ? appLinks : publicLinks;
  const redirect = searchParams.get("redirect");
  const authHref = (tab: "login" | "signup") => redirect
    ? `/auth?tab=${tab}&redirect=${encodeURIComponent(redirect)}`
    : `/auth?tab=${tab}`;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 h-16 transition-all ${scrolled ? "border-b border-border bg-background/85 shadow-lg backdrop-blur-xl" : "glass border-b-transparent"}`}>
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="gradient-olive grid size-9 place-items-center rounded-xl text-white"><Wallet size={20}/></span>
          <span className="font-heading text-xl font-bold">{siteConfig.appName}</span>
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => {
            const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return <Link key={link.href} href={link.href} className={`nav-link py-5 text-sm font-medium ${active ? "active" : "text-muted-foreground"}`}>{link.label}</Link>;
          })}
        </div>
        <div className="flex items-center gap-2">
          <StatusPill />
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
            {themeMounted ? (theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>) : <span className="size-[18px]" aria-hidden="true" />}
          </Button>
          {!isAuthenticated ? (
            <div className="hidden sm:flex sm:gap-2">
              <Button variant="ghost" asChild><Link href={authHref("login")}>Log in</Link></Button>
              <Button className="gradient-olive text-white" asChild><Link href={authHref("signup")}>Get started</Link></Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="rounded-full"><Avatar><AvatarFallback>{user?.name ? user.name.slice(0, 2).toUpperCase() : "FT"}</AvatarFallback></Avatar></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link href="/profile"><User className="mr-2 size-4"/>Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2 size-4"/>Settings</Link></DropdownMenuItem>
                <DropdownMenuItem onClick={logout}><LogOut className="mr-2 size-4"/>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild><Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu"><Menu/></Button></SheetTrigger>
            <SheetContent>
              <div className="mt-8 flex flex-col gap-2">
                <StatusPill mobile />
                {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-4 py-4 text-lg font-semibold hover:bg-accent">{link.label}</Link>)}
                {!isAuthenticated && (
                  <>
                    <Link href={authHref("login")} onClick={() => setMobileOpen(false)} className="mt-3 rounded-xl border px-4 py-4 text-center">Log in</Link>
                    <Link href={authHref("signup")} onClick={() => setMobileOpen(false)} className="gradient-olive mt-2 rounded-xl px-4 py-4 text-center text-white">Get started</Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

export function Navbar() {
  return (
    <Suspense fallback={<header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-border bg-background/85"><div className="mx-auto flex h-full max-w-7xl items-center px-4 sm:px-6"><span className="font-heading text-xl font-bold">{siteConfig.appName}</span></div></header>}>
      <NavbarContent />
    </Suspense>
  );
}
