# Honcho-Panel — Tech Stack & Implementation

> See also: [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions and route design,
> [DEPLOYMENT.md](DEPLOYMENT.md) for environment config and deployment.

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

## Component Layers

```
Page                    → Route binding, no business logic
Feature + hooks         → Business logic + TanStack Query
UI (shadcn) + Shared    → Pure presentation, no business logic
```

Features share types via `src/types/` only. Cross-feature imports of hooks or components are forbidden.

## Project Structure

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
│   ├── settings/               # API URL configuration
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

## Honcho Client (lazy singleton, runtime URL)

```ts
// src/lib/honcho.ts
import { Honcho } from "@honcho-ai/sdk";

function getApiUrl(): string {
  // 1. User configured via Settings page → stored in localStorage
  const stored = localStorage.getItem("honcho_api_url");
  if (stored) return stored;

  // 2. Same-origin auto-detect (reverse proxy scenario — zero config!)
  //    If Panel and Honcho share a domain, use the current origin.
  //    Example: nginx proxies / to Panel and /api to Honcho.
  //    return window.location.origin;

  // 3. Default fallback
  return "http://localhost:8000";
}

let _honcho: Honcho | null = null;

export function getHoncho(): Honcho {
  if (!_honcho) {
    _honcho = new Honcho({ baseUrl: getApiUrl() });
  }
  return _honcho;
}

// Called from Settings page: validate & persist
export function configureApiUrl(url: string): void {
  localStorage.setItem("honcho_api_url", url);
  _honcho = new Honcho({ baseUrl: url });
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
