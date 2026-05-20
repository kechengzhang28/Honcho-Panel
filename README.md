# Honcho-Panel

A clean, zero-config management UI for self-hosted [Honcho](https://github.com/plastic-labs/honcho) API servers.

> Honcho is an open-source memory library for building stateful AI agents. Honcho-Panel gives you a visual interface to manage workspaces, peers, sessions, messages, and more — without touching the API directly.

## Features

- **Workspace management** — create, browse, search, and delete workspaces
- **Peer explorer** — view peer representations, cards, and session history
- **Session viewer** — browse session timelines and message threads
- **Conclusion search** — semantic search across derived insights
- **Peer chat** — query a peer's memory using natural language
- **Zero configuration** — works out of the box with same-origin reverse proxy setups
- **Runtime API URL** — configure the Honcho API address from the browser; no rebuild needed
- **Pure static SPA** — no server runtime, deploy anywhere

## Quick Start

### Docker Compose (recommended)

```bash
git clone <repo-url> honcho-panel
cd honcho-panel
docker compose up -d
```

Open `http://localhost:8080` → enter your Honcho API URL → done.

To rebuild after pulling updates: `docker compose up -d --build`.


### Static files

```bash
npm install
npm run build          # produces dist/
npx serve dist -l 8080 # or any HTTP server
```

### Development

```bash
npm install
npm run dev            # Vite dev server with HMR at localhost:5173
```

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for environment configuration and deployment options.

## Usage

1. **Open the Panel** in your browser
2. **Select or create a workspace** from the dropdown in the sidebar
3. **Configure API URL** in Settings if needed (e.g. `http://localhost:8110`)
4. **Browse** overview, peers, sessions, conclusions, and chat with peers

The API URL is saved in your browser and persists across sessions. Change it anytime from the sidebar.

### Reverse proxy (zero-config)

If you serve Honcho-Panel and the Honcho API on the same domain (e.g. nginx proxies `/` to Panel and `/api` to Honcho), no setup page appears — the Panel auto-detects the API URL. Just open and go.

## Tech Stack

React 19 · TypeScript · Vite 6 · TanStack Query · shadcn/ui · Tailwind CSS v4 · Honcho SDK

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for development setup, [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for architecture and tech stack, [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for deployment.

## License

MIT © [Kecheng Zhang](https://github.com/kechengzhang28)
