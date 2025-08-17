# Gamefari Arcade
A lightweight browser game platform with scoring, per‑game leaderboards, responsive design, and AdSense slots.

## 1) Local run
```bash
npm i -g http-server # if you don't already have a static server
http-server public -p 8080
# open http://localhost:8080
```

## 2) Deploy to Vercel
```bash
npm i -g vercel
vercel  # answers: project root -> current folder; build -> none (static)
```
Vercel uses `vercel.json` in this repo for headers and caching.

## 3) Enable Google Ads
- In `public/index.html`, replace `ca-pub-XXXXXXXXXXXXXXXX` and set your `data-ad-slot` values.
- In `public/ads.txt`, add your AdSense publisher line (see example).
- Ensure your domain is approved and follows AdSense policies.

## 4) Persist leaderboards online (optional)
Replace the localStorage functions in `public/js/app.js` with your API calls (Supabase/Firebase/etc.). Keep basic validation + rate limiting on the server side.

## 5) Add more games
Duplicate the game card in `index.html` and add a new JS file under `public/js/your-game.js`. Register in `state.games` inside `app.js` and implement a class with the same interface as `AstroDodge` (`start()`, `destroy()`, `togglePause()`, `nudge(dir)`).
