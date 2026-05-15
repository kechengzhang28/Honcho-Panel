# Honcho-Panel — Development Guide

> See also: [ARCHITECTURE.md](ARCHITECTURE.md) for architecture and tech stack,
> [API.md](API.md) for API reference,
> [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) for TanStack Query patterns,
> [UI_PATTERNS.md](UI_PATTERNS.md) for loading / empty / error states.

## 1. Prerequisites

| Tool | Version | Notes |
|---|---|---|
| Node.js | >= 20 (LTS) | Required by Vite 6 |
| npm | >= 10 | Ships with Node 20 |
| Git | any recent | |
| Honcho (self-hosted) | v3 | See [Honcho self-hosting guide](https://honcho.dev/docs/v3/contributing/self-hosting) |

**Local Honcho setup** (Docker):

```bash
git clone https://github.com/plastic-labs/honcho.git
cd honcho
cp .env.template .env
# Edit .env → set LLM_OPENAI_API_KEY, AUTH_USE_AUTH=false
cp docker-compose.yml.example docker-compose.yml
docker compose up -d --build
curl http://localhost:8000/health   # → {"status":"ok"}
```

## 2. Project Scaffold

```bash
npm create vite@latest . -- --template react-ts
# Or from scratch:
npm init -y
npm install react@19 react-dom@19 react-router@7
npm install @tanstack/react-query @honcho-ai/sdk
npm install react-hook-form zod @hookform/resolvers
npm install react-i18next i18next i18next-browser-languagedetector
npm install lucide-react sonner
npm install -D vite@6 @vitejs/plugin-react typescript @types/react @types/react-dom
npm install -D tailwindcss @tailwindcss/vite
npm install -D @biomejs/biome vitest @testing-library/react @testing-library/jest-dom jsdom
npm install -D msw
```

Then scaffold directory structure from [ARCHITECTURE.md §3](ARCHITECTURE.md#3-architecture).

## 3. Configuration Files

### `.gitignore`

```
node_modules
dist
.env
.env.local
*.tsbuildinfo
.vite
```

### `vite.config.ts`

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      "/health": "http://localhost:8000",
      "/v3": "http://localhost:8000",
    },
  },
});
```

The proxy avoids CORS during development — requests to `/v3/*` and `/health` are forwarded to the local Honcho server.

### `src/index.css` (Tailwind + Design Tokens)

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;

  --color-primary: #3B82F6;
  --color-primary-hover: #2563EB;
  --color-primary-light: #EFF6FF;
  --color-bg: #FFFFFF;
  --color-bg-secondary: #FAFAFA;
  --color-bg-muted: #F4F4F5;
  --color-text-primary: #18181B;
  --color-text-secondary: #71717A;
  --color-text-muted: #A1A1AA;
  --color-border: #E4E4E7;
  --color-border-light: #F4F4F5;
  --color-destructive: #EF4444;
  --color-success: #22C55E;
  --color-warning: #F59E0B;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
}
```

These map directly from [design.pen](design.pen) variables (`$color-*` → `--color-*`).

### `biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/1.9.4/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": { "recommended": true }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  }
}
```

## 4. App Bootstrap

### `src/main.tsx`

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import App from "./App";
import "./i18n";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: true,
      retry: (failureCount, error) => {
        if (error instanceof Error && "status" in error) {
          const s = (error as { status: number }).status;
          if (s === 404 || (s >= 400 && s < 500)) return false;
        }
        return failureCount < 3;
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="bottom-right" />
    </QueryClientProvider>
  </StrictMode>,
);
```

### `src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Shell } from "./components/layout/Shell";
import { OverviewPage } from "./features/workspaces/OverviewPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Navigate to="/workspaces/default?tab=overview" replace />} />
          <Route path="/workspaces/:wid" element={<OverviewPage />} />
          {/* Additional routes added per implementation phase */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

Shell renders the sidebar and `<Outlet />`. Runtime workspace ID is read from `useParams()` and passed to hooks in [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md).

## 5. Implementation Order

| Phase | Deliverable | Pages | Dependency |
|---|---|---|---|
| **0** | Scaffold + layout shell | Sidebar, routing, empty pages | None |
| **1** | Settings page | `/settings` — API URL input + connection test + language switcher | `GET /health` |
| **2** | Workspace + Overview | WorkspaceDropdown + `/workspaces/:wid?tab=overview` | Queue status, session list |
| **3** | Peer list + detail | `/workspaces/:wid?tab=peers`, peer detail (repr / card / chat) | Peer endpoints |
| **4** | Sessions | `/workspaces/:wid?tab=sessions`, session view timeline | Session + message endpoints |
| **5** | Conclusions | `/workspaces/:wid?tab=conclusions` — list + semantic search | Conclusion endpoints |
| **6** | Polish | i18n full coverage, loading/empty/error states on all pages, README | All above |

Build phases 0–2 first to get a working panel end-to-end (connect → browse workspace → see stats). Phases 3–5 add data detail views. Phase 6 is hardening.

## 6. Local Development

```bash
npm run dev            # → http://localhost:5173
npm run build          # → dist/
```

With the Vite proxy configured (§3), the Panel at `localhost:5173` reaches Honcho at `localhost:8000` without CORS issues. Enter `http://localhost:8000` as the API URL in Settings on first run.

### Routes to Test First

| Route | What to verify |
|-------|---------------|
| `/settings` | Health check → "Connected" badge |
| `/workspaces/default?tab=overview` | Queue stat cards + recent sessions |
| `/workspaces/default?tab=peers` | Peer table with data |
| `/workspaces/default/peers/:pid/representation` | Representation markdown |

### Mocking for Tests

Use MSW (Mock Service Worker) to intercept Honcho API calls:

```ts
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("http://localhost:8000/health", () =>
    HttpResponse.json({ status: "ok" })),
  http.post("http://localhost:8000/v3/workspaces/list", () =>
    HttpResponse.json({ items: [], total: 0, page: 1, size: 50, pages: 0 })),
];
```

See [API.md](API.md) for all endpoint request/response shapes.
