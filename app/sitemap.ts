import type { MetadataRoute } from "next";
import { getAllSlugs } from "@/lib/api";
import { getAllJobSlugs } from "@/lib/jobs/api";
import { getAllDivineNameSlugs } from "@/lib/divine-names/api";
import { getSiteUrl } from "@/lib/seo/site";

const SITE_URL = getSiteUrl();
const RESERVED_ARTICLE_SLUGS = new Set(["article", "preview", "test", "undefined", "null"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let slugs = { pages: [] as string[], articles: [] as string[], categories: [] as string[] };
  let jobSlugs: Array<{ slug: string; updatedAt: string }> = [];
  let divineNameSlugs: string[] = [];

  try {
    [slugs, jobSlugs, divineNameSlugs] = await Promise.all([
      getAllSlugs(),
      getAllJobSlugs(),
      getAllDivineNameSlugs(),
    ]);
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
    {
      url: `${SITE_URL}/asma-allah`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
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

  const articleRoutes: MetadataRoute.Sitemap = slugs.articles
    // Asma Allah slugs (`name-NN-X`) are 301-redirected to /asma-allah/*,
    // so exclude them from /article/* sitemap entries even if the source
    // article rows are still published mid-migration.
    .filter((slug) => !/^name-\d+-/.test(slug))
    .filter((slug) => !RESERVED_ARTICLE_SLUGS.has(slug))
    .map((slug) => ({
      url: `${SITE_URL}/article/${slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

  const divineNameRoutes: MetadataRoute.Sitemap = divineNameSlugs.map((slug) => ({
    url: `${SITE_URL}/asma-allah/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
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

  return [
    ...staticRoutes,
    ...pageRoutes,
    ...articleRoutes,
    ...divineNameRoutes,
    ...categoryRoutes,
    ...jobRoutes,
  ];
}
