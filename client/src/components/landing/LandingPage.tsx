"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, BarChart3, Filter, LayoutDashboard, LockKeyhole, PieChartIcon, ShieldCheck, Smartphone, Plus, MousePointerClick, TrendingUp, Quote } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/shared/StatusPill";
import { useDemoLogin } from "@/hooks/useDemoLogin";
import { DemoAvailability } from "./DemoAvailability";
import { DashboardPreview } from "./DashboardPreview";
import { Reveal } from "./Reveal";
import { CountUp } from "./CountUp";

const categoryData = [
  { name: "Food", value: 420 }, { name: "Rent", value: 680 },
  { name: "Travel", value: 260 }, { name: "Shopping", value: 310 },
  { name: "Other", value: 180 },
];
const categoryColors = ["#8da242", "#d6a73d", "#5fa58a", "#c8553d", "#e9e2c8"];
const monthlyData = [
  { month: "Jan", income: 82000, expense: 51000 }, { month: "Feb", income: 86000, expense: 47000 },
  { month: "Mar", income: 79000, expense: 56000 }, { month: "Apr", income: 91000, expense: 52000 },
  { month: "May", income: 88000, expense: 49000 }, { month: "Jun", income: 96000, expense: 54000 },
];
const features = [
  { icon: LayoutDashboard, title: "Smart dashboard", text: "See income, spending and balance at a glance." },
  { icon: PieChartIcon, title: "Category insights", text: "Understand exactly where every rupee goes." },
  { icon: BarChart3, title: "Monthly trends", text: "Spot patterns and improve your money habits." },
  { icon: Filter, title: "Powerful filters", text: "Search, sort and filter transactions instantly." },
  { icon: LockKeyhole, title: "Secure by design", text: "JWT authentication with protected httpOnly cookies." },
  { icon: Smartphone, title: "Fully responsive", text: "Beautiful and usable on every screen size." },
];
const steps = [
  { icon: Plus, title: "Create your account", text: "Sign up securely in less than a minute." },
  { icon: MousePointerClick, title: "Add transactions", text: "Record income and expenses with smart categories." },
  { icon: TrendingUp, title: "Understand your spending", text: "Turn everyday activity into clear financial insight." },
];
const testimonials = [
  { quote: "FinTrack made my monthly budget finally feel simple instead of stressful.", name: "Priya S.", role: "Product Designer" },
  { quote: "The monthly trends helped me find subscriptions I had completely forgotten.", name: "Rahul M.", role: "Software Engineer" },
  { quote: "Clean, fast, and focused on what matters. It is exactly what I needed.", name: "Ananya R.", role: "Small Business Owner" },
];
const faqs = [
  { q: "Is FinTrack free to use?", a: "Yes. You can create an account and use the core personal finance features at no cost." },
  { q: "Is my financial data secure?", a: "Authentication uses secure JWT cookies and every transaction is scoped to the signed-in user." },
  { q: "Can I track expenses in currencies other than INR?", a: "FinTrack supports INR and USD as display preferences." },
  { q: "Can I try it without registering?", a: "Yes. Use the Try the demo button and FinTrack will sign you into the demo account automatically." },
  { q: "Why is the demo slow to load?", a: "FinTrack uses Render's free tier, which sleeps the API after inactivity. The first request may take about a minute while the server starts." },
  { q: "Why does it say the database is paused?", a: "The free Supabase project can be paused when inactive. You can request a live demo and it will be resumed manually." },
];

