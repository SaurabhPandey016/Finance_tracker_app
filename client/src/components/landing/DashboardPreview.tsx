"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, BarChart, Bar, XAxis } from "recharts";
import { ArrowUpRight, Wallet } from "lucide-react";

const pieData = [{ value: 38 }, { value: 24 }, { value: 18 }, { value: 20 }];
const colors = ["#8da242", "#d6a73d", "#5fa58a", "#c8553d"];
const barData = [{ m: "Jan", v: 35 }, { m: "Feb", v: 52 }, { m: "Mar", v: 44 }, { m: "Apr", v: 68 }, { m: "May", v: 58 }, { m: "Jun", v: 76 }];

export function DashboardPreview() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);
  return <motion.div aria-label="FinTrack dashboard preview" initial={reduceMotion ? false : { opacity: 0, y: 24 }} animate={reduceMotion ? undefined : { opacity: 1, y: [0, -8, 0] }} transition={reduceMotion ? undefined : { opacity: { duration: 0.6 }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }} className="relative mx-auto w-full max-w-[520px]">
    <div className="absolute left-1/2 top-1/2 size-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
    <div className="glass relative rotate-1 rounded-[28px] p-3 sm:p-5 shadow-2xl">
      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 sm:p-6">
        <div className="flex items-center justify-between"><div><p className="text-xs text-muted-foreground">Total balance</p><p className="mt-1 font-heading text-2xl font-bold sm:text-3xl">₹3,47,950</p></div><span className="gradient-olive grid size-10 place-items-center rounded-xl text-white"><Wallet size={19}/></span></div>
        <div className="mt-5 flex gap-2"><span className="rounded-lg bg-income/10 px-3 py-2 text-xs text-income">Income <b className="ml-1">₹5.47L</b></span><span className="rounded-lg bg-terracotta/10 px-3 py-2 text-xs text-terracotta">Expense <b className="ml-1">₹1.99L</b></span></div>
        <div className="mt-5 grid grid-cols-[.75fr_1.25fr] gap-3"><div className="rounded-xl border border-border/60 bg-background/40 p-2"><p className="text-xs text-muted-foreground">Spending</p><div className="h-32" role="img" aria-label="Category spending donut chart">{mounted ? <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" innerRadius={28} outerRadius={48} stroke="none">{pieData.map((_, index) => <Cell key={index} fill={colors[index]}/>)}</Pie></PieChart></ResponsiveContainer> : <div className="size-full" />}</div></div><div className="rounded-xl border border-border/60 bg-background/40 p-2"><div className="flex items-center justify-between px-1"><p className="text-xs text-muted-foreground">Monthly trend</p><ArrowUpRight className="size-4 text-primary"/></div><div className="mt-2 h-32" role="img" aria-label="Monthly spending bar chart">{mounted ? <ResponsiveContainer width="100%" height="100%"><BarChart data={barData}><XAxis dataKey="m" axisLine={false} tickLine={false} tick={{ fill: "#9aa38a", fontSize: 9 }}/><Bar dataKey="v" fill="#8da242" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer> : <div className="size-full" />}</div></div></div>
      </div>
    </div>
  </motion.div>;
}

