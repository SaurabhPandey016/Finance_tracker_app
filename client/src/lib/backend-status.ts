export type BackendStatus = "checking" | "online" | "waking" | "db-paused" | "offline";
export interface BackendStatusResponse {
  success: boolean;
  server: "up";
  database: "up" | "down";
  checkedAt?: string;
  responseTimeMs?: number;
}

export function isBackendUnavailable(error: unknown) {
  if (!(error instanceof Error)) return false;
  const statusError = error as Error & { status?: number; code?: string };
  return statusError.code === "DB_UNAVAILABLE" || statusError.code === "ERR_NETWORK" || statusError.status === 502 || statusError.status === 503 || statusError.status === 504;
}

export async function checkBackendStatus(timeoutMs = 60000): Promise<{ kind: "online"; data: BackendStatusResponse } | { kind: "waking" } | { kind: "db-paused"; data: BackendStatusResponse }> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch("/api/status", { credentials: "include", cache: "no-store", signal: controller.signal });
    if ([502, 503, 504].includes(response.status)) return { kind: "waking" };
    if (!response.ok) return { kind: "waking" };
    const data = (await response.json()) as BackendStatusResponse;
    if (data.server === "up" && data.database === "up") return { kind: "online", data };
    return { kind: "db-paused", data };
  } catch {
    return { kind: "waking" };
  } finally {
    window.clearTimeout(timeout);
  }
}
