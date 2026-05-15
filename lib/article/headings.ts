/**
 * Adds id attributes to H2/H3 headings in rendered article HTML so deep
 * links and an in-page TOC work. Slug is content-derived: strip tags →
 * lowercase → normalize → drop combining diacritics → replace non-word
 * chars with dashes. Arabic and other Unicode letters are preserved.
 *
 * Duplicate slugs get numeric suffixes ("-2", "-3", ...).
 *
 * Pure string transform. Safe to run on the server before injecting.
 */

const HEADING_RE = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi;
const ID_ATTR_RE = /\sid=("|')(.*?)\1/i;
const DIACRITIC_RE = /[̀-ͯ]/g;

function stripTags(html: string): string {
  return html.replace(/<[^>]+>/g, "");
}

function slugify(text: string): string {
  return text
    .normalize("NFKD")
    .toLowerCase()
    .replace(DIACRITIC_RE, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export interface HeadingAnchor {
  level: 2 | 3;
  id: string;
  text: string;
}

export interface AnchoredHtml {
  html: string;
  headings: HeadingAnchor[];
}

export function addHeadingAnchors(html: string): AnchoredHtml {
  if (!html) return { html: "", headings: [] };

  const used = new Map<string, number>();
  const headings: HeadingAnchor[] = [];

  const out = html.replace(HEADING_RE, (match, levelStr, attrs, inner) => {
    const level = Number(levelStr) as 2 | 3;
    const existing = ID_ATTR_RE.exec(attrs);
    const text = stripTags(inner).trim();
    if (!text) return match;

    let id: string;
    if (existing) {
      id = existing[2];
    } else {
      const base = slugify(text) || `section-${headings.length + 1}`;
      const count = (used.get(base) ?? 0) + 1;
      used.set(base, count);
      id = count === 1 ? base : `${base}-${count}`;
    }

    headings.push({ level, id, text });

    if (existing) return match;
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
  });

  return { html: out, headings };
}
