# Honcho-Panel — Architecture

> See also: [API.md](API.md) for endpoint reference,
> [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) for TanStack Query patterns and error handling,
> [UI_PATTERNS.md](UI_PATTERNS.md) for loading / empty / error states,
> [DEPLOYMENT.md](DEPLOYMENT.md) for deployment and configuration,
> [I18N.md](I18N.md) for internationalization.

## 1. Overview

Honcho-Panel is a management UI for self-hosted [Honcho](https://github.com/plastic-labs/honcho) API servers. It runs as a pure static SPA — no backend, no server runtime.

```
Honcho-Panel (SPA)  ──HTTP──→  Honcho API Server (self-hosted)
```

Assumes auth disabled by default (`AUTH_USE_AUTH=false`). Zero configuration for reverse proxy setups; users only need to configure the API URL when Honcho runs on a different host.

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript strict | Type safety baseline |
| Framework | React 19 | Largest ecosystem, most familiar to self-hosted users |
| Build | Vite 6 | Fast HMR, zero-config for SPAs |
| Routing | React Router v7 | Nested routes match Workspace → Peer → Session hierarchy |
| Server state | TanStack Query v5 | Caching, dedup, retry, optimistic updates |
| HTTP client | `@honcho-ai/sdk` | Official Honcho TypeScript SDK |
| UI | shadcn/ui + Tailwind CSS v4 | Copy-paste components, no black-box deps |
| Forms | React Hook Form + Zod | Declarative validation, type inference |
| Lint / Format | Biome | Single tool replacing ESLint + Prettier |
| Test | Vitest + React Testing Library | Same Vite ecosystem, zero extra config |
| CI | GitHub Actions | Free, community standard |
| Deploy | Static files + Docker | No server runtime; `docker compose up` |

## 3. Architecture

### Data Flow

```
React Component → TanStack Query → Honcho SDK → Honcho API (runtime URL)
                    ↑↓  Cache layer
```

The API URL is resolved at runtime and persisted in `localStorage`. Once configured, it survives page reloads and works across tabs. Details in §5.

### Component Layers

```
Page                    → Route binding, no business logic
Feature + hooks         → Business logic + TanStack Query
UI (shadcn) + Shared    → Pure presentation
```

Features share types via `src/types/` only. Cross-feature imports of hooks or components are forbidden.

### Project Structure

```
src/
├── main.tsx
├── App.tsx
├── router.tsx
├── index.css                  # Tailwind
├── components/
│   ├── ui/                    # shadcn/ui primitives
│   ├── layout/                # Shell, Sidebar
│   └── shared/                # DataTable, EmptyState, ErrorState, Skeleton, ErrorBoundary
├── features/
│   ├── settings/
│   ├── workspaces/
│   ├── peers/
│   ├── sessions/
│   └── conclusions/
├── lib/
│   ├── honcho.ts              # Honcho SDK singleton
│   └── utils.ts               # getErrorMessage, etc.
└── types/
    └── honcho.ts
```

## 4. Routing

**No global store.** Current resource identity lives in URL path params:

```
/workspaces/:wid              → workspaceId
/workspaces/:wid/peers/:pid   → peerId
```

URL is the state source — back/forward, bookmarks, and link sharing work for free.

### Route Tree

```
/workspaces/:wid?tab=overview        → Overview (queue status, recent sessions)
/workspaces/:wid?tab=peers           → Peer list + search
/workspaces/:wid/peers/:pid/...      → Peer detail (representation / card / chat)
/workspaces/:wid?tab=sessions        → Session list
/workspaces/:wid/sessions/:sid       → Message timeline
/workspaces/:wid?tab=conclusions     → Conclusion list + semantic search
/settings                            → API URL configuration + about
```

Endpoint assignments are maintained in [API.md §10 Panel Usage Map](./API.md#10-panel-usage-map).

## 5. Honcho Client

Lazy singleton — created on first use, reconfigurable at runtime. Lives in `src/lib/honcho.ts`.

```ts
import { Honcho } from "@honcho-ai/sdk";

function getApiUrl(): string {
  const stored = localStorage.getItem("honcho_api_url");
  if (stored) return stored;
  return "http://localhost:8000";       // Self-hosted default
}

let _honcho: Honcho | null = null;

export function getHoncho(): Honcho {
  if (!_honcho) {
    _honcho = new Honcho({ baseUrl: getApiUrl() });
  }
  return _honcho;
}

export function configureApiUrl(url: string): void {
  localStorage.setItem("honcho_api_url", url);
  _honcho = new Honcho({ baseUrl: url });
}

export async function testConnection(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
```

Fallback chain: `localStorage` → same-origin auto-detect → `localhost:8000`. The `testConnection` function is called from the Settings page to validate before persisting.

## 6. Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| API URL | Runtime (`localStorage`) | One build works for any Honcho instance |
| First-run setup | `/settings` page | Type a URL, click test — zero friction |
| Auth | Disabled by default | Self-hosted Honcho in trusted networks |
| Static deploy | `npx vite build` → any HTTP server | Zero runtime dependencies |
| Docker | Static files served by nginx | One `docker compose up`, ready to use |
| SPA routing | React Router (BrowserRouter) | Server redirects to `index.html` |
