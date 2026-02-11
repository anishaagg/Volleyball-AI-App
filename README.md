# Setly

A **web-based app** that runs in the browser built with Cursor AI. Organize your volleyball team: **schedule** (games, practices, tournaments), **roster** (players and coaches), and **messaging** for coaches to communicate with parents and players.

- Open it in any browser (Chrome, Safari, Firefox, Edge) on desktop or phone.
- Optional: **Install as app** — use “Add to Home Screen” on mobile or “Install” in the browser address bar for an app-like experience.
- Data is saved in your browser (localStorage) and persists between sessions.

## Features

- **Schedule** — Add, edit, and filter events by type (game, practice, tournament). View date, time, location, opponent (for games), and notes.
- **About the Team** — Roster of coaches (name, role, contact) and players (number, position, grade, parent contact).
- **Messages** — Coaches can send messages to all parents/players or to individual players. Message history is stored locally.
- Coaches can manage multiple teams

## Run locally

```bash
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

## Deploy to the web

The app is static (HTML, CSS, JS). Build and deploy the `dist` folder to any static host:

```bash
npm run build
```

- **Vercel** — Push to GitHub, then import the repo at [vercel.com](https://vercel.com). Build command: `npm run build`, output: `dist`, install command: `npm install`.
- **Netlify** — Same idea: connect repo, build command `npm run build`, publish directory `dist`.
- **GitHub Pages** — After `npm run build`, push the contents of `dist` to a `gh-pages` branch (or use the `gh-pages` npm package). If the site is at `https://user.github.io/repo-name/`, set `base: '/repo-name/'` in `vite.config.js` before building.

Once deployed, share the URL so anyone can use the app in their browser.

## Build for production (local preview)

```bash
npm run build
npm run preview
```

## Testing (including TeamContext)

Tests use **Vitest** and **React Testing Library**. They cover the `TeamContext` reducer (schedule, roster, messages) and the provider/`useTeam` hook.

**Run tests (watch mode):**
```bash
npm install
npm test
```

**Run tests once (e.g. in CI):**
```bash
npm run test:run
```

- `src/context/TeamContext.test.jsx` — reducer actions (LOAD, ROSTER_UPDATE_COACH, SCHEDULE_ADD/UPDATE/REMOVE, MESSAGE_SEND, etc.) and a small integration test that renders `TeamProvider` and uses `useTeam()`.

## Tech stack

- React 18, React Router 6, Vite 5, CSS modules
- Web app manifest and meta tags for installability and mobile
