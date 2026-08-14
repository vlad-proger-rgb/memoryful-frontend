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
  Success responses use the `Msg<T>` envelope (`code`, `msg`, `data`), unwrapped in the api
  layer. **Errors are a different shape** — `{"detail": "..."}` from FastAPI — so error
  handling can't assume `msg`.
- **Payloads are camelCase on the wire, both directions.** `is_new_user` arrives as
  `isNewUser`; types in `src/types/` mirror the JSON, not the Python. Maintained by hand
  against the backend's `app/schemas/` — no codegen, so change both in the same pass.
- Tailwind utilities are the default. A `<style>` block is fine where Tailwind genuinely
  can't express it — deep selectors into a third-party widget, keyframes, scrollbars
  (`ui/BaseAutocomplete.vue` is an example). Don't add one to restate a utility, and don't
  rewrite an existing block without checking why it exists.

## Mobile

Phones are a first-class target. **Check every visual change at 375x812 as well as desktop.**

- Responsive behavior is Tailwind `md:` variants, not JS. Reach for a JS breakpoint only
  when something is genuinely _behavioral_ — a scroll lock, a drawer's default state.
- Below `md` the nav is `BottomNav.vue`; at `md`+ it's `Navbar.vue`, destinations from
  `src/config/navigation.ts`. `App.vue` picks between them with `hidden md:flex` /
  `md:hidden` — the only place that breakpoint is decided, so never set `display` on either
  nav root in scoped CSS: it outranks the utility and brings the nav back at the wrong size.
- Clearing a fixed bar reads `--app-header-height` / `--bottom-nav-total` from
  `assets/main.css`; the latter already folds in `env(safe-area-inset-bottom)`.
- `opacity-0 group-hover:opacity-100` hides a control outright on touch — gate it behind
  `@media (hover: hover)`. `title="..."` is not a label there either; add `aria-label`.
- Text inputs need 16px (`text-base`) below `md`, or iOS Safari zooms the page on focus.
- Open gaps are tagged **`mobile`** on the TickTick board; check it before re-diagnosing.

`npm run dev` binds the LAN for real-device testing and proxies the MinIO bucket
(`^/memoryful/`) so asset URLs stay relative and same-origin.

## Things that will bite you

- **The vite proxy is an explicit allow-list.** `vite.config.ts` proxies a hard-coded regex
  of path prefixes to `:8000`. A **new top-level API prefix must be added there**, or it
  404s in dev while working perfectly in Swagger.
- **Playwright is scaffolding, not a suite.** `e2e/vue.spec.ts` is the untouched Vue starter
  template and its config still points at `:5173` while dev runs on `:3000`. Nothing here is
  worth trusting yet; fix the `baseURL` first if we write real E2E tests.
