import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "https://fintrack.app";

  const routes = [
    "",
    "/auth",
    "/about",
    "/pricing",
    "/help-center",
    "/docs",
    "/faq",
    "/security",
    "/terms",
    "/privacy",
    "/cookies",
    "/contact",
  ];

  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
