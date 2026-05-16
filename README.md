# GoGolDocs

A minimal, secure notes application. Refactored from a React/Redux/TypeScript monolith into a **pure Vanilla JS + ES Modules** frontend with a **Node.js/Express** backend and **PostgreSQL** database.

---

## Stack

| Layer    | Technology                                |
|----------|-------------------------------------------|
| Frontend | HTML · CSS · Vanilla JS (ES Modules)      |
| Backend  | Node.js · Express · ES Modules            |
| Database | PostgreSQL (pg driver)                    |
| Auth     | JWT (jsonwebtoken) + bcrypt               |
| DevOps   | Docker Compose                            |

---

## Project Structure

```
gogoldocs/
├── client/
│   ├── index.html                    # Entry point
│   ├── public/                       # Static assets (icons, fonts, images)
│   └── src/
│       ├── app.js                    # Bootstrap: imports router + toast container
│       ├── router.js                 # SPA router (auth-guarded)
│       ├── config/index.js           # Runtime config (API base URL etc.)
│       ├── pages/
│       │   ├── loginPage.js          # Login / register UI
│       │   └── notesPage.js          # Main notes shell
│       ├── components/
│       │   ├── modals/               # Modal factory + note-specific modals
│       │   └── toasts/               # Toast container (subscribes to toastStore)
│       ├── features/
│       │   ├── auth/authService.js   # Login, register, logout, me
│       │   ├── notes/
│       │   │   ├── components/       # NoteList, NoteEditor
│       │   │   ├── services/         # notesService (CRUD + unlock + local patch)
│       │   │   └── utils/            # noteHelpers (word count, display title…)
│       │   ├── search/               # SearchBar component + searchService
│       │   ├── theme/                # ThemeToggle + themeService
│       │   └── toasts/               # toast() helper
│       ├── services/
│       │   └── apiClient.js          # fetch wrapper (auth headers, error normalise)
│       ├── utils/
│       │   ├── store.js              # Reactive createStore + 5 global stores
│       │   ├── autosave.js           # Debounced autosave controller
│       │   └── dom.js                # $, $$, el, show, render, trapFocus
│       └── styles/
│           ├── variables.css         # CSS custom properties (light + dark theme)
│           ├── reset.css
│           ├── typography.css
│           ├── layout.css
│           ├── animations.css
│           └── components.css        # All component styles
│
├── server/
│   └── src/
│       ├── app.js                    # Express bootstrap
│       ├── config/env.js             # Env var loading + validation
│       ├── database/pool.js          # pg Pool
│       ├── models/
│       │   ├── User.js               # UserModel (findById, findByEmail, create)
│       │   └── Note.js               # NoteModel (full CRUD + password ops)
│       ├── services/
│       │   ├── authService.js        # register, login, me
│       │   └── noteService.js        # CRUD + secureNote + verifyPassword
│       ├── controllers/
│       │   ├── authController.js
│       │   └── noteController.js
│       ├── routes/
│       │   ├── authRoutes.js
│       │   └── noteRoutes.js
│       ├── middleware/
│       │   ├── authenticate.js       # JWT guard
│       │   └── errorHandler.js       # Global error + validate middleware
│       ├── validators/
│       │   ├── authValidators.js
│       │   └── noteValidators.js
│       └── utils/
│           ├── ApiError.js           # Typed HTTP errors
│           └── response.js           # ok / created / noContent helpers
│
├── database/
│   ├── schema/init.sql               # PostgreSQL schema (auto-run by Docker)
│   └── seeders/seed.sql              # Demo user + sample notes
│
├── shared/
│   ├── constants/index.js            # API_ROUTES, limits, delays
│   ├── helpers/index.js              # wordCount, debounce, formatDate, uid, escapeHtml
│   └── types/index.js                # JSDoc type definitions
│
├── .env.example
├── .gitignore
├── docker-compose.yml
└── package.json
```

---

