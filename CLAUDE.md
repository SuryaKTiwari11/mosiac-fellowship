# Little Joys Flavour Finder — Project Brief for Claude Code

You are working in an existing project folder for a student application to the Mosaic Wellness Fellowship Builder Challenge.

The user wants a **proper, working full-stack project** with separate frontend and backend folders. They have been frustrated because the earlier prototype was a loose `index.html` and Python server, the browser experience did not work, and the project was not clearly organized. Be direct, inspect the repository, fix the implementation, run it, and report what was actually verified.

Do not stop at a plan or a partial scaffold. Complete the implementation, run the frontend and backend, verify the browser page and API work together, and leave a clear run command.

---

## 1. Challenge context

The challenge is called **Fellowship Builder Challenge** and asks students to:

1. Speak to at least five real customers of one Mosaic brand.
2. Find a meaningful customer problem from those conversations.
3. Build a consumer-facing, technology-driven app that addresses the same problem.
4. Submit both parts together: a research document and a working browser-based app link.

Part 1 requires, for each of five customers:

- Actual name and phone number
- Product(s) used
- What the customer likes
- What they dislike or struggle with
- What they want Mosaic to do better
- Explicit permission to share their name, phone number, and feedback with Mosaic

The report must also explain:

- Patterns across conversations
- What may be driving the problem
- How the problem fits into the broader customer journey
- Problems considered
- The selected problem and why it was chosen

Part 2 requires:

- A working web app link
- A short explanation of how the app solves the problem from Part 1

**Do not fake interviews, customer names, phone numbers, quotes, consent, or findings.** No interviews have been conducted yet. Treat customer research as incomplete until the user supplies real interview evidence.

---

## 2. Current product direction (hypothesis only)

The working brand is **Little Joys**.

The current early hypothesis is that some Little Joys NutriMix shoppers may be unsure which flavour a child will accept and may have to learn by trial and error. A digital tasting journal might help a household compare its own flavour preferences and mixing experience before choosing a larger pack.

This is only a **desk-research hypothesis**. Do not present it as proven, representative, or validated by the required customer interviews. The five real interviews may reveal a different, more meaningful problem. If they do, revise the app to solve that better-supported problem.

### Desk research signals already found

- Little Joys offers a NutriMix three-flavour trial pack.
- The official product page and public reviews include accounts of parents wanting to try flavours before buying a larger pack, a fussy eater, trying several powders, and children wanting variety.
- Public App Store reviews also mention broader service issues such as delivery, packaging, refunds, and customer support.

These are self-selected public signals, not proof of prevalence or causation. Keep those other journey problems in mind during interviews. Do not overclaim.

Sources recorded in `research-notes.md`:

- https://ourlittlejoys.com/product/nutrimix-7-3-flavour-pack-csv
- https://apps.apple.com/in/app/little-joys-kids-health-app/id1662152873?platform=iphone&see-all=reviews
- https://mosaicwellness.in/

---

## 3. Required stack and repository structure

Use:

- **Frontend:** React
- **Build/dev server:** Vite
- **Backend:** Node.js + Express
- **Persistence:** Local JSON or SQLite for this challenge prototype
- **Language:** JavaScript/JSX is fine; TypeScript is optional

The structure must make the separation obvious:

```text
project-root/
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── main.jsx
│   │   ├── style.css
│   │   └── ...
│   ├── vite.config.js
│   └── package.json             # optional if using a workspace
├── backend/
│   ├── index.js
│   ├── data/                    # generated local persistence, gitignored
│   └── ...
├── research-notes.md
├── research-starter.md
├── README.md
├── package.json                 # root scripts to run both sides
└── CLAUDE.md
```

The root may contain an `index.html` only if it is genuinely needed by the chosen setup. Prefer the actual Vite app entry at `frontend/index.html`. Do not leave a disconnected root `index.html` that makes the project appear to be a static site.

Keep generated files out of source control:

```gitignore
node_modules/
dist/
backend/data/
*.log
.env
```

Do not commit secrets. Do not add a database URL, API key, auth provider, analytics, or third-party service unless genuinely required and authorized.

