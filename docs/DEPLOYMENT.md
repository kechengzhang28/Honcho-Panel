# Honcho-Panel — Deployment & Configuration

> See also: [ARCHITECTURE.md](ARCHITECTURE.md) for architecture, tech stack, and design decisions.

## Environment Configuration

```
.env                    # Defaults — safe to commit
VITE_DEV_PORT=3000

.env.local              # Local overrides — gitignored
VITE_DEV_PORT=5173
VITE_ALLOWED_HOSTS=<your-hostname-1>,<your-hostname-2>
```

`vite.config.ts` reads `VITE_DEV_PORT` and `VITE_ALLOWED_HOSTS` from env, falls back to safe defaults when unset. The config file itself is safe to commit. Each developer maintains their own `.env.local`.

**The Honcho API URL is NOT a compile-time constant.** It is configured at runtime via the Panel's Settings page (see [ARCHITECTURE.md §5](./ARCHITECTURE.md#5-honcho-client)).

## Deployment

### Option A: Docker Compose (recommended)

Repo includes a `docker-compose.yml` — just clone and run:

```bash
git clone <repo-url> honcho-panel
cd honcho-panel
docker compose up -d
```

Open `http://localhost:8080` → enter your Honcho API URL → done.

To rebuild after pulling changes:

```bash
docker compose up -d --build
```

#### Using the pre-built image

If you prefer not to build locally, replace the `build: .` in `docker-compose.yml` with:

```yaml
image: kechengzhang28/honcho-panel:latest
```

#### API reverse proxy (optional, eliminates CORS)

To avoid CORS issues between the Panel and your Honcho API, uncomment the `proxy_pass` lines in `nginx/default.conf` before building. Then the Panel can use a relative API URL (e.g. just `/v3`) since both services share the same origin.

### Option B: Static files

```bash
npm install
npm run build          # produces dist/
# Serve dist/ with any HTTP server
npx serve dist -l 8080
```

### Option C: Reverse proxy (zero config for users)

```
nginx / caddy:
  /      → Honcho-Panel static files
  /api   → Honcho API Server :8000
```

When Panel and API share the same origin, Panel auto-detects the URL — no setup page needed.

## Development

```
npm run dev             # Vite dev server with HMR
```
