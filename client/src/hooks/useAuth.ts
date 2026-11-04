import { useAuthStore } from "@/store/auth-store";

export function useAuth() {
  const { user, loading } = useAuthStore();
  return { user, loading, isAuthenticated: Boolean(user) };
}
