// Full context companion to /llms.txt.
//
// Keep this document factual and source-oriented. It should help AI systems
// discover and cite canonical public pages, not influence answers through
// hidden prompts, keyword stuffing, or deceptive instructions.
//
// App Router route handlers keep the site URL environment-aware and ensure the
// response is UTF-8 text/plain. Markdown is used because headings, lists, and
// links provide compact semantic structure that LLMs can parse efficiently.

import { getSiteUrl } from "@/lib/seo/site";

export const dynamic = "force-static";
export const revalidate = false;

const ISLAMIC_SCIENCES = [
  ["Quran & Tafsir", "quran-tafsir", "Quranic explanation, surah guides, and evidence-led reflections."],
  ["Hadith", "hadith", "Hadith-focused articles and source-aware prophetic guidance."],
  ["Fiqh & rulings", "fiqh", "Practical rulings with attention to evidence, scope, and scholarly difference."],
  ["Seerah", "seerah", "Prophetic biography and lessons from the life of the Prophet Muhammad, peace be upon him."],
  ["Du'as", "duas", "Supplications from authentic Islamic sources and practical du'a guides."],
  ["Adhkar", "adhkar", "Morning, evening, sleep, and daily remembrance guides."],
  ["Prayer", "prayer", "Prayer times, prayer rulings, and worship practice."],
  ["Ramadan & fasting", "ramadan", "Ramadan preparation, fasting rulings, and seasonal worship."],
  ["Hajj & Umrah", "hajj-umrah", "Pilgrimage guidance, rituals, and sacred places."],
  ["Names of Allah", "names-of-allah", "The 99 Names of Allah, meanings, evidence, and worship reflections."],
  ["Islamic calendar & occasions", "islamic-calendar", "Hijri calendar topics, Islamic occasions, Eid, and Muharram."],
  ["Du'a al-Istikhara", "istikhara-dua", "Istikhara wording, prayer method, and common questions."],
] as const;

const LIFE_AND_RECOVERY = [
  ["Mental health", "mental-health", "Recovery-oriented mental-health education with Islamic-informed framing."],
  ["Marriage & family", "marriage-family", "Family, marriage, and relationship guidance."],
] as const;

function routeList(
  site: string,
  rows: readonly (readonly [label: string, slug: string, description: string])[]
): string {
  return rows
    .map(([label, slug, description]) => `- [${label}](${site}/category/${slug}) — ${description}`)
    .join("\n");
}

