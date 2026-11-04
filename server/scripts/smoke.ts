const baseUrl = `http://localhost:${process.env.PORT ?? 10000}`;
let cookie = "";

const request = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers);
  if (cookie) headers.set("cookie", cookie);
  if (options.body) headers.set("content-type", "application/json");
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  const setCookie = response.headers.get("set-cookie") ?? "";
  if (setCookie) {
    const pair = setCookie.split(";", 1)[0];
    if (pair.startsWith("token=")) {
      cookie = pair.endsWith("token=") ? "" : pair;
    }
  }
  const body = await response.json().catch(() => null);
  return { status: response.status, body };
};

const report = (name: string, result: { status: number; body: unknown }) => {
  console.log(`${name}: ${result.status} ${JSON.stringify(result.body)}`);
};

const email = `smoke-${Date.now()}@fintrack.app`;
const password = "Smoke1234";

const health = await request("/api/health");
report("Health", health);

const registered = await request("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ name: "Smoke User", email, password }),
});
report("Register", registered);

const me = await request("/api/auth/me");
report("Get /me with cookie", me);

const updated = await request("/api/auth/me", {
  method: "PATCH",
  body: JSON.stringify({ name: "Updated Smoke User", currency: "USD" }),
});
report("Update profile", updated);

const wrongLogin = await request("/api/auth/login", {
  method: "POST",
  body: JSON.stringify({ email, password: "Wrong1234" }),
});
report("Login with wrong password", wrongLogin);

const duplicate = await request("/api/auth/register", {
  method: "POST",
  body: JSON.stringify({ name: "Smoke User", email, password }),
});
report("Duplicate registration", duplicate);

const logout = await request("/api/auth/logout", { method: "POST" });
report("Logout", logout);

const afterLogout = await request("/api/auth/me");
report("Get /me after logout", afterLogout);

const failed = [health.status !== 200, registered.status !== 201, me.status !== 200, updated.status !== 200,
  wrongLogin.status !== 401, duplicate.status !== 409, logout.status !== 200, afterLogout.status !== 401].some(Boolean);
if (failed) process.exitCode = 1;
