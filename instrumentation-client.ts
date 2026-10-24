// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  enabled: false,
  dsn: "https://b5f79e37673217dfc2ebb12e8213a2bf@o4511404936200192.ingest.de.sentry.io/4511404936659024",

  tracesSampleRate: 0,
  enableLogs: false,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,
  sendDefaultPii: false,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
