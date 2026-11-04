"use client";
import { ProtectedRoute } from "@/components/auth/RouteGuards";import { Switch } from "@/components/ui/switch";
export default function SettingsPage(){return <ProtectedRoute><main className="mx-auto max-w-3xl px-4 py-12"><h1 className="text-3xl font-bold">Settings</h1><div className="glass mt-6 flex items-center justify-between rounded-2xl p-6"><div><p className="font-semibold">Monthly reports</p><p className="text-sm text-muted-foreground">Receive an email summary of your spending.</p></div><Switch/></div></main></ProtectedRoute>}
