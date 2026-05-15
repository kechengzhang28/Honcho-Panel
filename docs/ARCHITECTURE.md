# Honcho-Panel — Architecture

> See also: [TECH_STACK.md](TECH_STACK.md) for tech stack and implementation,
> [DEPLOYMENT.md](DEPLOYMENT.md) for environment config and deployment.

## Scope

Honcho-Panel is a management UI for self-hosted [Honcho](https://github.com/plastic-labs/honcho) API servers. It runs as a pure static SPA.

```
Honcho-Panel (SPA)  ──HTTP──→  Honcho API Server (self-hosted)
```

**Assumption: self-hosted Honcho with auth disabled by default (`AUTH_USE_AUTH=false`).**

**Zero configuration for common setups.** Panel auto-detects the API URL via same-origin reverse proxy; users only need to configure it when the Honcho server runs on a different host.

## Architecture

### Data Flow

```
React Component → TanStack Query → Honcho SDK → Honcho API (runtime URL)
                    ↑↓ Cache layer
```

The API URL is resolved at runtime via a configurable fallback chain. Once configured, it is persisted in `localStorage` and survives page reloads.

**No global store.** The current Workspace / Peer / Session identity lives in URL path params:

```
/workspaces/:workspaceId              → workspaceId in URL
/workspaces/:workspaceId/peers/:peerId → peerId in URL
```

URL is the state source — native browser back/forward, bookmarks, and link sharing work for free.

### Route Tree

```
/workspaces/:wid?tab=overview             → Overview (queue status, recent sessions)
/workspaces/:wid?tab=peers                → Peer list + search
/workspaces/:wid/peers/:pid/representation → Peer representation
/workspaces/:wid/peers/:pid/card           → Peer card
/workspaces/:wid/peers/:pid/chat           → Peer chat
/workspaces/:wid?tab=sessions             → Session list
/workspaces/:wid/sessions/:sid            → Message timeline
/workspaces/:wid?tab=conclusions           → Conclusion list + semantic search
/settings                                  → API URL configuration + about
```

### Route → Feature Mapping

Endpoint details are maintained in [API.md](./API.md); this table maps routes to API sections only.

| Route | Feature | API sections |
|---|---|---|
| `/workspaces/:wid?tab=overview` | Overview | §4 Queue Status + §6 Sessions (list) |
| `/workspaces/:wid?tab=peers` | PeerList | §5 Peers (list) |
| `/workspaces/:wid/peers/:pid/representation` | PeerRepr | §5 Peer Representation |
| `/workspaces/:wid/peers/:pid/card` | PeerCard | §5 Peer Card |
| `/workspaces/:wid/peers/:pid/chat` | PeerChat | §5 Peer Chat |
| `/workspaces/:wid?tab=sessions` | SessionList | §6 Sessions (list) |
| `/workspaces/:wid/sessions/:sid` | SessionView | §6 Session Context + §7 Messages (list) |
| `/workspaces/:wid?tab=conclusions` | ConclusionList | §8 Conclusions (list + query) |
| `/settings` | SettingsPage | §3 Health |

## Key Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| API URL | Runtime (localStorage) | One build works everywhere; no rebuild for different Honcho instances |
| First-run setup | `/settings` page with API URL input | Zero friction; user types a URL, clicks test, done |
| Fallback chain | localStorage → same-origin → default | Reverse proxy = zero config; localhost = sensible default |
| No auth | Skip API key management (auth disabled by default) | Self-hosted Honcho in trusted networks |
| Static deploy | `npx vite build` → any HTTP server | Zero runtime dependencies |
| Docker deploy | Static files served by nginx in container | One `docker compose up`, ready to use |
| SPA routing | React Router BrowserRouter | Server must redirect to index.html |
