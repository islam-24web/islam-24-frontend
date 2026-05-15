export function isCmsHomepage(): boolean {
  return process.env.USE_CMS_HOMEPAGE === "true";
}
