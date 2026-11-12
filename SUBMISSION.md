0# SUBMISSION.md — Mosaic Wellness Fellowship Builder Challenge

## Part 2 Submission: Little Joys Flavour Finder

> **Submitted by:** [Your Name]  
> **Date:** [Submission Date]  
> **Brand:** Little Joys (Mosaic Wellness)  
> **Live App URL:** [Add your deployed URL here]  
> **Source Code:** `d:\mosaic-fellowship-starter` / [Add GitHub link if applicable]  
> **AI Tools Used:** Anthropic Claude (Sonnet), Antigravity (Google DeepMind IDE)

---

## What I Built

**Little Joys Flavour Finder** is a household tasting journal that helps families remember which Little Joys NutriMix flavours worked for them, so the next purchase decision feels less uncertain and less wasteful.

It is a full-stack web app with a React frontend, a Node.js/Express API, and local JSON persistence — built to be simple enough to use in under a minute and clear enough to revisit weeks later.

---

## The Problem It Solves

> *(Update this section once your five customer interviews are complete and have confirmed or refined the problem statement below.)*

**Working problem statement (desk-research hypothesis):**  
Some Little Joys NutriMix shoppers are uncertain which flavour their child will accept and discover preferences through trial and error. When a flavour is rejected, the remaining product goes to waste and the parent must start over with another pack — without any record of what was tried and what the outcome was.

**Why technology helps here (not just the symptom):**  
The root issue is not the lack of a trial pack — Little Joys already offers one. The root issue is that families have no lightweight way to record what happened during a trial: how it mixed, how much the child enjoyed it, whether they would choose it again. Without that memory, each new flavour decision restarts from zero. A simple digital journal closes this loop without requiring any account, app store install, or personal data.

**Why this is not just an obvious symptom fix:**  
Solving "uncertainty about flavour" at the surface level would mean adding a flavour quiz or a recommendation engine. That would be a guess, not evidence. The Flavour Finder instead captures *the family's own tasting experience* and reflects it back as a simple preference summary — grounded in what actually happened in their kitchen, not population data.

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
- [x] `npm run build` — Vite build succeeds cleanly
- [x] Backend starts and prints ready message on port 3101
- [x] Single-process production mode serves `dist/` correctly
- [ ] Public deployment URL — pending (see `render.yaml` for one-click deploy)
- [ ] Five customer interviews — pending (see `research-report-draft.md`)

