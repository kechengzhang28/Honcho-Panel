# Honcho-Panel — Architecture & Tech Stack

## Scope

Honcho-Panel is a management UI for self-hosted [Honcho](https://github.com/plastic-labs/honcho) API servers. It runs as a pure static SPA.

```
Honcho-Panel (SPA)  ──HTTP──→  Honcho API Server (self-hosted)
```

**Assumption: self-hosted Honcho with no authentication in trusted network environments.**

**Zero configuration for common setups.** Panel auto-detects the API URL via same-origin reverse proxy; users only need to configure it when the Honcho server runs on a different host.

## Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Language | TypeScript strict | Type safety baseline for open source |
| Framework | React 19 | Largest ecosystem, most familiar to self-hosted users |
| Build | Vite 6 | Fast HMR, zero-config, optimal for SPAs |
| Routing | React Router v7 | Nested routes match Workspace → Peer → Session hierarchy |
| Server state | TanStack Query v5 | Caching, dedup, retry, optimistic update — designed for REST APIs |
| HTTP client | `@honcho-ai/sdk` (TypeScript) | Official SDK with type safety; fallback to fetch for uncovered v3 endpoints |
| UI | shadcn/ui + Tailwind CSS v4 | Copy-paste components, no black-box deps; CSS-first config |
| Forms | React Hook Form + Zod | Declarative validation, type inference |
| Lint/Format | Biome | Single tool replacing ESLint + Prettier, faster |
| Test | Vitest + React Testing Library | Same ecosystem as Vite, zero extra config |
| CI | GitHub Actions | Free, community standard |
| Deploy | Static files + Docker image | No server runtime; Docker for one-command deployment |

## Environment Configuration

```
.env                    # Defaults — safe to commit
VITE_DEV_PORT=3000

.env.local              # Local overrides — gitignored
VITE_DEV_PORT=5173
VITE_ALLOWED_HOSTS=<your-hostname-1>,<your-hostname-2>
```

`vite.config.ts` reads `VITE_DEV_PORT` and `VITE_ALLOWED_HOSTS` from env, falls back to safe defaults when unset. The config file itself is safe to commit. Each developer maintains their own `.env.local`.

**The Honcho API URL is NOT a compile-time constant.** It is configured at runtime via the Panel's Setup page (see below).

## Architecture

### Data Flow

```
React Component → TanStack Query → Honcho SDK → Honcho API (runtime URL)
                    ↑↓ Cache layer
```

The API URL is resolved at runtime via a configurable fallback chain (see Honcho Client below). Once configured, it is persisted in `localStorage` and survives page reloads.

**No global store.** The current Workspace / Peer / Session identity lives in URL path params:

```
/workspaces/:workspaceId              → workspaceId in URL
/workspaces/:workspaceId/peers/:peerId → peerId in URL
```

URL is the state source — native browser back/forward, bookmarks, and link sharing work for free.

### Route Tree

```
/                              → Redirect to /workspaces (or /setup if not configured)
/setup                         → First-run setup: enter Honcho API URL, test connection
/workspaces                    → List + create
/workspaces/:wid               → Overview (queue status, recent sessions)
/workspaces/:wid/peers         → Peer list + search
/workspaces/:wid/peers/:pid    → Peer detail (representation, card, chat)
/workspaces/:wid/sessions      → Session list
/workspaces/:wid/sessions/:sid → Message timeline
/workspaces/:wid/conclusions   → Conclusion list + semantic search
```

### Component Layers

```
Page                    → Route binding, no business logic
Feature + hooks         → Business logic + TanStack Query
UI (shadcn) + Shared    → Pure presentation, no business logic
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
│   └── shared/                # DataTable, EmptyState, ErrorBoundary
├── features/
│   ├── setup/                 # First-run setup page
│   ├── workspaces/
│   ├── peers/
│   ├── sessions/
│   └── conclusions/
├── lib/
│   ├── honcho.ts              # Honcho SDK singleton (lazy, runtime-configurable)
│   └── utils.ts
└── types/
    └── honcho.ts
```

### Honcho Client (lazy singleton, runtime URL)

```ts
// src/lib/honcho.ts
import { Honcho } from "@honcho-ai/sdk";

function getApiUrl(): string {
  // 1. User configured via Setup page → stored in localStorage
  const stored = localStorage.getItem("honcho_api_url");
  if (stored) return stored;

  // 2. Same-origin auto-detect (reverse proxy scenario — zero config!)
  //    If Panel and Honcho share a domain, use the current origin.
  //    Example: nginx proxies / to Panel and /api to Honcho.
  //    return window.location.origin;

  // 3. Default fallback
  return "http://localhost:8110";
}

let _honcho: Honcho | null = null;

export function getHoncho(): Honcho {
  if (!_honcho) {
    _honcho = new Honcho({ baseURL: getApiUrl() });
  }
  return _honcho;
}

// Called from Setup page: validate & persist
export function configureApiUrl(url: string): void {
  localStorage.setItem("honcho_api_url", url);
  _honcho = new Honcho({ baseURL: url });
}

// Test if a URL points to a live Honcho server
export async function testConnection(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
```

No authentication layer. The Panel targets self-hosted Honcho in trusted networks.

### Setup Page (first-run experience)

```
User opens Panel for the first time
  → localStorage has no "honcho_api_url"
  → Redirect to /setup

Setup page shows:
  ┌─────────────────────────────────┐
  │  Welcome to Honcho-Panel        │
  │                                 │
  │  Honcho API URL:                │
  │  [ http://localhost:8110     ]  │  ← pre-filled with default
  │                                 │
  │  [ Test Connection ]            │  ← green check or red error
  │                                 │
  │  [ Connect ]                    │  ← save & enter app
  └─────────────────────────────────┘

Once connected:
  → localStorage "honcho_api_url" = user's URL
  → Redirect to /workspaces
  → Honcho client re-initialized with the new URL
```

## Route → Feature Mapping

| Route | Feature | Primary data |
|---|---|---|
| `/setup` | SetupPage | Connection config |
| `/workspaces` | WorkspaceList | `GET /workspaces` |
| `/workspaces/:wid` | WorkspaceDetail | Queue status, recent sessions |
| `/workspaces/:wid/peers` | PeerList | `GET /workspaces/:wid/peers` |
| `/workspaces/:wid/peers/:pid` | PeerDetail | Representation, card, chat |
| `/workspaces/:wid/sessions` | SessionList | `GET /peers/:pid/sessions` |
| `/workspaces/:wid/sessions/:sid` | SessionView | `GET /sessions/:sid/messages` |
| `/workspaces/:wid/conclusions` | ConclusionList | `GET /conclusions`, query |

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| API URL | Runtime (localStorage) | One build works everywhere; no rebuild for different Honcho instances |
| First-run setup | `/setup` page with connection test | Zero friction; user types a URL, clicks test, done |
| Fallback chain | localStorage → same-origin → default | Reverse proxy = zero config; localhost = sensible default |
| No auth | Skip API key management | Self-hosted Honcho in trusted networks |
| Static deploy | `npx vite build` → any HTTP server | Zero runtime dependencies |
| Docker deploy | Static files served by nginx in container | One `docker compose up`, ready to use |
| SPA routing | React Router BrowserRouter | Server must redirect to index.html |

## Deployment

### Option A: Docker Compose (recommended)

Add to Honcho's existing `docker-compose.yml`:

```yaml
honcho-panel:
  image: kechengzhang28/honcho-panel:latest
  ports:
    - "8080:80"
```

Then: `docker compose up -d` → open `http://localhost:8080` → enter API URL → done.

### Option B: Static files

```bash
npm run build          # produces dist/
# Serve dist/ with any HTTP server
npx serve dist -l 8080
```

### Option C: Reverse proxy (zero config for users)

```
nginx / caddy:
  /      → Honcho-Panel static files
  /api   → Honcho API Server :8110
```

When Panel and API share the same origin, Panel auto-detects the URL — no setup page needed.

### Development

```
npm run dev             # Vite dev server with HMR
```
