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
  /api   → Honcho API Server :8000
```

When Panel and API share the same origin, Panel auto-detects the URL — no setup page needed.

## Cross-Origin Setup (Panel & API on different machines)

When Honcho-Panel and the Honcho API server run on **different machines** (or different ports), the browser enforces CORS (Cross-Origin Resource Sharing). The Honcho API must explicitly allow requests from the Panel's origin.

### The Problem

You open the Panel at `http://machine-a:5173`, configure the API URL as `http://machine-b:8110`, and see:

- Blank page / loading spinner that never resolves
- Browser DevTools → Console: `blocked by CORS policy`
- Browser DevTools → Network: `(failed) net::ERR_FAILED` or no response

This happens because the Honcho backend only allows a default set of origins (`localhost`, `127.0.0.1:8000`, `api.honcho.dev`). Your Panel's origin is not in that list.

### The Fix

**On the Honcho backend machine**, set the `HONCHO_CORS_ORIGINS` environment variable:

```bash
# .env (Honcho backend)
HONCHO_CORS_ORIGINS=http://machine-a:5173,http://machine-a:4173,http://machine-a-hostname:5173
```

Multiple origins are comma-separated. Common ports:

| Port  | When it's used                    |
|-------|-----------------------------------|
| 5173  | Vite dev server (`npm run dev`)   |
| 4173  | Vite preview (`npm run preview`)  |
| 8080  | Docker / static file server       |

Then **rebuild/restart** the Honcho API container for the change to take effect:

```bash
docker compose build api
docker compose up -d api
```

> **Note:** `HONCHO_CORS_ORIGINS` requires Honcho v0.x+ with [CORS env var support](https://github.com/plastic-labs/honcho). If your Honcho version doesn't have this, you need to add it to `src/main.py` manually (see [Honcho CORS patch](#honcho-cors-patch) below).

### Tailscale Example

If both machines are on a Tailscale network:

```bash
# .env on kz-server (100.90.35.63)
HONCHO_CORS_ORIGINS=http://100.111.96.86:5173,http://kz-rog-strix:5173

# Panel Settings → API URL: http://100.90.35.63:8110
```

Make sure the Honcho API port is reachable from the Panel machine (e.g. via `socat` proxy or binding to the Tailscale interface).

### Verification

After restart, test the CORS header:

```bash
curl -s -I \
  -H "Origin: http://machine-a:5173" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS http://machine-b:8110/v3/health \
  | grep access-control-allow-origin
```

Expected output:

```
access-control-allow-origin: http://machine-a:5173
```

### Honcho CORS Patch

If your Honcho version doesn't support `HONCHO_CORS_ORIGINS`, add this to `src/main.py`:

```python
# After the origins list, before app.add_middleware(CORSMiddleware, ...)
import os
if extra := os.getenv("HONCHO_CORS_ORIGINS"):
    origins.extend(o.strip() for o in extra.split(",") if o.strip())
```

## Development

```
npm run dev             # Vite dev server with HMR
```
