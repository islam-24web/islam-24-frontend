/**
 * Gemini 2.5 Flash translation client.
 * Single call returns full Arabic localization for one job.
 */

import type { ArabicTranslation } from "./types";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const PROMPT_TEMPLATE = `You are a professional translator specializing in tech and remote work jobs for Arabic-speaking professionals (Saudi Arabia, UAE, Egypt).

TRANSLATE this job posting from English to Modern Standard Arabic (فصحى حديثة), professional tone:

INPUT:
Title: {{TITLE}}
Description: {{DESCRIPTION}}
Company: {{COMPANY}}

RULES:
1. Keep technical terms in English with Arabic transliteration on first use, e.g., "هندسة البرمجيات (Software Engineering)".
2. Use second-person address ("أنت") for the candidate.
3. Structure description into clear sections: المسؤوليات (Responsibilities), المتطلبات (Requirements), المميزات (Benefits) — only if those sections exist in the source.
4. descriptionAr: 300-800 words, simple HTML (<p>, <ul>, <li>, <strong>) allowed.
5. descriptionShortAr: 150-180 chars max, plain text.
6. metaTitleAr: 50-60 chars, must include the job title and "وظيفة عن بُعد" if remote.
7. metaDescriptionAr: 140-160 chars, action-oriented.
8. slugAr: kebab-case ASCII transliteration of the Arabic title (NOT the Arabic script — Latin chars only, hyphenated, 5-8 words max). Always end with "-ar".

OUTPUT exactly this JSON (no markdown fences, no preamble):
{
  "titleAr": "...",
  "descriptionAr": "...",
  "descriptionShortAr": "...",
  "metaTitleAr": "...",
  "metaDescriptionAr": "...",
  "slugAr": "..."
}`;

export interface TranslateInput {
  title: string;
  description: string;
  company: string;
}

const REQUIRED_FIELDS: Array<keyof ArabicTranslation> = [
  "titleAr",
  "descriptionAr",
  "descriptionShortAr",
  "metaTitleAr",
  "metaDescriptionAr",
  "slugAr",
];

export async function translateToArabic(
  input: TranslateInput
): Promise<ArabicTranslation> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY missing");

  // Cap description size to keep input tokens predictable
  const description = (input.description || "").slice(0, 4000);

  const prompt = PROMPT_TEMPLATE
    .replace("{{TITLE}}", input.title)
    .replace("{{DESCRIPTION}}", description)
    .replace("{{COMPANY}}", input.company);

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
        maxOutputTokens: 2048,
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const text: string | undefined =
    data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) throw new Error("Gemini returned empty response");

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(`Gemini JSON parse failed: ${text.slice(0, 200)}`);
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Gemini did not return a JSON object");
  }

  const obj = parsed as Record<string, unknown>;
  for (const field of REQUIRED_FIELDS) {
    if (typeof obj[field] !== "string" || !(obj[field] as string).trim()) {
      throw new Error(`Gemini response missing field: ${field}`);
    }
  }

  return obj as unknown as ArabicTranslation;
}
