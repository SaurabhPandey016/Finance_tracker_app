"use client";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/hooks/useAuth";
import { BackendUnavailableCard } from "@/components/shared/BackendUnavailableCard";
import { isBackendUnavailable } from "@/lib/backend-status";
export default function DashboardPage(){return <ProtectedRoute><Dashboard/></ProtectedRoute>}
function Dashboard(){const {user}=useAuth();const [data,setData]=useState<{totalIncome:number;totalExpense:number;balance:number;savingsRate:number;transactionCount:number}|null>(null);const [error,setError]=useState(false); const [availabilityError,setAvailabilityError]=useState(false);useEffect(()=>{api.get("/analytics/summary").then(r=>setData(r.data.data)).catch((requestError: unknown)=>{setError(true);setAvailabilityError(isBackendUnavailable(requestError));})},[]);return <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6"><p className="text-sm text-primary">Overview</p><h1 className="mt-1 font-heading text-3xl font-bold">Welcome, {user?.name}</h1>{error?<div className="mt-8">{availabilityError?<BackendUnavailableCard/>:<div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6">Analytics are temporarily unavailable.</div>}</div>:!data?<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><Skeleton className="h-32"/><Skeleton className="h-32"/><Skeleton className="h-32"/><Skeleton className="h-32"/></div>:<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[{label:"Balance",value:formatCurrency(data.balance,user?.currency),olive:true},{label:"Income",value:formatCurrency(data.totalIncome,user?.currency)},{label:"Expenses",value:formatCurrency(data.totalExpense,user?.currency)},{label:"Savings rate",value:`${data.savingsRate}%`}].map(item=><Card key={item.label} className="glass"><CardContent className="p-5"><p className="text-sm text-muted-foreground">{item.label}</p><p className={`mt-2 text-2xl font-bold ${item.olive?"gradient-text":""}`}>{item.value}</p></CardContent></Card>)}</div>}</main>}
