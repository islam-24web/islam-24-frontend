export function isCmsHomepage(): boolean {
  return process.env.USE_CMS_HOMEPAGE === "true";
}

export function isAutoCategoryStrips(): boolean {
  return process.env.USE_AUTO_CATEGORY_STRIPS === "true";
}
