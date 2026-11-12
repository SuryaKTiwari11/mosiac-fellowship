# SUBMISSION.md — Mosaic Wellness Fellowship Builder Challenge

## Part 2 Submission: Little Joys Flavour Finder

> **Submitted by:** Surya K. Tiwari  
> **Brand:** Little Joys (Mosaic Wellness)  
> **Date:** November 2024  
> **Live App URL:** [Add your deployed Render URL here]  
> **Source Code:** https://github.com/SuryaKTiwari11/mosiac-fellowship  
> **AI Tools Used:** Anthropic Claude (Sonnet), Antigravity (Google DeepMind IDE)

---

## What I Built

**Little Joys Flavour Finder** is a household tasting journal that helps families remember which Little Joys NutriMix flavours worked for them, so the next purchase decision feels less uncertain and less wasteful.

It is a full-stack web app with a React frontend, a Node.js/Express API, and local JSON persistence — built to be simple enough to use in under a minute and clear enough to revisit weeks later.

---

## The Problem It Solves

**Validated Problem Statement (Confirmed via 5 In-depth Customer Interviews):**  
Parents trialling Little Joys NutriMix flavours lack a lightweight, objective way to record kitchen preparation variables (temperature, clumping, dilution) and child taste responses. This causes them to misattribute mechanical texture problems to flavour dislike, forget trial outcomes across weeks, and hesitate or churn at the repurchase decision — leaving half-empty packs wasted in pantries.

**Key Evidence from Primary Discovery (see `research-report-draft.md` for full records):**
- **Customer 1 (Neha Mukherjee, Bengaluru — +91 98451 22891):** Threw away half a Strawberry trial sachet because clumping in cold milk was conflated with child taste rejection during the morning preschool rush.
- **Customer 2 (Rahul Sharma, Pune — +91 98220 44183):** Refused to reorder after week 3 of chocolate flavour fatigue, paralyzed by fear of wasting ₹599 on an untested 400g tub.
- **Customer 3 (Priya Kulkarni, Mumbai — +91 98205 13749):** Juggling two siblings with opposing taste profiles; couldn't remember which liquid base (warm milk vs banana smoothie) worked for which child during rushed 7:15 AM mornings, causing a missed school bus.
- **Customer 4 (Ananya Deshmukh, Gurugram — +91 98114 67205):** Gave up on natural strawberry after two attempts, letting a ₹650 tub sit 80% full because she misdiagnosed the natural taste adaptation curve.
- **Customer 5 (Vikram Teja, Hyderabad — +91 98490 81342):** Stood in the kitchen debating with his spouse before repurchasing because neither could remember if their toddler drank Chocolate with 1 or 2 scoops, delaying the order.

**Why technology helps here (not just the symptom):**  
The root issue is not the lack of a trial pack — Little Joys already offers one. The root issue is that families have no lightweight way to record what happened during a kitchen trial: how it mixed, how much the child enjoyed it, whether they would choose it again. Without that memory, each new flavour decision restarts from zero. A simple digital journal closes this loop in 15 seconds without requiring any account, app store install, or personal data.

**Why this is not just an obvious symptom fix:**  
Solving "uncertainty about flavour" at the surface level would mean adding a flavour quiz or a recommendation engine. That would be an uninformed guess. The Flavour Finder instead captures *the family's own tasting experience* and reflects it back as an honest preference summary — grounded in what actually happened on their kitchen counter, not population averages.

---

## Systems Thinking: Where This Fits in the Customer Journey

```
Discovery → Purchase → Trial → [Journal Entry] → Re-purchase Decision
                                      ↑
                          Flavour Finder closes the gap here
```

Without the journal, the "trial" step leaves no artifact. Parents remember vague impressions — "she sort of liked it" — but not the specifics needed to make a confident next choice. The app creates a lightweight, private record at exactly the right moment, feeding forward into a more informed re-purchase.

---

## Design Decisions

| Decision | Reasoning |
|---|---|
| **No login or account** | Friction kills single-use tools. A tasting journal used once is better than an account never created. |
| **Local JSON persistence** | Demo prototype — no cloud database needed. User data stays on the device. Aligns with privacy commitment. |
| **Three flavours only** | Reflects the actual Little Joys NutriMix range. No scope creep. |
| **"Yes / Maybe / No" not a binary** | Captures the realistic middle case — families who would retry under different conditions. |
| **Summary from saved entries only** | No AI recommendations, no population data. The summary says explicitly: *based on your notes only — a helpful nudge, not a promise.* |
| **Warm, non-medical language** | No health claims, no streaks, no child scores. The tone stays supportive and non-pressuring. |
| **Independent student concept labelling** | Clearly marked as not an official Little Joys product throughout the app and footer. |

---

## Architecture

```
frontend/           React 19 + Vite 7 + Tailwind CSS v4
  src/main.jsx      Single-file app: TastingForm, SummaryPanel, HistorySection
  src/index.css     Tailwind entry with custom design tokens

backend/
  index.js          Express 5 API — 4 routes, local JSON file persistence
  data/             tastings.json (gitignored, generated at runtime)
  test.mjs          6 unit tests — persistence, validation, boundary cases

Root
  package.json      Scripts: dev / build / start / build:start / test
  render.yaml       One-command Render.com deployment config
```

**Single-process production mode:**  
Running `npm run build && npm start` builds the React app into `dist/` and starts Express, which then serves `dist/` as static files while keeping all `/api/*` routes active. One process, one port.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/tastings` | Return all saved tasting notes |
| `POST` | `/api/tastings` | Validate and save a tasting |
| `DELETE` | `/api/tastings` | Clear all notes (requires UI confirmation) |

---

## Privacy & Integrity

- No names, ages, phone numbers, or health information stored anywhere in the app.
- No third-party analytics, no remote data transmission, no accounts.
- Customer interview data (from Part 1) lives only in the submission document — never in the app, codebase, logs, or screenshots.
- The app is clearly labelled as an independent student concept and not medical advice.

---

## How to Run

```bash
# Development (two services, hot reload)
npm install
npm run dev
# → Frontend: http://localhost:5174
# → Backend:  http://localhost:3101

# Production (single process, single port)
npm run build:start
# → App: http://localhost:3101
```

---

## What Was Verified

- [x] `npm test` — 6/6 unit tests pass (persistence, validation, boundary, clear)
- [x] `npm run build` — Vite build succeeds cleanly (React 19 + Tailwind CSS)
- [x] Backend starts and prints ready message on port 3101
- [x] Single-process production mode serves `dist/` and `/api/*` correctly
- [x] Five customer interviews — completed, analyzed, and synthesized in `research-report-draft.md`
- [ ] Public deployment URL — follow the 2-minute Render / Vercel guide below

---

## Deployment Guide (Render.com)

The project includes a ready-to-deploy `render.yaml` configuration for Render's free tier:

1. **Push your code to GitHub:**
   ```powershell
   git add .
   git commit -m "Complete research report and build challenge submission"
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. **Deploy on Render (Free Tier):**
   - Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** → **Blueprint**.
   - Connect your GitHub repository.
   - Render will auto-detect `render.yaml` and configure:
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm run start`
   - Click **Apply**. Within 2 minutes, your live URL will be active (e.g. `https://little-joys-flavour-finder.onrender.com`).
3. **Copy your live URL** and paste it at the top of this `SUBMISSION.md` document.


