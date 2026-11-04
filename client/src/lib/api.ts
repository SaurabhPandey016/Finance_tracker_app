import axios from "axios";

export class ApiError extends Error {
  status?: number;
  code?: string;
  constructor(message: string, options?: { status?: number; code?: string }) {
    super(message);
    this.name = "ApiError";
    this.status = options?.status;
    this.code = options?.code;
  }
}

export const api = axios.create({ baseURL: "/api", withCredentials: true });

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const code = error.response?.data?.code;
    const message = error.response?.data?.message;
    const unavailable = code === "DB_UNAVAILABLE" || !error.response || [502, 503, 504].includes(status);

    if (unavailable && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("fintrack:backend-unavailable"));
      return Promise.reject(new ApiError(
        code === "DB_UNAVAILABLE" ? message : "The FinTrack server is temporarily unavailable. Please wait while it wakes up.",
        { status, code: code === "DB_UNAVAILABLE" ? "DB_UNAVAILABLE" : "ERR_NETWORK" },
      ));
    }

    if (status === 401 && typeof window !== "undefined") {
      const protectedPath = window.location.pathname !== "/auth";
      if (protectedPath) {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(new ApiError(message || "Something went wrong. Please try again.", { status, code }));
  },
);
