"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Eye, EyeOff, LoaderCircle, Quote, Wallet } from "lucide-react";
import { toast } from "sonner";
import { GuestRoute } from "@/components/auth/RouteGuards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useDemoLogin } from "@/hooks/useDemoLogin";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Name must be 50 characters or fewer"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Za-z]/, "Include at least one letter").regex(/[0-9]/, "Include at least one number"),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match",
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

function PasswordStrength({ password }: { password: string }) {
  const checks = [password.length >= 8, /[A-Za-z]/.test(password), /\d/.test(password), password.length >= 12];
  const score = checks.filter(Boolean).length;
  return (
    <div className="mt-2">
      <div className="grid grid-cols-4 gap-1.5">
        {[1, 2, 3, 4].map((level) => (
          <span key={level} className={`h-1 rounded-full ${score >= level ? score <= 1 ? "bg-terracotta" : score <= 2 ? "bg-[#d6a73d]" : "bg-primary" : "bg-muted"}`} />
        ))}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{score === 0 ? "Enter a password" : score <= 1 ? "Weak password" : score <= 3 ? "Good password" : "Strong password"}</p>
    </div>
  );
}

function FieldError({ children }: { children?: string }) {
  return children ? <p className="mt-1.5 text-xs text-terracotta">{children}</p> : null;
}

export default function AuthPage() {
  const params = useSearchParams();
  const router = useRouter();
  const initialSignup = params.get("mode") === "register" || params.get("tab") === "signup";
  const [activeTab, setActiveTab] = useState(initialSignup ? "signup" : "login");
  const [loading, setLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupPassword, setSignupPassword] = useState("");
  const setUser = useAuthStore((state) => state.setUser);
  const { runDemo, loading: demoLoading } = useDemoLogin();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  const changeTab = (tab: string) => {
    setActiveTab(tab);
    const redirect = params.get("redirect");
    const query = new URLSearchParams();
    query.set("tab", tab === "signup" ? "signup" : "login");
    if (redirect) query.set("redirect", redirect);
    router.replace(`/auth?${query.toString()}`, { scroll: false });
  };

  const onLogin = async (values: LoginValues) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", values);
      setUser(response.data.data.user);
      toast.success("Welcome back");
      router.replace(params.get("redirect") || "/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const onSignup = async (values: SignupValues) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/register", {
        name: values.name,
        email: values.email,
        password: values.password,
      });
      setUser(response.data.data.user);
      toast.success("Account created");
      router.replace(params.get("redirect") || "/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create your account");
    } finally {
      setLoading(false);
    }
  };

  const useDemo = () => {
    loginForm.reset({ email: "demo@fintrack.app", password: "Demo@1234" });
    setActiveTab("login");
    runDemo();
  };

  return (
    <GuestRoute>
      <main className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-[.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden gradient-olive p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -left-20 top-20 size-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-20 size-80 rounded-full border border-white/15" />
          <div className="relative flex items-center gap-3 text-white">
            <span className="grid size-11 place-items-center rounded-xl border border-white/15 bg-white/15"><Wallet size={22} /></span>
            <span className="font-heading text-2xl font-bold">FinTrack</span>
          </div>
          <div className="relative max-w-md">
            <h2 className="font-heading text-5xl font-bold leading-tight text-white">Money clarity starts here.</h2>
            <ul className="mt-8 space-y-4 text-white/90">
              {["See every income and expense in one place", "Understand habits with clear charts", "Your transactions stay private and secure"].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="grid size-7 place-items-center rounded-full bg-white/15"><Check size={16} /></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-sm">
            <Quote className="size-5 text-white/70" />
            <p className="mt-3 leading-7">“FinTrack turned my monthly numbers into a habit I can actually understand.”</p>
            <p className="mt-3 text-sm font-semibold text-white/80">Priya S. · Product Designer</p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="glass w-full max-w-md rounded-3xl p-5 sm:p-8">
            <Tabs value={activeTab} onValueChange={changeTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Log in</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-6">
                <h1 className="font-heading text-3xl font-bold">Welcome back</h1>
                <p className="mt-2 text-sm text-muted-foreground">Sign in to continue to FinTrack.</p>
                <form className="mt-7 space-y-5" onSubmit={loginForm.handleSubmit(onLogin)}>
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" autoComplete="email" className="mt-2" {...loginForm.register("email")} />
                    <FieldError>{loginForm.formState.errors.email?.message}</FieldError>
                  </div>
                  <div>
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative mt-2">
                      <Input id="login-password" type={showLoginPassword ? "text" : "password"} autoComplete="current-password" className="pr-10" {...loginForm.register("password")} />
                      <button type="button" aria-label={showLoginPassword ? "Hide password" : "Show password"} onClick={() => setShowLoginPassword((show) => !show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showLoginPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    <FieldError>{loginForm.formState.errors.password?.message}</FieldError>
                  </div>
                  <Button type="submit" className="gradient-olive w-full text-white" disabled={loading || demoLoading}>
                    {loading ? <><LoaderCircle className="mr-2 size-4 animate-spin" />Logging in...</> : "Log in"}
                  </Button>
                </form>
                <Button type="button" variant="outline" className="mt-3 w-full" onClick={useDemo} disabled={loading || demoLoading}>
                  {demoLoading ? "Opening demo..." : "Use demo account"}
                </Button>
              </TabsContent>

              <TabsContent value="signup" className="mt-6">
                <h1 className="font-heading text-3xl font-bold">Create your account</h1>
                <p className="mt-2 text-sm text-muted-foreground">Start building healthier money habits.</p>
                <form className="mt-7 space-y-4" onSubmit={signupForm.handleSubmit(onSignup)}>
                  <div><Label htmlFor="signup-name">Name</Label><Input id="signup-name" autoComplete="name" className="mt-2" {...signupForm.register("name")} /><FieldError>{signupForm.formState.errors.name?.message}</FieldError></div>
                  <div><Label htmlFor="signup-email">Email</Label><Input id="signup-email" type="email" autoComplete="email" className="mt-2" {...signupForm.register("email")} /><FieldError>{signupForm.formState.errors.email?.message}</FieldError></div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative mt-2">
                      <Input id="signup-password" type={showSignupPassword ? "text" : "password"} autoComplete="new-password" className="pr-10" {...signupForm.register("password", { onChange: (event) => setSignupPassword(event.target.value) })} />
                      <button type="button" aria-label={showSignupPassword ? "Hide password" : "Show password"} onClick={() => setShowSignupPassword((show) => !show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showSignupPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                    <PasswordStrength password={signupPassword} />
                    <FieldError>{signupForm.formState.errors.password?.message}</FieldError>
                  </div>
                  <div><Label htmlFor="confirm-password">Confirm password</Label><Input id="confirm-password" type={showSignupPassword ? "text" : "password"} autoComplete="new-password" className="mt-2" {...signupForm.register("confirmPassword")} /><FieldError>{signupForm.formState.errors.confirmPassword?.message}</FieldError></div>
                  <Button type="submit" className="gradient-olive w-full text-white" disabled={loading}>
                    {loading ? <><LoaderCircle className="mr-2 size-4 animate-spin" />Creating account...</> : "Create account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
    </GuestRoute>
  );
}
