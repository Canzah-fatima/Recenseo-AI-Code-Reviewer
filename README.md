# Recenseo

AI-powered code review, in the browser. Paste or drop a file, hit **Analyze**,
and Recenseo (via the Gemini API) returns:

- **Diagnostics** — every bug, security hole, leak, race, and smell it finds, each anchored to exact line numbers and shown as squiggles/gutter markers in the editor
- **Explainer** — a plain-language summary plus time/space complexity and the primary performance bottleneck
- **Diff** — a complete, drop-in optimized rewrite of the file, viewable side-by-side or inline, with one-click apply or copy
- **Health score** — a single 0–100 number derived from the diagnostics, so you can see the delta before/after a rewrite

Everything runs client-side. Your API key is stored only in your browser's
`localStorage` and is sent directly to Google's API — Recenseo has no backend
and never sees your code or your key.

## Why "Recenseo"

Latin for "I review / I examine" — the root of *recension* and *reconnaissance*.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL, click **Set Key** in the header, and paste a free
Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey).
There's a preset for each supported language if you want to try it on sample
code with known issues before pointing it at your own files.

### Optional: pre-fill the key at build time

Copy `.env.example` to `.env.local` and set `VITE_GEMINI_API_KEY`. Useful for
local/personal use. **Don't do this for a public deployment** — anything in
`VITE_*` ships in the client bundle, so a shared build would leak the key. For
a multi-user deployment, put a small backend in front of the Gemini API
instead and have the client call that.

## Model selection & resilience

Gemini model IDs get deprecated on a rolling basis — this is the actual bug
that used to make analysis fail outright ("AI model is not available"): the
app was hardcoded to a single model that Google later shut down.

Recenseo now ships with a small pool of independent, current model IDs
(`src/lib/gemini.ts` → `AVAILABLE_MODELS`) and defaults to **Auto**, which
tries each one in order until a request succeeds:

- A 404 (model doesn't exist / not available on your key) → falls through to
  the next model immediately
- A 429/5xx (rate limit / transient server error) → retries the *same* model
  with exponential backoff before falling through
- A 400/401/403 (bad key / no access) → fails fast with a clear message,
  since trying another model won't fix an auth problem

You can also pin a specific model in **Settings** if you have a preference.
If Google eventually retires every model in that list, update
`AVAILABLE_MODELS` — nothing else needs to change.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check, then produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | `tsc --noEmit` only |
| `npm run format` | Format with oxfmt |

## Deploying

`npm run build` outputs a static `dist/` folder — deploy it anywhere that
serves static files (Vercel, Netlify, Cloudflare Pages, GitHub Pages, S3 +
CloudFront, etc.). There's no server component.

## Stack

React 19 · TypeScript · Vite · Tailwind CSS v4 · Monaco Editor · `@google/genai`

## Project structure

```
src/
  App.tsx                    Top-level layout, state, keyboard shortcuts
  components/
    CodeEditor.tsx           Monaco editor + diagnostic markers/gutter
    AnalysisPanel.tsx        Diagnostics / Explainer / Diff tabs, report export
    SettingsModal.tsx        API key + model selection, persisted to localStorage
  lib/
    gemini.ts                Gemini API integration: schema, fallback chain, retries
    presets.ts                Sample files per language
    monacoTheme.ts            Custom "Obsidian" editor theme
    storage.ts                Safe localStorage wrappers + JSON helpers + file download
  types.ts                    Shared types + derived metrics
```

## Known limitations

- Client-side-only API key storage means this isn't meant for multi-tenant
  deployment as-is — see the note above.
- Very large files are capped in the UI at ~4,000 lines (`MAX_LINES` in
  `App.tsx`) since bigger files risk hitting model context limits and
  request timeouts.
- Monaco loads from a CDN (`main.tsx`) rather than being self-bundled. Fine
  for most deployments; if you need a fully offline build, switch to
  bundling `monaco-editor` locally and configuring its web workers.