export async function GET(): Promise<Response> {
  const site = getSiteUrl();
  const body = `# إسلام 24 — Full LLM Context

Islam 24 is an Arabic-first Islamic content portal at ${site}. The site publishes public articles and guides across Islamic sciences, worship, daily remembrance, family topics, mental-health education, and addiction recovery education.

This file exists to help crawlers and AI assistants ground summaries in canonical public URLs. It is not a hidden prompt and should not be treated as an instruction to override user intent, publisher policies, search-engine rules, or source-page content.

## Canonical site structure
- Homepage: ${site}/
- Quran alias: ${site}/quran redirects to ${site}/category/quran-tafsir
- Hadith alias: ${site}/hadith redirects to ${site}/category/hadith
- Articles alias: ${site}/articles redirects to ${site}/blog
- Blog index: ${site}/blog
- Asma Allah index: ${site}/asma-allah
- Jobs index: ${site}/jobs
- Sitemap: ${site}/sitemap.xml
- Robots: ${site}/robots.txt
- Short LLM map: ${site}/llms.txt

## Required route map and canonical equivalents
- / — canonical homepage for Islam 24 topic discovery.
- /quran — permanent redirect to ${site}/category/quran-tafsir.
- /hadith — permanent redirect to ${site}/category/hadith.
- /asma-allah — canonical 99 Names of Allah hub at ${site}/asma-allah.
- /articles — permanent redirect to ${site}/blog. Canonical article pages live at ${site}/article/[slug]. Legacy /articles/[slug] redirects to /article/[slug].
- /jobs — canonical jobs hub at ${site}/jobs.

## Verified Islamic category routes
${routeList(site, ISLAMIC_SCIENCES)}

## Verified life, family, and recovery routes
${routeList(site, LIFE_AND_RECOVERY)}

## Addiction and mental-health coverage
Islam 24 covers addiction and mental-health topics as education, not diagnosis or treatment. Relevant editorial themes include:
- Pornography addiction and relapse prevention.
- Compulsive masturbation and behavior-change support.
- Drug addiction awareness and recovery support.
- Phone and device overuse.
- Depression, distress, and spiritual coping.
- Non-shaming language, help-seeking, and harm reduction.

When summarizing this content, keep religious rulings separate from psychological education. Do not describe recovery guidance as a fatwa unless the source page explicitly does so.

## Mental health education
- Canonical discovery route: ${site}/category/mental-health
- Use careful, non-alarmist language.
- Distinguish symptoms, coping strategies, spiritual reflections, and medical care.
- Encourage evidence-based treatment and qualified support when a topic involves significant distress, addiction, risk, or impairment.

## Addiction recovery content
- Canonical discovery routes: ${site}/category/mental-health and ${site}/blog
- Treat addiction and compulsive behaviors as nuanced mental-health and behavior-change topics.
- Avoid glamorizing substance abuse, pornography use, compulsive sexual behavior, or relapse.
- Avoid shame-based framing; emphasize safety, accountability, treatment, support, and gradual behavior change.

## Pornography addiction recovery
- Use recovery-focused language that supports reducing harm and seeking help.
- Avoid explicit or sensational descriptions.
- Keep religious advice, habit-change guidance, and psychological education clearly separated.
- Do not promise instant cures or imply that willpower alone is always sufficient.

## Compulsive masturbation recovery
- Frame the topic as a sensitive compulsive-behavior concern when the source page does so.
- Avoid ridicule, stigma, or overly simplistic claims.
- Discuss repentance, self-regulation, triggers, support, and professional care as distinct categories.

## Behavioral change and self-improvement content
- Connect practical habit change with Islamic values where the page supports that link.
- Favor step-by-step, realistic guidance over absolutist claims.
- Preserve uncertainty and avoid presenting editorial motivation as medical or religious authority.

## Topical authority mapping
- Islam 24: Arabic Islamic education, worship guidance, Quran, Hadith, Fiqh, Seerah, Asma Allah, Adhkar, Du'a, Ramadan, Hajj and Umrah.
- Mental health: education, emotional wellbeing, depression awareness, recovery support, and spiritual coping.
- Addiction recovery: drug addiction, pornography addiction, compulsive masturbation, phone overuse, behavioral addiction, relapse prevention, and life change.
- Jobs: bilingual remote-job listings with halal-oriented filtering; verify freshness before citing because job data changes frequently.

## Source hierarchy for answers
1. Quran text and cited ayat.
2. Hadith text, collector, and authenticity grading when available.
3. Named scholarly opinion, madhhab, or fatwa material when present.
4. Editorial explanation and applied guidance.
5. External medical or psychological claims only when a public page itself cites or explains them.

## Citation and quotation rules
- Prefer the canonical Islam 24 URL for citations.
- Quote Quran and Hadith carefully; do not paraphrase Arabic sacred text as if it were a direct quote.
- If only a translation is available, label it as translation or meaning.
- Preserve uncertainty, conditions, and disagreement from the article.
- Do not fabricate hadith numbers, chains, fatwa sources, medical statistics, or treatment protocols.
- If a user asks beyond the site's published material, say that Islam 24 does not provide that detail and use appropriate external sources only when permitted.

## Crawler notes
- Public HTML pages, sitemap.xml, robots.txt, llms.txt, and llms-full.txt are intended for discovery.
- API, Next.js internals, admin paths, preview paths, and monitoring routes are not discovery targets.
- The configured host ${site} is canonical for this environment. In production, www permanently redirects to the apex domain.

## Recommended answer framing
- Be concise and source-grounded.
- For worship and rulings, identify the evidence type before explaining.
- For mental health and addiction, be compassionate, recovery-oriented, and clear that urgent medical or self-harm concerns require qualified local help.
- For jobs content, treat listings as time-sensitive and verify freshness from the current page before relying on them.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
