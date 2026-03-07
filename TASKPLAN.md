# LLM Council — Complete Task Plan (Theory / LLD)

This is your roadmap. Every step must be completed and understood before moving to the next.
You write the code. Claude only guides you.

---

## Architecture Overview

### Why this structure?
In real-world Node.js projects, you never dump everything in one file. You separate concerns:
- **Routes** — just define the URL and hand off to controller. Nothing else.
- **Controllers** — handle the HTTP request/response. Call the service, send back the result.
- **Services** — the actual business logic. No HTTP stuff here, just pure logic.
- **Config** — all environment variables loaded in one place. Rest of the app imports from here.

This is called **Layered Architecture**. Every professional Node.js codebase follows this pattern.

### Final Folder Structure

```
LLM-Council/
├── server/
│   ├── index.js                  ← starts the server, nothing else
│   ├── app.js                    ← Express setup: middleware, routes registered here
│   ├── config/
│   │   └── index.js              ← loads and exports all env variables
│   ├── routes/
│   │   └── council.routes.js     ← defines POST /api/ask, points to controller
│   ├── controllers/
│   │   └── council.controller.js ← reads req, calls service, sends res
│   └── services/
│       ├── council.service.js    ← runCouncil() logic, Promise.all, judge call
│       └── llm/
│           ├── gemini.js         ← askGemini(question)
│           ├── groq.js           ← askGroq(question)
│           └── openai.js         ← askOpenAI(question)
│
├── client/
│   └── src/
│       ├── App.jsx               ← root component, holds state, renders pages
│       ├── pages/
│       │   └── Home.jsx          ← the main page: input + results layout
│       ├── components/
│       │   ├── QuestionInput.jsx ← textarea + submit button
│       │   ├── LLMCard.jsx       ← one card showing a single LLM's answer
│       │   └── CouncilResult.jsx ← renders all 3 LLMCards + judge verdict
│       └── services/
│           └── api.js            ← askCouncil(question) fetch call
│
├── .env                          ← API keys, never commit this
├── .gitignore
└── package.json (root)           ← optional: scripts to run both server and client
```

---

## PHASE 1 — Project Setup

### Step 1.1 — Initialize the Backend
- Create a folder called `server` inside the root.
- Inside `server`, initialize a Node.js project. This creates `package.json`.
- Install packages: `express`, `dotenv`, `cors`.
- Also install `nodemon` as a dev dependency — it auto-restarts the server when you save a file (huge time saver during development).
- Create the folder structure inside `server`: `config/`, `routes/`, `controllers/`, `services/`, `services/llm/`.

### Step 1.2 — Initialize the Frontend
- From the root, use Vite to scaffold a React project inside a folder called `client`.
- Inside `client/src`, manually create these folders: `pages/`, `components/`, `services/`.
- Clean up Vite boilerplate — delete default CSS content and placeholder JSX in `App.jsx`.

### Step 1.3 — Environment Variables
- Create `.env` in the root of the project (same level as `server/` and `client/`).
- Add placeholder keys: `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`.
- Create `.gitignore` and add `.env` and `node_modules` to it immediately.

---

## PHASE 2 — Backend

### Step 2.1 — Config
- In `server/config/index.js`, load `dotenv` and export an object with all three API keys read from `process.env`.
- This is the only file that touches `process.env`. Everything else imports from here.
- Why: if you ever rename an env variable, you change it in one place, not scattered across 5 files.

### Step 2.2 — Express App Setup
- Create `server/app.js`. This file creates the Express app, applies middleware (cors, json parser), and registers routes.
- Create `server/index.js`. This file imports the app from `app.js` and calls `app.listen(5000)`.
- Reason for splitting: `app.js` is the app, `index.js` is just the launcher. This makes testing easier later.

