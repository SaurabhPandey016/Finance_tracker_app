"use client";
import { ProtectedRoute } from "@/components/auth/RouteGuards";import { useAuth } from "@/hooks/useAuth";
export default function ProfilePage(){return <ProtectedRoute><main className="mx-auto max-w-3xl px-4 py-12"><h1 className="text-3xl font-bold">Profile</h1><Profile/></main></ProtectedRoute>}
function Profile(){const {user}=useAuth();return <div className="glass mt-6 rounded-2xl p-6"><p className="text-lg font-semibold">{user?.name}</p><p className="mt-2 text-muted-foreground">{user?.email}</p><p className="mt-1 text-sm text-muted-foreground">Currency: {user?.currency}</p></div>}
