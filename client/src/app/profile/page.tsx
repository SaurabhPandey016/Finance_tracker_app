"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, LogOut, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { ProtectedRoute } from "@/components/auth/RouteGuards";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/types/auth";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50, "Maximum 50 characters"),
  currency: z.enum(["INR", "USD"]),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "Minimum 8 characters").regex(/[A-Za-z]/, "Include a letter").regex(/[0-9]/, "Include a number"),
  confirmPassword: z.string(),
}).refine((values) => values.newPassword === values.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileValues = z.infer<typeof profileSchema>;
type PasswordValues = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  return <ProtectedRoute><Profile /></ProtectedRoute>;
}

function Profile() {
  const { user } = useAuth();
  const router = useRouter();
  const setUser = useAuthStore((state) => state.setUser);
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", currency: user?.currency ?? "INR" },
  });
  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!user) return;
    profileForm.reset({ name: user.name, currency: user.currency });
  }, [user, profileForm]);

  const initials = user?.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") ?? "FT";

  const saveProfile = profileForm.handleSubmit(async (values) => {
    try {
      const response = await api.patch<{ data: { user: User } }>("/auth/me", values);
      setUser(response.data.data.user);
      toast.success("Profile updated");
    } catch (requestError: unknown) {
      toast.error(requestError instanceof Error ? requestError.message : "Unable to update profile");
    }
  });

  const changePassword = passwordForm.handleSubmit(async (values) => {
    try {
      await api.patch("/auth/password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      passwordForm.reset();
      toast.success("Password changed successfully");
    } catch (requestError: unknown) {
      toast.error(requestError instanceof Error ? requestError.message : "Unable to change password");
    }
  });

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      toast.success("Logged out");
      router.replace("/auth");
    } catch (requestError: unknown) {
      toast.error(requestError instanceof Error ? requestError.message : "Could not log out");
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:py-12">
      <div>
        <p className="text-sm font-medium text-primary">Account</p>
        <h1 className="mt-1 font-heading text-3xl font-bold">Profile</h1>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <Card className="glass h-fit">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <Avatar className="size-24 ring-4 ring-primary/15" size="lg">
              <AvatarFallback className="gradient-olive text-2xl font-bold text-white">{initials}</AvatarFallback>
            </Avatar>
            <p className="mt-4 font-heading text-xl font-bold">{user?.name}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="size-4" />{user?.email}</p>
            <div className="mt-5 w-full border-t pt-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Display currency</p>
              <p className="mt-1 font-semibold text-primary">{user?.currency}</p>
            </div>
            <Button variant="outline" className="mt-5 w-full border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => void logout()}>
              <LogOut /> Sign out
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserRound className="size-5 text-primary" />Personal details</CardTitle>
              <CardDescription>Update your name and preferred display currency.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={saveProfile}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="profile-name">Name</Label>
                    <Input id="profile-name" {...profileForm.register("name")} />
                    {profileForm.formState.errors.name && <p className="text-xs text-destructive">{profileForm.formState.errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Controller
                      control={profileForm.control}
                      name="currency"
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={(value: "INR" | "USD") => field.onChange(value)}>
                          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                            <SelectItem value="USD">US Dollar (USD)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
                <Button type="submit" className="gradient-olive text-white" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting && <LoaderCircle className="animate-spin" />}
                  Save changes
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>Choose a strong password you do not use elsewhere.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={changePassword}>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current password</Label>
                  <Input id="current-password" type="password" autoComplete="current-password" {...passwordForm.register("currentPassword")} />
                  {passwordForm.formState.errors.currentPassword && <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input id="new-password" type="password" autoComplete="new-password" {...passwordForm.register("newPassword")} />
                    {passwordForm.formState.errors.newPassword && <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm password</Label>
                    <Input id="confirm-password" type="password" autoComplete="new-password" {...passwordForm.register("confirmPassword")} />
                    {passwordForm.formState.errors.confirmPassword && <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>}
                  </div>
                </div>
                <Button type="submit" variant="outline" disabled={passwordForm.formState.isSubmitting}>
                  {passwordForm.formState.isSubmitting && <LoaderCircle className="animate-spin" />}
                  Update password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
