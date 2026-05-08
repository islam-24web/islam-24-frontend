/**
 * Map RemoteOK API response → JobDraft.
 *
 * Endpoint: GET https://remoteok.com/api
 * First element of the array is a metadata legal notice — caller must skip it.
 */

import type { JobDraft } from "./types";

interface RemoteOKJob {
  id: string | number;
  url?: string;
  apply_url?: string;
  position?: string;
  company?: string;
  company_logo?: string;
  description?: string;
  date?: string;
  tags?: string[];
  salary_min?: number;
  salary_max?: number;
  location?: string;
  [key: string]: unknown;
}

const REMOTEOK_BASE = "https://remoteok.com";

// RemoteOK serves UTF-8 content that was already encoded as UTF-8 then
// re-interpreted as Latin-1 server-side, so e.g. "é" arrives as "Ã©".
// Reverse it by reading the chars back as Latin-1 bytes and decoding UTF-8.
function fixMojibake(s: string): string {
  if (!s || !/Ã[-¿]|Â[-¿]/.test(s)) return s;
  const bytes = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    const code = s.charCodeAt(i);
    if (code > 0xff) return s;
    bytes[i] = code;
  }
  const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  return decoded.includes("�") ? s : decoded;
}

export async function fetchRemoteOK(): Promise<RemoteOKJob[]> {
  const userAgent =
    "islam-24.com Job Aggregator (https://islam-24.com/jobs - islam@islam-24.com)";

  const res = await fetch(`${REMOTEOK_BASE}/api`, {
    headers: {
      "User-Agent": userAgent,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`RemoteOK ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }

  const data = (await res.json()) as RemoteOKJob[];
  if (!Array.isArray(data)) {
    throw new Error("RemoteOK: expected JSON array");
  }

  // First element is a legal-notice metadata blob; jobs lack a `position` field there.
  return data.filter((row) => row && row.id && row.position);
}

export function mapRemoteOK(raw: RemoteOKJob): JobDraft {
  const tags = (raw.tags || []).map((t) => String(t).toLowerCase().trim()).filter(Boolean);
  const isContract = tags.some((t) => t.includes("contract"));

  const datePosted = raw.date ? new Date(raw.date) : new Date();
  const validThrough = new Date(datePosted.getTime() + 60 * 24 * 60 * 60 * 1000);

  // RemoteOK URLs are sometimes relative
  const sourceUrl = raw.url
    ? raw.url.startsWith("http")
      ? raw.url
      : `${REMOTEOK_BASE}${raw.url}`
    : `${REMOTEOK_BASE}/remote-jobs/${raw.id}`;

  const applyUrl = raw.apply_url
    ? raw.apply_url.startsWith("http")
      ? raw.apply_url
      : sourceUrl
    : sourceUrl;

  return {
    externalId: String(raw.id),
    title: fixMojibake(String(raw.position || "").trim()),
    description: fixMojibake(String(raw.description || "").trim()),
    companyName: fixMojibake(String(raw.company || "Unknown").trim()),
    sourceUrl,
    applyUrl,
    datePosted: datePosted.toISOString(),
    validThrough: validThrough.toISOString(),
    tags,
    employmentType: isContract ? "CONTRACTOR" : "FULL_TIME",
    jobLocationType: "TELECOMMUTE",
    applicantLocationRequirements: ["Worldwide"],
    salaryMin: raw.salary_min,
    salaryMax: raw.salary_max,
    salaryCurrency: "USD",
    salaryUnit: "YEAR",
    // RemoteOK is USD-only — 1:1 normalization (build plan §5)
    salaryUSDMin: raw.salary_min,
    salaryUSDMax: raw.salary_max,
  };
}