### Step 2.3 — LLM Adapters (3 files)
- Create `server/services/llm/gemini.js` — one exported async function `askGemini(question)`. It calls the Gemini REST API, extracts the text from the response, and returns it.
- Create `server/services/llm/groq.js` — same pattern, `askGroq(question)`, calls Groq API.
- Create `server/services/llm/openai.js` — same pattern, `askOpenAI(question)`, calls OpenAI API.
- Each file imports API keys from `config/index.js`, not from `process.env` directly.
- Each function must catch errors and return a fallback string like `"[Gemini failed to respond]"` instead of crashing.

### Step 2.4 — Council Service
- Create `server/services/council.service.js`.
- Export one async function: `runCouncil(question)`.
- Inside it:
  1. Use `Promise.all` to call all three LLM adapters simultaneously. This is critical — calling them one by one would be 3x slower.
  2. Store the three results with their LLM names.
  3. Build a judge prompt: send the original question + all three answers to Gemini (or any one LLM) and ask it to synthesize the best answer.
  4. Return an object: `{ question, responses: [{llm, answer}, ...], verdict }`.

### Step 2.5 — Controller
- Create `server/controllers/council.controller.js`.
- Export one async function: `askCouncil(req, res)`.
- It reads `question` from `req.body`. If question is missing, return a 400 error.
- Calls `runCouncil(question)` from the service.
- Sends the result as `res.json(result)`.
- Wraps everything in try/catch — if something fails, send a 500 error response.
- The controller knows about HTTP (req, res). The service does not.

### Step 2.6 — Route
- Create `server/routes/council.routes.js`.
- Import the controller function and define: `router.post('/ask', askCouncil)`.
- Export the router.
- In `server/app.js`, import this router and mount it at `/api` — so the full URL becomes `POST /api/ask`.

### Step 2.7 — Test the Backend
- Start the server.
- Use a tool like Postman or Thunder Client (VS Code extension) to send a POST request to `http://localhost:5000/api/ask` with body `{ "question": "What is gravity?" }`.
- Verify you get back a proper JSON response before touching the frontend.

---

## PHASE 3 — Frontend

### Step 3.1 — API Service
- In `client/src/services/api.js`, write and export one function: `askCouncil(question)`.
- It sends a POST fetch request to `http://localhost:5000/api/ask` with the question in the body.
- Returns the parsed JSON response.
- Components never do fetch calls directly — they always go through this file.

### Step 3.2 — QuestionInput Component
- Create `client/src/components/QuestionInput.jsx`.
- It receives two props: `onSubmit` (a function) and `isLoading` (a boolean).
- Renders a textarea and a Submit button.
- When the button is clicked, it calls `onSubmit` with the current text value.
- When `isLoading` is true, the button should be disabled and show "Thinking..." text.

### Step 3.3 — LLMCard Component
- Create `client/src/components/LLMCard.jsx`.
- Receives two props: `llmName` and `answer`.
- Renders a card showing the LLM name as a header and the answer as body text.
- This is a pure display component — no logic, no state.

### Step 3.4 — CouncilResult Component
- Create `client/src/components/CouncilResult.jsx`.
- Receives one prop: `result` (the full object from the API).
- Renders three `LLMCard` components in a row (one per LLM response).
- Below the cards, renders a distinct "Judge's Verdict" section with the `verdict` text.

### Step 3.5 — Home Page
- Create `client/src/pages/Home.jsx`.
- This page manages state: `isLoading`, `result`, and any error.
- Renders `QuestionInput` at the top.
- When `onSubmit` fires: set loading true, call `askCouncil`, set result, set loading false.
- If `result` exists, render `CouncilResult` below the input.

### Step 3.6 — App.jsx
- `App.jsx` just renders `<Home />`.
- In the future if you add more pages, you'd add a router here. For now, keep it simple.

---

## PHASE 4 — Styling

### Step 4.1 — Choose TailwindCSS
- Install Tailwind in the `client` project. Vite + Tailwind has a straightforward setup.
- Use Tailwind utility classes directly in your JSX — no separate CSS files needed.
- Design goals: dark background, clean white/gray cards for each LLM, a highlighted gold/green verdict box.
- Must be responsive — it needs to look good on mobile since that's your deployment target.

