import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site";

const SITE_URL = getSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/", "/monitoring"],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "PerplexityBot",
          "CCBot",
          "Google-Extended",
        ],
        allow: ["/", "/llms.txt", "/llms-full.txt", "/sitemap.xml"],
        disallow: ["/api/", "/_next/", "/admin/", "/monitoring"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