## Quick Start

### 1 — Prerequisites

- Node.js 18+
- Docker & Docker Compose (for Postgres), **or** a local PostgreSQL 14+ instance

### 2 — Clone & install

```bash
git clone https://github.com/you/gogoldocs.git
cd gogoldocs
npm run install:all
```

### 3 — Environment

```bash
cp .env.example .env
# Edit .env — at minimum set JWT_SECRET to a long random string
```

### 4a — Start with Docker (recommended)

```bash
docker-compose up -d          # starts postgres + seeds it automatically
npm run dev:server             # starts Express on :3001
```

### 4b — Start without Docker

```bash
# Create the DB, then:
psql $DATABASE_URL -f database/schema/init.sql
psql $DATABASE_URL -f database/seeders/seed.sql

npm run dev:server
```

### 5 — Open the frontend

The client is static HTML/CSS/JS — no build step required.

```bash
npm run dev:client   # serves client/ on http://localhost:5500
```

Or just open `client/index.html` directly (with a local server; `file://` won't work because ES modules require HTTP).

**Demo credentials:** `demo@gogoldocs.app` / `demo1234`

---

## API Reference

All endpoints are prefixed with `/api`.

### Auth

| Method | Path             | Body                     | Description           |
|--------|------------------|--------------------------|-----------------------|
| POST   | `/auth/register` | `{ email, password }`    | Create account        |
| POST   | `/auth/login`    | `{ email, password }`    | Login → JWT           |
| GET    | `/auth/me`       | —                        | Get current user      |

### Notes (all require `Authorization: Bearer <token>`)

| Method | Path                | Body                          | Description          |
|--------|---------------------|-------------------------------|----------------------|
| GET    | `/notes`            | —                             | List notes           |
| GET    | `/notes?q=term`     | —                             | Search notes         |
| POST   | `/notes`            | `{ title, body? }`            | Create note          |
| GET    | `/notes/:id`        | —                             | Get one note         |
| PATCH  | `/notes/:id`        | `{ title?, body? }`           | Update note          |
| DELETE | `/notes/:id`        | —                             | Delete note          |
| POST   | `/notes/:id/secure` | `{ password }`                | Lock note            |
| POST   | `/notes/:id/lock`   | `{ password }`                | Remove lock          |
| POST   | `/notes/:id/unlock` | `{ password }`                | Verify & unlock      |

---

## Architecture Notes

### Frontend — Reactive Store

`client/src/utils/store.js` exports a tiny `createStore(initialState)` factory with:

- `getState()` — returns current state snapshot
- `setState(patch | fn)` — merges patch, notifies subscribers
- `subscribe(fn)` — returns an unsubscribe function

Five global stores: `authStore`, `notesStore`, `searchStore`, `toastStore`, `themeStore`.

Components subscribe to relevant stores and re-render on change. No virtual DOM — targeted DOM mutation for performance.

### Frontend — ES Modules

No bundler required. The browser loads modules natively via `<script type="module">`. Dynamic `import()` is used for modals to avoid circular dependencies.

### Security Feature

Secure notes are end-to-end locked at the server:

1. Password is bcrypt-hashed (12 rounds) before storage.
2. `passwordHash` is stripped from all API responses by `sanitize()`.
3. Failed unlock attempts are tracked server-side (`failed_attempts` column).
4. After 5 failures the note is blocked until another note is selected (session only).
5. The client keeps `unlockedIds[]` in memory only — it resets on page reload.

---

## Code Quality Highlights

- No inline `<script>` or `<style>` — all JS and CSS are in separate files
- No global mutable state outside the store module
- Event delegation everywhere (no per-element listeners in lists)
- Async/await with proper error propagation
- Shared constants/helpers between client and server via `shared/`
- CSS custom properties for full theming with zero JS
- `escapeHtml()` prevents XSS in all dynamic content
- `trapFocus()` for accessible modal keyboard navigation
