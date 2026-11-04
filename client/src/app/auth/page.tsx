"use client";
import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { GuestRoute } from "@/components/auth/RouteGuards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";

export default function AuthPage() {
  const params = useSearchParams(); const router = useRouter(); const [register, setRegister] = useState(params.get("mode") === "register"); const [loading, setLoading] = useState(false); const setUser = useAuthStore((state) => state.setUser);
  async function submitForm(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); const form = new FormData(event.currentTarget); setLoading(true); try { const payload = register ? { name: String(form.get("name")), email: String(form.get("email")), password: String(form.get("password")) } : { email: String(form.get("email")), password: String(form.get("password")) }; const response = await api.post(register ? "/auth/register" : "/auth/login", payload); setUser(response.data.data.user); toast.success(register ? "Account created" : "Welcome back"); router.replace(params.get("redirect") || "/dashboard"); } catch (error) { toast.error(error instanceof Error ? error.message : "Authentication failed"); } finally { setLoading(false); } }
  return <GuestRoute><main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-md place-items-center px-4 py-16"><div className="glass w-full rounded-3xl p-6 sm:p-8"><h1 className="font-heading text-3xl font-bold">{register ? "Create your account" : "Welcome back"}</h1><p className="mt-2 text-sm text-muted-foreground">{register ? "Start building healthier money habits." : "Sign in to continue to FinTrack."}</p><form className="mt-7 space-y-5" onSubmit={submitForm}>{register && <div><Label htmlFor="name">Name</Label><Input id="name" name="name" minLength={2} required className="mt-2"/></div>}<div><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" required className="mt-2"/></div><div><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" minLength={8} required className="mt-2"/></div><Button className="gradient-olive w-full text-white" disabled={loading}>{loading ? "Please wait..." : register ? "Create account" : "Log in"}</Button></form><button type="button" onClick={() => setRegister(!register)} className="mt-5 w-full text-center text-sm text-muted-foreground">{register ? "Already have an account? Log in" : "New to FinTrack? Create an account"}</button></div></main></GuestRoute>;
}
