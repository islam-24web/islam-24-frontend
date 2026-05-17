/**
 * Strips document-level HTML wrappers and head-only tags from article body
 * content. Strapi editors occasionally paste a full HTML document (with
 * <html>, <head>, <title>, <meta>, <style>, etc.) into the body — when that
 * goes through dangerouslySetInnerHTML it produces duplicate <title> tags,
 * orphan <meta> declarations, and other things Ahrefs/Google read as
 * page-level signals. This sanitizer keeps only what's safe in <main>.
 *
 * Pure string transform. Intentionally conservative — we don't try to be a
 * general HTML sanitizer (we trust the CMS authors for the body); we just
 * remove the structural tags that cannot legally appear inside <body>.
 */

const MARKDOWN_FENCE_OPEN_RE = /^\s*```[a-zA-Z]*\s*\n/;
const MARKDOWN_FENCE_CLOSE_RE = /\n```\s*$/;

const DOCTYPE_RE = /<!doctype[^>]*>/gi;
const HTML_TAG_RE = /<\/?html\b[^>]*>/gi;
const HEAD_BLOCK_RE = /<head\b[^>]*>[\s\S]*?<\/head>/gi;
const BODY_TAG_RE = /<\/?body\b[^>]*>/gi;
// Defensive: catch any of these that slip through outside a <head> block.
const ORPHAN_HEAD_TAG_RE = /<(title|meta|link|base)\b[^>]*(?:\/>|>[\s\S]*?<\/\1>)/gi;

export function sanitizeArticleBody(html: string): string {
  if (!html) return "";
  return html
    .replace(MARKDOWN_FENCE_OPEN_RE, "")
    .replace(MARKDOWN_FENCE_CLOSE_RE, "")
    .replace(DOCTYPE_RE, "")
    .replace(HEAD_BLOCK_RE, "")
    .replace(HTML_TAG_RE, "")
    .replace(BODY_TAG_RE, "")
    .replace(ORPHAN_HEAD_TAG_RE, "")
    .trim();
}