---

## 4. Product experience to implement

Build a polished, responsive "Little Joys Flavour Finder" concept. Use a warm, family-friendly visual system, but avoid making it look like an official Mosaic/Little Joys product. Clearly mark it as an **independent student concept**.

The app should be a useful, easy-to-try tasting journal, not a feature dump.

### Main user journey

1. Land on a clear intro:
   - Explain that it helps the household remember flavour experiences.
   - Make it clear this is a personal journal and not medical advice.
2. Choose one of the available NutriMix flavours:
   - Chocolate
   - Strawberry
   - Vanilla
3. Record:
   - Enjoyment rating from 1 to 5
   - Mixing experience (e.g. mixed smoothly / some lumps / hard to mix)
   - "Would choose it again?" (yes / maybe / no)
   - Optional short note
4. Save the tasting.
5. See:
   - Recent tasting notes
   - A simple, honest summary of the household's own recorded preferences
   - How many of the three flavours have been tried
6. Allow the user to clear local tasting notes with a clear confirmation.

Use accessible labels, keyboard-operable controls, visible focus, readable contrast, loading states, empty states, and clear validation/error messages. It must work on mobile widths.

### Avoid

- No accounts or login
- No customer names, phone numbers, child names, ages, precise locations, or medical details
- No health, nutrition, disease, growth, or medical recommendations
- No streak guilt, pressure language, or child "scores"
- No fabricated "AI recommendations" or generic chatbot
- No recommendation implying the highest rating predicts health outcomes
- No claim that a flavor will be liked based on population data
- No third-party analytics
- No sending notes to a remote service

The preference summary should say it is based only on the entries this user recorded and is a gentle aid, not a guarantee.

---

## 5. Backend requirements

Create a working Express backend with these endpoints:

- `GET /api/health`
  - Return an `ok` status and app name.
- `GET /api/tastings`
  - Return the current device/local-demo tasting entries.
- `POST /api/tastings`
  - Validate and save a tasting.
  - Fields: `flavour`, `rating`, `texture`, `wouldChoose`, optional `note`.
  - Reject invalid input with a useful 400 response.
  - Limit request size and note length.
- `DELETE /api/tastings`
  - Clear saved tasting entries. The frontend must confirm before invoking this.

Persistence can be a JSON file under `backend/data/` for this prototype. Use safe file writes and handle a missing file. Do not store identity fields. Put the data folder in `.gitignore`.

Use an environment variable for the API port if useful, with a sensible default that can be changed if the default port is occupied.

### Important server-process handling

The last implementation had trouble with local ports and server processes:

- Ports such as 3001, 5173, 5174, and 8000 appeared occupied or inaccessible in the previous environment.
- Some server commands printed "ready" but did not remain reachable from the browser.
- Some detached processes disappeared after the command returned.
- The current browser tab may still point to `http://localhost:8000/`, which is likely stale.

Therefore:

1. Inspect which ports are truly available in this environment.
2. Do not assume a port is free because a process list looks empty.
3. Do not use `strictPort: true` if it causes a dead server due to a collision. Use auto-increment or select confirmed free ports.
4. Make frontend API proxy target match the actual backend port.
5. Run the servers in a way that remains alive while the user is working.
6. Confirm the frontend page responds and the backend health endpoint responds.
7. Confirm the React app can successfully load and save a tasting through the API.
8. If the environment blocks local networking, clearly report that exact limitation and provide the shortest user-run instructions. Do not claim the site works if it has not been reached successfully.
9. Do not leave stale server processes running on several ports.
10. If stopping only processes created for this project, identify them by command/working directory before stopping.

---

## 6. Frontend/backend integration

Use Vite proxying for `/api` during development, or another clean local setup. Do not hard-code an API URL that only works in one environment.

Possible development command:

```powershell
npm run dev
```

It should start frontend and backend together and keep both alive. Configure the script so one child failing is clearly reported. Provide a separate option to run each side if needed:

```powershell
npm run dev:frontend
npm run dev:backend
```

