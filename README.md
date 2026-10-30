# NoteBuddy

An AI-powered note-taking app: rich-text notes, inline AI autocomplete,
one-click summarization, and semantic search over your own notes.

## Features

- **Auth** — email/password and optional Google OAuth via
  [better-auth](https://better-auth.com).
- **Notes** — create, rename, edit, and delete notes in a Tiptap rich-text
  editor.
- **Autosave** — note bodies are saved on an 800 ms debounce; embeddings are
  refreshed separately on a 3 s debounce.
- **AI autocomplete** — `Ctrl/Cmd + Shift + K` completes the current train of
  thought.
- **Summarize** — summarizes the current note with an LLM.
- **Semantic search** — embeds the query and finds similar notes with pgvector.

## Tech stack

| Layer     | Choice                                              |
| --------- | --------------------------------------------------- |
| Framework | Next.js 15 (App Router), React 19, TypeScript       |
| UI        | Tailwind CSS v4, shadcn/ui, Tiptap v3               |
| Auth      | better-auth (Drizzle adapter, cookie sessions)      |
| Database  | Neon Postgres + Drizzle ORM + pgvector              |
| AI        | Google GenAI embeddings, OpenRouter + Vercel AI SDK |

## Getting started

### 1. Prerequisites

- Node.js 20+
- pnpm
- A Postgres database with the [`vector`](https://github.com/pgvector/pgvector)
  extension (Neon supports it out of the box)

### 2. Install

```bash
pnpm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in at least `DATABASE_URL`, `BETTER_AUTH_SECRET`, `GOOGLE_GENAI_KEY`, and
`OPEN_ROUTER_API_KEY`. Google OAuth is optional; when `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET` are empty the Google buttons are hidden.

### 4. Set up the database

For a **fresh database**:

```bash
pnpm db:migrate
```

For an **existing database** created before the migration baseline was reset
(see note below), sync the schema instead:

```bash
pnpm db:push
```

> **Migration note:** the original migration set was incomplete (it altered a
> `note` table it never created), so the baseline was regenerated as a single
> `0000_*.sql` that includes the pgvector extension, the note table, the
> `content_text` column, and the HNSW embedding index. Existing deployments
> should use `db:push` once; fresh deployments should use `db:migrate`.

### 5. Run

```bash
pnpm dev
```

Open <http://localhost:3000>.

## Scripts

| Script                              | Purpose                                       |
| ----------------------------------- | --------------------------------------------- |
| `pnpm dev`                          | Start the dev server (Turbopack)              |
| `pnpm build`                        | Production build                              |
| `pnpm start`                        | Start the production server                   |
| `pnpm lint`                         | ESLint                                        |
| `pnpm typecheck`                    | `tsc --noEmit`                                |
| `pnpm format` / `pnpm format:check` | Prettier                                      |
| `pnpm db:generate`                  | Generate a Drizzle migration                  |
| `pnpm db:migrate`                   | Apply migrations                              |
| `pnpm db:push`                      | Push the schema directly (dev / existing DBs) |
| `pnpm db:studio`                    | Open Drizzle Studio                           |

## Architecture

```
app/
  (auth)/                  sign-in / sign-up pages
  dashboard/               authenticated shell, note list, editor page
  actions/                 server actions: auth, notes, search
  api/auth/[...all]/       better-auth handler
  api/completion/          streaming autocomplete (authenticated + rate limited)
  api/summarize/           note summarization (authenticated + rate limited)
components/
  text-editor.tsx          Tiptap editor, autosave, delete, summarize
  site-header.tsx          inline note title editing
  search.tsx               semantic search command palette
lib/
  auth/                    better-auth server config + browser client
  dal.ts                   session helpers (getSession / verifySession)
  db/                      Drizzle client + schema
  embeddings.ts            Gemini embedding generation (server only)
  env.ts                   zod-validated environment
  rate-limit.ts            in-memory rate limiter for AI routes
migrations/                Drizzle SQL migrations
```

### Data model

Better-auth owns `user`, `session`, `account`, and `verification`. The app adds:

| Column                      | Type           | Notes                                            |
| --------------------------- | -------------- | ------------------------------------------------ |
| `id`                        | `uuid`         | Primary key                                      |
| `user_id`                   | `text`         | FK to `user.id`, cascade delete                  |
| `title`                     | `text`         | Defaults to "Untitled"                           |
| `description`               | `jsonb`        | Tiptap document JSON (legacy rows may hold HTML) |
| `content_text`              | `text`         | Plain-text projection for previews/search        |
| `embeddings`                | `vector(1536)` | Gemini embedding of `content_text`               |
| `created_at` / `updated_at` | `timestamp`    |                                                  |

Indexes: `note_user_id_idx` (btree) and `note_embeddings_hnsw_idx` (HNSW
cosine).

### Security model

- Every server action calls `verifySession()` and filters by `user_id`.
- Embeddings are generated server-side only; clients never send vectors.
- AI routes require a session, validate input with zod, and are rate limited.
- Note previews render plain text (`content_text`), not raw HTML.

## Roadmap

- Richer search UX (Cmd+K dialog, highlighted snippets, hybrid full-text +
  vector).
- Password reset and email verification flows.
- Note tags/folders, favorites, export, and version history.
- Durable rate limiting and background embedding jobs.
