# Honcho-Panel — Deployment & Configuration

> See also: [ARCHITECTURE.md](ARCHITECTURE.md) for design decisions and route design,
> [TECH_STACK.md](TECH_STACK.md) for tech stack and project structure.

## Environment Configuration

```
.env                    # Defaults — safe to commit
VITE_DEV_PORT=3000

.env.local              # Local overrides — gitignored
VITE_DEV_PORT=5173
VITE_ALLOWED_HOSTS=<your-hostname-1>,<your-hostname-2>
```

`vite.config.ts` reads `VITE_DEV_PORT` and `VITE_ALLOWED_HOSTS` from env, falls back to safe defaults when unset. The config file itself is safe to commit. Each developer maintains their own `.env.local`.

**The Honcho API URL is NOT a compile-time constant.** It is configured at runtime via the Panel's Settings page (see [TECH_STACK.md](TECH_STACK.md)).

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

## Development

```
npm run dev             # Vite dev server with HMR
```
