# Agent Instructions

This repo hosts the islam-24 frontend. Before changing deployment, public app
assets, Vercel settings, or `/apps/sabab`, read:

`../../PROJECT_MEMORY.md`

Important short version:

- Production domain: `https://islam-24.com`
- Vercel project: `islam-24-frontend`
- Sabab static app folder: `public/apps/sabab`
- Sabab public path: `/apps/sabab`
- Build Sabab with:
  `NEXT_OUTPUT=export NEXT_PUBLIC_APP_BASE_PATH=/apps/sabab npm run build`
- Deploy this repo with:
  `vercel link --yes --project islam-24-frontend`
  then `vercel deploy --prod --yes`

Do not store secrets in this file.