---

## PHASE 5 — Production & Deployment

### Step 5.1 — Serve Frontend from Backend
- In `server/app.js`, add logic to serve static files from the React build folder (`client/dist`).
- Add a catch-all route that serves `index.html` for any unknown route — this is needed for React to work correctly when accessed from a browser.
- This way you only run one process on the phone: the Node.js server serves both the API and the frontend.

### Step 5.2 — Root package.json Scripts
- Create a `package.json` at the root level with scripts:
  - `build`: goes into `client` and runs the Vite build.
  - `start`: goes into `server` and starts the Node.js server.
  - `dev`: runs both the server (with nodemon) and the client (Vite dev server) simultaneously using a package called `concurrently`.

### Step 5.3 — Deploy on Termux
- Device: Xiaomi Redmi Note 10 Pro, Android 12, 6GB RAM. Fully capable.
- Install Termux from F-Droid (not Play Store).
- In Termux: `pkg update`, then install `nodejs` and `git`.
- Clone the GitHub repo into Termux.
- Run `npm install` inside `server/`.
- Run the build script to compile the React frontend.
- Start the server. It will serve everything on port 5000.
- From any device on the same WiFi, open a browser and go to `http://<phone-ip>:5000`.
- Disable MIUI battery optimization for Termux: Settings > Apps > Termux > Battery > No Restrictions.

---

## Complete File Creation Order

```
Phase 1:
  .env
  .gitignore
  server/config/index.js
  server/app.js
  server/index.js
  server/routes/council.routes.js
  server/controllers/council.controller.js
  server/services/council.service.js
  server/services/llm/gemini.js
  server/services/llm/groq.js
  server/services/llm/openai.js
  client/ (Vite scaffold)
  client/src/services/api.js
  client/src/components/QuestionInput.jsx
  client/src/components/LLMCard.jsx
  client/src/components/CouncilResult.jsx
  client/src/pages/Home.jsx
  client/src/App.jsx (modify)
```

---

## Realistic Time Estimate

| Phase | What you're doing | Estimated time |
|---|---|---|
| Phase 1 — Setup | Installing, scaffolding, folder structure | 1-2 hours |
| Phase 2 — Backend | All server logic, API calls, testing | 4-6 hours |
| Phase 3 — Frontend | All React components wired up | 3-5 hours |
| Phase 4 — Styling | Tailwind, making it look good | 2-4 hours |
| Phase 5 — Deployment | Termux setup, build, deploy | 2-3 hours |
| **Total** | | **12-20 hours of actual work** |

Spread realistically across days (you'll get stuck, debug, Google things, re-read docs):
**2 to 3 weeks** if you code for 1-2 hours a day.

This is NOT a weekend project if you are learning while building. That is fine — the learning IS the point.

---

## Current Status
- [ ] Step 1.1 — Initialize Backend
- [ ] Step 1.2 — Initialize Frontend
- [ ] Step 1.3 — Environment Variables
- [ ] Step 2.1 — Config
- [ ] Step 2.2 — Express App Setup
- [ ] Step 2.3 — LLM Adapters
- [ ] Step 2.4 — Council Service
- [ ] Step 2.5 — Controller
- [ ] Step 2.6 — Route
- [ ] Step 2.7 — Test the Backend
- [ ] Step 3.1 — API Service
- [ ] Step 3.2 — QuestionInput Component
- [ ] Step 3.3 — LLMCard Component
- [ ] Step 3.4 — CouncilResult Component
- [ ] Step 3.5 — Home Page
- [ ] Step 3.6 — App.jsx
- [ ] Step 4.1 — Styling with Tailwind
- [ ] Step 5.1 — Serve Frontend from Backend
- [ ] Step 5.2 — Root Scripts
- [ ] Step 5.3 — Deploy on Termux
