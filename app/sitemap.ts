import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/api";
import { getAllJobSlugs } from "@/lib/jobs/api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let slugs = { pages: [] as string[], articles: [] as string[], categories: [] as string[] };
  let jobSlugs: Array<{ slug: string; updatedAt: string }> = [];

  try {
    [slugs, jobSlugs] = await Promise.all([getAllSlugs(), getAllJobSlugs()]);
  } catch (error) {
    console.error("Failed to fetch slugs for sitemap:", error);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
  ];

  const pageRoutes: MetadataRoute.Sitemap = slugs.pages
    .filter((slug) => slug !== "home")
    .map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const articleRoutes: MetadataRoute.Sitemap = slugs.articles.map((slug) => ({
    url: `${SITE_URL}/article/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = slugs.categories.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const jobRoutes: MetadataRoute.Sitemap = jobSlugs.map(({ slug, updatedAt }) => ({
    url: `${SITE_URL}/jobs/${slug}`,
    lastModified: updatedAt ? new Date(updatedAt) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.65,
  }));

  return [...staticRoutes, ...pageRoutes, ...articleRoutes, ...categoryRoutes, ...jobRoutes];
}
