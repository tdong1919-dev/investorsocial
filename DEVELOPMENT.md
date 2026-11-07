# Investor Social Source

This repository contains the interactive Investor Social prototype: investor readiness, city-based agent coverage, opportunities, deal workspaces, REIDE diligence, introductions, events, and administration.

## Run locally

Use Node.js 22.13 or newer.

```sh
npm ci
npm run dev
```

Open the local URL printed by the development server.

```sh
npm run build
npm run lint
```

The application uses React, TypeScript, and Vinext with Cloudflare/Sites build configuration.

## Source layout

- `app/[[...slug]]/page.tsx`: routes, demo records, role views, and interactive workflows.
- `app/globals.css`: responsive layout and component styles.
- `app/layout.tsx`: application shell and metadata.
- `public/`: static assets.
- `vite.config.ts`: development and Worker build configuration.
- `.openai/hosting.json`: existing Sites project identity and optional storage bindings. This is configuration, not a credential.

The `netlify-single/` directory and `vite.netlify-single.config.ts` contain the earlier static export experiment. Build it with `npx vite build --config vite.netlify-single.config.ts`. It produces an HTML entry plus separate assets, not a self-contained single file; a Netlify deployment also needs SPA fallback routing for deep links.

## Demo behavior

Personas, property records, scores, analysis, and workflow activity are illustrative. Role switching and browser state demonstrate proposed interactions; they are not production authentication or authorization. Public-record refreshes and AI diligence are simulated. Email actions prepare drafts for user review.

Dependencies, generated build outputs, deployment archives, runtime state, and environment files are excluded from source control. Uploading this source does not redeploy the public demo.