export function LandingPage() {
  const [chartsMounted, setChartsMounted] = useState(false); const reduceMotion = useReducedMotion();
  const { runDemo, loading: demoLoading } = useDemoLogin();
  useEffect(() => {
    const timer = window.setTimeout(() => setChartsMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return <main className="overflow-hidden">
    <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_.95fr] lg:py-20">
      <div className="absolute left-[-12rem] top-20 size-[26rem] rounded-full bg-primary/10 blur-[100px]" />
      <Reveal className="relative z-10"><div className="mb-5 inline-flex rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">Personal finance, beautifully clear</div><h1 className="max-w-3xl font-heading text-5xl leading-[1.05] font-bold tracking-tight sm:text-6xl lg:text-[72px]">Take control of your <span className="gradient-text">money</span>, effortlessly.</h1><p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">Track every income and expense, uncover spending patterns, and build a calmer relationship with your finances.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row"><Button size="lg" className="gradient-olive text-white glow-olive" asChild><Link href="/auth?tab=signup">Get started free <ArrowRight className="ml-2 size-4"/></Link></Button><Button size="lg" variant="outline" onClick={runDemo} disabled={demoLoading}>{demoLoading ? "Opening demo..." : "Try the demo"}</Button></div><div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Live demo hosting status"><StatusPill mobile/><span>Demo hosted on free tier, first load may take about a minute.</span></div></Reveal>
      <Reveal delay={0.12}><DashboardPreview/></Reveal>
    </section>

    <section aria-label="FinTrack statistics" className="border-y border-border/70 bg-card/40"><div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-y divide-border/50 px-4 sm:grid-cols-4 sm:divide-y-0 sm:px-6">{[{value:10,suffix:"K+",label:"Transactions tracked"},{value:100,suffix:"%",label:"Secure"},{value:6,suffix:"",label:"Chart insights"},{value:0,suffix:"",label:"Ads"}].map((stat)=><div key={stat.label} className="px-3 py-7 text-center"><p className="font-heading text-2xl font-bold text-primary sm:text-3xl"><CountUp value={stat.value} suffix={stat.suffix}/></p><p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p></div>)}</div></section>

    <DemoAvailability />

    <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6"><Reveal className="text-center"><p className="text-sm font-semibold text-primary">Everything you need</p><h2 className="mt-2 font-heading text-3xl font-bold sm:text-5xl">A complete view of your money</h2></Reveal><div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{features.map(({icon:Icon,title,text},index)=><Reveal key={title} delay={index*.05}><Card className="glass group h-full transition-transform duration-300 hover:-translate-y-1"><CardContent className="p-6"><div className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon/></div><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-2 leading-7 text-muted-foreground">{text}</p></CardContent></Card></Reveal>)}</div></section>

    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-20 sm:px-6"><Reveal className="text-center"><p className="text-sm font-semibold text-primary">How it works</p><h2 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">From setup to clarity in minutes</h2></Reveal><div className="relative mt-12 grid gap-8 md:grid-cols-3">{steps.map(({icon:Icon,title,text},index)=><Reveal key={title} delay={index*.1} className="relative"><motion.div initial={reduceMotion?false:{scaleX:0}} whileInView={reduceMotion?undefined:{scaleX:1}} viewport={{once:true}} transition={{duration:.7,delay:index*.12}} className="absolute left-[50%] top-7 hidden h-px origin-left bg-gradient-to-r from-primary/60 to-primary/10 md:block"/><div className="relative z-10 mx-auto flex max-w-sm flex-col items-center text-center"><span className="gradient-olive grid size-14 place-items-center rounded-full text-white shadow-lg shadow-primary/10"><Icon size={22}/></span><span className="mt-5 text-xs font-bold uppercase tracking-widest text-primary">Step {index+1}</span><h3 className="mt-2 text-xl font-semibold">{title}</h3><p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{text}</p></div></Reveal>)}</div></section>

    <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6"><Reveal><Card className="glass overflow-hidden"><CardContent className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[240px_1fr] lg:items-center"><div><p className="text-sm font-semibold text-primary">Interactive showcase</p><h2 className="mt-2 font-heading text-3xl font-bold">See where your money moves</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Explore a sample of the insights waiting inside your dashboard.</p></div><Tabs defaultValue="category" className="min-w-0"><TabsList className="mb-5"><TabsTrigger value="category">Spending by category</TabsTrigger><TabsTrigger value="monthly">Monthly trends</TabsTrigger></TabsList><TabsContent value="category"><div className="h-[280px]" role="img" aria-label="Pie chart showing spending by category">{chartsMounted ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={65} outerRadius={105} paddingAngle={3}>{categoryData.map((entry,index)=><Cell key={entry.name} fill={categoryColors[index]}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer> : <div className="size-full" />}</div></TabsContent><TabsContent value="monthly"><div className="h-[280px]" role="img" aria-label="Area chart showing monthly income and expenses">{chartsMounted ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" stroke="rgba(190,205,150,.12)"/><XAxis dataKey="month" tick={{fill:"#9aa38a",fontSize:12}}/><YAxis tick={{fill:"#9aa38a",fontSize:12}}/><Tooltip/><Area type="monotone" dataKey="income" stroke="#8da242" fill="#8da242" fillOpacity={.22}/><Area type="monotone" dataKey="expense" stroke="#c8553d" fill="#c8553d" fillOpacity={.14}/></AreaChart></ResponsiveContainer> : <div className="size-full" />}</div></TabsContent></Tabs></CardContent></Card></Reveal></section>

    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6"><Reveal className="text-center"><p className="text-sm font-semibold text-primary">Loved by mindful spenders</p><h2 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">A clearer money mindset</h2></Reveal><div className="mt-10 grid gap-5 md:grid-cols-3">{testimonials.map((item,index)=><Reveal key={item.name} delay={index*.08}><Card className="glass h-full"><CardContent className="p-6"><Quote className="size-7 text-primary/70"/><p className="mt-4 leading-7">“{item.quote}”</p><div className="mt-6"><p className="font-semibold">{item.name}</p><p className="text-sm text-muted-foreground">{item.role}</p></div></CardContent></Card></Reveal>)}</div></section>

    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6"><Reveal className="text-center"><p className="text-sm font-semibold text-primary">FAQ</p><h2 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">Frequently asked questions</h2></Reveal><div className="mt-10 space-y-3">{faqs.map((item)=><details key={item.q} className="group glass rounded-xl px-5"><summary className="cursor-pointer list-none py-5 font-semibold marker:hidden">{item.q}<span className="float-right text-primary transition-transform group-open:rotate-45">+</span></summary><p className="pb-5 text-sm leading-7 text-muted-foreground">{item.a}</p></details>)}</div></section>

    <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6"><Reveal><div className="gradient-olive relative overflow-hidden rounded-3xl px-6 py-12 text-center text-white sm:px-12 sm:py-16"><ShieldCheck className="mx-auto size-10 opacity-90"/><h2 className="mt-5 font-heading text-3xl font-bold sm:text-5xl">Ready to take control?</h2><p className="mx-auto mt-4 max-w-xl text-white/80">Start tracking your money and turn everyday decisions into lasting progress.</p><Button size="lg" variant="secondary" className="mt-7" asChild><Link href="/auth?tab=signup">Get started free <ArrowRight className="ml-2 size-4"/></Link></Button></div></Reveal></section>
  </main>;
}
