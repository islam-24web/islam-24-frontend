/**
 * Vercel Cron handler — RemoteOK job sync.
 *
 * Schedule: configured in vercel.json. Vercel sends GET with
 *   Authorization: Bearer <CRON_SECRET>
 * (CRON_SECRET is set automatically by Vercel when you enable Cron, or you set
 * one yourself in env vars; both work).
 *
 * Local dev:
 *   1. Set CRON_SECRET=local-dev-secret in frontend/.env.local
 *   2. Set STRAPI_API_TOKEN, GEMINI_API_KEY in the same file
 *   3. npm run dev
 *   4. curl http://localhost:3000/api/cron/sync-remoteok \
 *        -H "Authorization: Bearer local-dev-secret"
 *
 * Query params (only honored in development):
 *   ?limit=N            cap how many incoming RemoteOK jobs to process
 *   ?skipTranslations=1 skip Gemini calls (smoke test)
 */

import { NextRequest, NextResponse } from "next/server";
import { runRemoteokSync } from "@/lib/jobs/sync-runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // Fluid Compute default

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // Hard requirement: refuse to run without a secret configured.
    return false;
  }
  const got = req.headers.get("authorization");
  return got === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json(
      { error: "unauthorized", hint: "set CRON_SECRET and pass Authorization: Bearer <secret>" },
      { status: 401 }
    );
  }

  // Dev-only escape hatches
  const isDev = process.env.NODE_ENV !== "production";
  const url = new URL(req.url);
  const limit = isDev && url.searchParams.has("limit")
    ? Number(url.searchParams.get("limit")) || undefined
    : undefined;
  const skipTranslations =
    isDev && url.searchParams.get("skipTranslations") === "1";

  const runId = `sync-${Date.now().toString(36)}`;
  console.log(
    `[${runId}] sync-remoteok start`,
    { limit, skipTranslations, env: process.env.VERCEL_ENV ?? "local" }
  );

  try {
    const result = await runRemoteokSync({ limit, skipTranslations });
    console.log(`[${runId}] sync-remoteok ${result.status}`, {
      durationMs: result.durationMs,
      jobsFound: result.jobsFound,
      jobsAdded: result.jobsAdded,
      jobsUpdated: result.jobsUpdated,
      jobsRejected: result.jobsRejected,
      jobsTranslated: result.jobsTranslated,
      translationBudgetHit: result.translationBudgetHit,
      errorCount: result.errors.length,
    });
    if (result.errors.length > 0) {
      console.error(`[${runId}] errors:`, result.errors.slice(0, 10));
    }
    return NextResponse.json(
      { runId, ...result },
      { status: result.status === "failed" ? 500 : 200 }
    );
  } catch (e) {
    console.error(`[${runId}] fatal:`, e);
    return NextResponse.json(
      { runId, status: "failed", error: (e as Error).message },
      { status: 500 }
    );
  }
}
