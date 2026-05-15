import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * Strapi Webhook → On-Demand ISR Revalidation
 *
 * Setup in Strapi Admin:
 * 1. Go to Settings → Webhooks
 * 2. Create webhook pointing to: https://yoursite.com/api/revalidate
 * 3. Add header: x-revalidation-secret = <your secret>
 * 4. Select events: entry.create, entry.update, entry.delete, entry.publish, entry.unpublish
 */

const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

// Map Strapi model names to cache tags
const modelToTags: Record<string, string[]> = {
  article: ["articles"],
  category: ["categories"],
  page: ["pages"],
  navigation: ["navigation"],
  footer: ["footer"],
  job: ["jobs"],
  "job-category": ["jobs", "job-categories"],
};

export async function POST(request: NextRequest) {
  // Verify secret
  const secret = request.headers.get("x-revalidation-secret");

  if (REVALIDATION_SECRET && secret !== REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Strapi sends: { event, model, entry }
    const model = body.model as string;
    const tags = modelToTags[model];

    if (tags) {
      for (const tag of tags) {
        revalidateTag(tag);
      }
      return NextResponse.json({
        revalidated: true,
        tags,
        model,
        timestamp: Date.now(),
      });
    }

    // If model not mapped, revalidate everything
    Object.values(modelToTags)
      .flat()
      .forEach((tag) => revalidateTag(tag));

    return NextResponse.json({
      revalidated: true,
      tags: "all",
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to revalidate", details: String(error) },
      { status: 500 }
    );
  }
}
