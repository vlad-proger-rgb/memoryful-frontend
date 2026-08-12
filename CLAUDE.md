# memoryful-frontend

Vue 3 (`<script setup>`) + Vite + TypeScript + Tailwind v4 + Pinia. SPA, no SSR.

## Commands

```bash
npm run dev          # :3000, proxies API paths to localhost:8000
npm run type-check   # vue-tsc --build
npm run lint         # eslint --fix
npm run format       # prettier over src/
npm run test:unit    # vitest (watch); add -- --run for one shot
npm run test:e2e     # playwright, expects the dev server already running
npm run build        # type-check + vite build
```

The backend must be up in Docker first — see the workspace root `CLAUDE.md`.

## Layout

| Path               | Holds                                                  |
| ------------------ | ------------------------------------------------------ |
| `src/api/`         | one module per resource + `client.ts` (axios instance) |
| `src/stores/`      | Pinia stores                                           |
| `src/views/`       | route-level components                                 |
| `src/components/`  | reusable; subfolders `ai/`, `auth/`, `day/`, `ui/`     |
| `src/composables/` | shared reactive logic                                  |
| `src/types/`       | hand-written mirrors of the backend Pydantic schemas   |

`@/` aliases `src/`. Use it instead of deep relative imports.

## Conventions

- API calls go through `src/api/<resource>.ts` — components never call axios directly.
  Successful responses use the `Msg<T>` envelope (`code`, `msg`, `data`); unwrap it in the
  api layer, not in components. **Errors use a different shape** — `{"detail": "..."}` from
  FastAPI's `HTTPException` and the handlers in the backend's `app/core/exceptions.py` —
  so error handling can't assume `msg`.
- **Payloads are camelCase on the wire, both directions.** The backend serializes via
  `fastapi_camelcase`, so its `is_new_user` arrives as `isNewUser`. Types in `src/types/`
  should mirror the JSON, not the Python.
- Tailwind utilities are the default. A `<style>` block is fine where Tailwind genuinely
  can't express it — deep selectors into a third-party widget's DOM, keyframes, scrollbar
  styling. `ui/BaseAutocomplete.vue` is an existing example. Don't add one to restate a
  utility, and don't rewrite existing blocks into utilities without checking why they exist.
- Types in `src/types/` are maintained by hand against `app/schemas/` in the backend. There
  is no codegen — change the backend schema and this in the same pass, or the mismatch only
  surfaces at runtime.

## Mobile

Phones are a first-class target. **Check every visual change at 375x812 as well as desktop** —
most of what broke historically was invisible on a laptop.

- Responsive behavior is Tailwind `md:` variants, not JS.
- Below `md` the nav is `BottomNav.vue` (glass capsule, icon tabs, MemoryfulAI orb centered);
  at `md`+ it's `Navbar.vue`. Destinations come from `src/config/navigation.ts` for both.
  `App.vue` picks between them with `hidden md:flex` / `md:hidden` — the only place that
  breakpoint is decided, so don't set `display` on either nav root in scoped CSS, which
  outranks the utility and brings the nav back at the wrong size.
- Clearing a fixed bar reads `--app-header-height` / `--bottom-nav-total` from
  `assets/main.css`; the latter already folds in `env(safe-area-inset-bottom)`.
- `opacity-0 group-hover:opacity-100` hides a control outright on touch — gate it behind
  `@media (hover: hover)`. `title="..."` is not a label there either.
- Open gaps are tagged **`mobile`** on the TickTick board; check it before re-diagnosing.

`npm run dev` also binds the LAN for real-device testing, and proxies the MinIO bucket
(`^/memoryful/`) so default asset URLs stay relative and same-origin.

## Things that will bite you

- **The vite proxy is an explicit allow-list.** `vite.config.ts` proxies a hard-coded regex
  of path prefixes to `:8000` — currently `auth`, `days`, `months`, `countries`, `cities`,
  `insights`, `suggestions`, `tags`, `trackables`, `trackable-types`, `storage`,
  `workspaces`, `chat-models`, `ai`. A **new top-level API prefix must be added there**,
  otherwise it 404s in dev while working perfectly in Swagger.
- **Playwright is scaffolding, not a suite.** `e2e/vue.spec.ts` is the untouched Vue starter
  template and its config still points at the default `:5173` while dev runs on `:3000`.
  Nothing here is worth trusting or maintaining yet; if we start writing real E2E tests,
  fix the `baseURL` first.
- Photos referenced by restored prod data live in production GCS and will show as broken
  images locally. Expected; not a bug to chase.

## Rules

- **Commit only when asked** — then write the message yourself and commit. See the commit
  convention in the workspace root `CLAUDE.md`.