For production preview, either:

- Build the frontend and serve `dist/` from Express, or
- Clearly document that Vite is only for local development and a separate static frontend deployment is needed.

If you configure Express to serve the built frontend, confirm the API routes take precedence over the SPA fallback.

---

## 7. Existing project files

Inspect the repository before editing. Files from earlier attempts may include:

- `frontend/` — React Vite app after a recent folder reorganization
- `backend/` — Express API after reorganization
- `frontend/index.html`
- `frontend/src/main.jsx`
- `frontend/src/style.css`
- `frontend/vite.config.js`
- Root `package.json`
- `README.md`
- `research-notes.md`
- `research-starter.md`
- `dist/`
- `node_modules/`
- `dev.log`, `dev-error.log`, or related logs

Do not assume these files are correct. In particular:

- The root `index.html` was moved into `frontend/`.
- The expected frontend port has been changed several times.
- Backend port 3001 appeared occupied; the API port was changed to 3101.
- Frontend ports 5173, 5174, and 5180 were reported occupied in previous attempts.
- A `npm run build` succeeded at least once, but the user still could not use the app.
- Server processes often disappeared after a tool command ended.

Inspect actual file contents and current process/port state, then make one coherent setup.

---

## 8. Research artifacts

Keep the current desk research in `research-notes.md`. Keep a separate `research-starter.md` containing:

- Research status: not yet interviewed
- Consent wording that explicitly asks to share actual name, phone number, and feedback with Mosaic for this application
- Neutral interview questions
- A record template for each of five customers
- Required synthesis prompts
- Explicit warning not to invent findings

The interview guide should not lead participants toward the flavor hypothesis. Ask about their actual experience across discovery, choice, use, repeat purchase, and customer support. It may explore flavors and wasted product with neutral prompts, but must not assume those are the core problem.

Do not put customer interview data into the app. If the user later provides real evidence, use it to update the problem statement and app. Keep phone numbers out of code, demo data, screenshots, logs, and public app content.

---

## 9. README requirements

Write a practical README with:

- What the app does
- Clear frontend and backend architecture
- Node.js version requirement
- Install instructions
- One command to run both services
- Exact local URL
- Backend URL and API endpoints
- Data storage location and deletion steps
- How to build the production frontend
- What has been verified
- Honest limitations: no interviews yet, no public deployment yet, hypothesis may change
- Explicit note that this is an independent student concept and not medical advice

Do not use vague instructions such as "open the app" without giving the URL and the exact command.

---

## 10. Required implementation and verification work

Do all of the following:

1. Inspect the current repository and identify incorrect or stale files.
2. Ensure `frontend/` and `backend/` are real, separate working directories.
3. Remove or update misleading stale files that imply Python or a static HTML-only app.
4. Make the React app and Express API work together.
5. Ensure package scripts start both processes in development.
6. Resolve port collisions in a deliberate, transparent way.
7. Build the production frontend successfully.
8. Start the app and verify the actual frontend HTTP response.
9. Verify the backend health route.
10. Submit one tasting through the UI or API, confirm it appears in the UI/API, then clear the synthetic test record so no fake customer data remains.
11. Confirm the development process is actually still alive at the end. If it cannot be kept alive in this environment, be honest and give exact local commands.
12. Do not claim testing or deployment that did not happen.

Tests are appropriate here because the user explicitly needs the site to work. Add a few focused checks only if needed (health, validation, persistence, proxy) and do not create an elaborate test suite.

---

## 11. Definition of done

This project is not done until:

- I can identify a `frontend/` folder and a `backend/` folder.
- `frontend/` contains the React/Vite application.
- `backend/` contains the running Express API.
- One command starts both in a way that stays alive.
- The exact browser URL opens the React app.
- A saved tasting travels from React through the API and persists locally.
- The production build succeeds.
- The research document clearly distinguishes desk research from primary interviews.
- Nothing pretends that the required five interviews are complete.
- You tell me what you actually verified and what remains before challenge submission.

Begin by checking the current files and processes, then implement and verify. Do not merely explain what you would do.

