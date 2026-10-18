import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "https://loudefoot.com";
  const routes = [
    "",
    "/accounts",
    "/exchange",
    "/coins",
    "/sell",
    "/faq",
    "/help",
    "/contact",
    "/terms",
    "/privacy",
    "/refunds",
    "/login",
    "/register",
  ];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));
}
