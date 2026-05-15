import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STRAPI_URL = process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SubscribeBody {
  email?: string;
  locale?: string;
  source?: string;
  consent?: boolean;
}

export async function POST(req: NextRequest) {
  let body: SubscribeBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  if (body.consent !== true) {
    return NextResponse.json({ error: "Consent required" }, { status: 400 });
  }
  const locale = body.locale === "en" ? "en" : "ar";
  const source = typeof body.source === "string" ? body.source.slice(0, 64) : "homepage-newsletter-cta";

  const headers: HeadersInit = { "Content-Type": "application/json" };
  if (STRAPI_TOKEN) headers.Authorization = `Bearer ${STRAPI_TOKEN}`;

  try {
    const res = await fetch(`${STRAPI_URL}/api/newsletter-subscribers`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          email,
          locale,
          source,
          consent: true,
          subscribed_at: new Date().toISOString(),
        },
      }),
      cache: "no-store",
    });

    if (res.ok) {
      return NextResponse.json({ ok: true });
    }

    // Strapi returns 400 with a unique-violation error message for duplicate emails.
    // Treat that as success for the user — idempotent subscribe.
    const errText = await res.text();
    if (res.status === 400 && /unique|duplicate/i.test(errText)) {
      return NextResponse.json({ ok: true, already: true });
    }

    return NextResponse.json({ error: "Subscribe failed" }, { status: 502 });
  } catch {
    return NextResponse.json({ error: "Subscribe failed" }, { status: 502 });
  }
}
