import axios from "axios";

export const api = axios.create({ baseURL: "/api", withCredentials: true });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    if (status === 401 && typeof window !== "undefined") {
      const protectedPath = window.location.pathname !== "/auth";
      if (protectedPath) {
        // Full navigation is intentional so the interceptor can clear stale protected-page state.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(new Error(message || "Something went wrong. Please try again."));
  },
);
