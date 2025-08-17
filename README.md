# Gamefari Arcade
A lightweight browser game platform with scoring, per‑game leaderboards, responsive design, ads, and **optional global leaderboards via Supabase**.

## Quick Start (local)
```bash
npx http-server public -p 8080
# open http://localhost:8080
```

## Deploy Options
### A) GitHub Pages (included workflow)
1. Create a GitHub repo and push this project.
2. Go to *Settings → Pages* and set **Branch: `gh-pages`** (the workflow publishes there).
3. The site will deploy automatically on every push to `main`.

### B) Vercel
```bash
npm i -g vercel
vercel
vercel --prod
```

## Enable Google Ads
- In `public/index.html`, replace `ca-pub-XXXXXXXXXXXXXXXX` and ad slot IDs.
- In `public/ads.txt`, add your AdSense publisher line.
- Make sure your domain is approved and policies are followed.

## Global Leaderboards (Supabase)
1. Copy `public/js/config.example.js` to `public/js/config.js` and fill `SUPABASE_URL` and `SUPABASE_ANON_KEY`.
2. Create a `scores` table (see comments in `public/js/supabase-client.js`) and enable RLS with safe policies.
3. The frontend will automatically switch from *local* to *global (Supabase)* mode.

**Security note**: Anon keys are public by design. Use RLS policies to prevent abuse and consider rate limits (e.g., Supabase edge functions) for production.

## GitHub Pages Workflow & Static Build
- Source: `/public` is deployed as-is. No Node build step required.
