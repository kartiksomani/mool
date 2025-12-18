# Initial WAPP Generator (Node.js)

This repository contains a small Node.js CLI that bootstraps a full-stack starter made of a Vite + React + MUI frontend, an Express backend, Google OAuth wiring, shared health-check tooling, and a convenience dev-runner. The generator works by invoking each plugin in `plugins/` (sorted by priority) and using templates in `templates/` to scaffold files, install dependencies, and set up scripts.

## Prerequisites

- Node.js 18+ (needed for `npx create-vite@latest` and modern language features)
- npm (bundled with Node) with access to the public npm registry
- Network access for installing dependencies the first time you run the generator

## Generating a project

```bash
git clone <repo-url>
cd initial_wapp_generator_js
node generate_project.js --output-dir ./my-initial-app
```

The generator resolves the output path, creates it if necessary, and then runs every plugin:

1. **backend-express** – creates `backend/`, runs `npm init`, installs Express/CORS/Dotenv/Nodemon, and seeds `index.js` from `templates/backend/index.js.template` with environment-aware CORS and health-check routes.
2. **frontend-react** – runs `npx -y create-vite@latest frontend --template react`, installs dependencies, adds MUI, and overwrites `src/App.jsx` with the health-check UI from `templates/frontend/App.jsx.template` while creating `.env.development` / `.env.production` files.
3. **auth** – wires Google OAuth support by installing client libraries, creating React pages (Home/Login/Private), updating routing, seeding backend `.env`, and extending the Express app with protected routes.
4. **dev-runner** – drops a root-level `start-dev.js` script that finds free ports and launches both servers with coordinated environment variables.
5. **docs** – writes a project-level README inside the generated folder so downstream users know how to run the scaffolded stack.

> **Tip:** Use a fresh (or empty) output directory. `create-vite` will fail if the `frontend/` directory already exists.

## Running the generated stack

Inside your newly generated project (e.g., `cd my-initial-app`):

- **One-command dev mode:** `node start-dev.js` (append `--skip-auth` to bypass Google login locally)
  - Picks available ports starting at 3000 (backend) and 5173 (frontend).
  - Loads `.env.development` and forwards `VITE_API_URL`, `VITE_GOOGLE_CLIENT_ID`, etc.
  - Gracefully shuts both processes down on `Ctrl+C`.
- **Manual dev mode:**
  ```bash
  cd backend && npm run dev
  cd frontend && npm run dev -- --port 5173
  ```
  Pass `PORT`/`VITE_API_URL` manually if you override defaults.
- **Production build:**
  ```bash
  cd frontend
  npm run build
  ```
  Ensure `frontend/.env.production` (and `backend/.env`) contain the correct API URL and OAuth IDs before building.

## Configuring Google OAuth

- Update `frontend/.env.development` and `.env.production` with `VITE_GOOGLE_CLIENT_ID`.
- Mirror the value in `backend/.env` via `GOOGLE_CLIENT_ID` (plus set `CORS_ORIGIN` for non-local deployments).
- The frontend login page stores the Google ID token in `localStorage`, and the backend validates it with `google-auth-library` before serving `/protected-data`.

## Customizing the generator

- **Plugins:** Each file in `plugins/` exports `{ name, priority, generate }`. Add new behavior by creating another plugin file and exporting an async `generate(targetDir)` function; it will automatically be picked up and executed in priority order.
- **Templates:** Adjust reusable boilerplate in `templates/backend` and `templates/frontend` to change what gets written to the scaffolded project.
- **Utilities:** Shared helpers such as `runCommand`, `ensureDir`, and `createFile` live in `lib/utils.js` to keep plugin code concise.

## Sample output

The `test_project/` directory is a checked-in example of a generated workspace. Refer to it if you want to inspect expected layouts or verify future changes to the generator.
