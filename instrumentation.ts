// Sentry is intentionally disabled. These no-op hooks keep Next.js
// instrumentation valid without loading the Sentry SDK at runtime.
export async function register() {}

export function onRequestError() {}
