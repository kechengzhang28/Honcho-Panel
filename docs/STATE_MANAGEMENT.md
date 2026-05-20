# Honcho-Panel — State Management & Error Handling

> See also: [ARCHITECTURE.md](ARCHITECTURE.md) for architecture, routing, and HonchoClient singleton,
> [API.md](API.md) for endpoint reference.

## 1. Architecture

```
Component → custom hook (useXxx) → useQuery / useMutation → Honcho SDK
                ↑                    ↑ QueryClient cache
           wid from URL params    staleTime 30s · gcTime 5min
```

- **No global store** — `workspaceId` comes from URL path (`/workspaces/:wid/...`).
- **All server data** goes through TanStack Query.
- Only the API URL and UI language live in `localStorage`.

## 2. Query Key Design

### Naming Convention

```
['resource', scope, sub-resource, action, params]
  ── wide ───────────────────→ narrow
```

- Always array form.
- `workspaceId` MUST appear in every workspace-scoped key.
- Pagination/filter parameters are part of the key to segregate cache entries.

### Full Catalog

| Hook / Usage | Query Key | TanStack API |
|---|---|---|
| Workspace list | `['workspaces', { page, size }]` | `useQuery` |
| Queue status | `['workspaces', wid, 'queue']` | `useQuery` |
| Peer list | `['workspaces', wid, 'peers', { page, size }]` | `useQuery` |
| Peer detail (implicit) | `['workspaces', wid, 'peers', pid]` | `useQuery` |
| Peer representation | `['workspaces', wid, 'peers', pid, 'repr', { session_id, ... }]` | `useQuery` |
| Peer card | `['workspaces', wid, 'peers', pid, 'card']` | `useQuery` |
| Peer chat | *(keyless)* | `useMutation` |
| Session list | `['workspaces', wid, 'sessions', { page, size }]` | `useQuery` |
| Session context | `['workspaces', wid, 'sessions', sid, 'context', { tokens, ... }]` | `useQuery` |
| Message list | `['workspaces', wid, 'sessions', sid, 'messages', { page, size }]` | `useQuery` |
| Conclusion list | `['workspaces', wid, 'conclusions', { page, size }]` | `useQuery` |
| Conclusion search | *(keyless)* | `useMutation` |
| Send message | *(keyless)* | `useMutation` |
| Delete peer/session/conclusion | *(keyless)* | `useMutation` |

Peer chat and conclusion search use `useMutation` because they are POST endpoints with a semantic `query` body — not idempotent GETs. Results are stored in component state, not the QueryClient cache.

## 3. Cache Defaults

| Parameter | Value | Rationale |
|---|---|---|
| `staleTime` | `30_000` (30 s) | Deriver runs asynchronously; short window keeps data fresh |
| `gcTime` | `5 * 60_000` (5 min) | Tab-switching hits cache instead of refetching |
| `refetchOnWindowFocus` | `true` | User returning to tab sees latest state |
| `retry` | `3` | Exponential backoff |
| `refetchOnMount` | `true` | Always fetch on first mount |

## 4. Cache Invalidation

| Trigger | Invalidation Targets |
|---|---|
| Workspace changed | `removeQueries({ queryKey: ['workspaces', oldWid] })` — flush old workspace |
| Peer deleted | `['workspaces', wid, 'peers']` |
| Session deleted | `['workspaces', wid, 'sessions']` |
| Message sent | `['workspaces', wid, 'sessions', sid, 'messages']` + `['...', 'context']` + `['...', 'queue']` |
| Conclusion deleted | `['workspaces', wid, 'conclusions']` |

Use `queryClient.invalidateQueries()` in `onSuccess` of mutations. For workspace switch, `removeQueries` instantly purges old cache (no refetch); new workspace queries fetch on first mount.

## 5. Mutation Patterns

### Delete (standard)

```tsx
const deleteMutation = useMutation({
  mutationFn: (id: string) => honcho.sessions.delete(workspaceId, id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['workspaces', workspaceId, 'sessions'] });
    toast.success('Session deleted');
  },
  onError: (error) => toast.error(getErrorMessage(error)),
});
```

### Send Message (optimistic)

```tsx
const sendMutation = useMutation({
  mutationFn: (msg: MessageInput) =>
    honcho.sessions.createMessage(workspaceId, sessionId, msg),
  onMutate: async (newMsg) => {
    await queryClient.cancelQueries({ queryKey: ['workspaces', wid, 'sessions', sid, 'messages'] });
    const previous = queryClient.getQueryData(['workspaces', wid, 'sessions', sid, 'messages']);
    // Optimistically prepend the new message (see TanStack docs for exact pattern)
    return { previous };
  },
  onError: (err, _msg, context) => {
    queryClient.setQueryData(['workspaces', wid, 'sessions', sid, 'messages'], context?.previous);
    toast.error(getErrorMessage(err));
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['workspaces', wid, 'sessions', sid, 'messages'] });
    queryClient.invalidateQueries({ queryKey: ['workspaces', wid, 'sessions', sid, 'context'] });
    queryClient.invalidateQueries({ queryKey: ['workspaces', wid, 'queue'] });
  },
});
```

### Create / Get-or-Create

```tsx
const createMutation = useMutation({
  mutationFn: (id: string) => honcho.workspaces.create({ id }),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['workspaces'] });
  },
  onError: (error) => toast.error(getErrorMessage(error)),
});
```

## 6. Error Handling

### Error Classification

| Category | Examples | Retryable | UI |
|---|---|---|---|
| Network | `fetch failed`, timeout, DNS | Yes | Toast + ErrorBoundary fallback |
| API 4xx | 404, 400, 422 | **No** | Inline `ErrorState` with specific message |
| API 5xx | 500, 503 | Yes | Inline `ErrorState` with retry button |
| CORS | `blocked by CORS policy` | No | Dedicated hint to check reverse proxy config |
| Honcho unreachable | `/health` fails | N/A | Settings page red status banner |

### Global Retry Config

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof HonchoAPIError) {
          if (error.status === 404) return false;
          if (error.status >= 400 && error.status < 500) return false;
        }
        return failureCount < 3;
      },
    },
  },
});
```

### Error Message Extractor

```ts
function getErrorMessage(error: unknown): string {
  if (error instanceof HonchoAPIError) {
    return error.body?.detail ?? `Server error (${error.status})`;
  }
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Cannot reach Honcho server. Check the API URL in Settings.';
  }
  return 'An unexpected error occurred.';
}
```

This function is used by all mutation `onError` callbacks and by `ErrorState` components. It lives in `src/lib/utils.ts`.

## 7. Pagination

- Use `useQuery` with `page`/`size` in the query key. **Not** `useInfiniteQuery` — management panels favor page-based navigation over infinite scroll.
- Pagination controls are component state (`useState<number>(1)`), passed into the query key.
- Changing `page` triggers a new fetch automatically (stale key).

## 8. Workspace Switching

When the `:wid` route param changes:

```tsx
useEffect(() => {
  if (prevWid && prevWid !== currentWid) {
    queryClient.removeQueries({ queryKey: ['workspaces', prevWid] });
  }
}, [currentWid, prevWid]);
```

`removeQueries` instantly purges all old-workspace cache entries. TanStack Query refetches when the new workspace's components mount.

## 9. Hook File Convention

Each feature exposes all its hooks from a single file:

```
src/features/
├── settings/
│   └── hooks.ts          ← useConnectionTest, useApiUrl
├── workspaces/
│   └── hooks.ts          ← useWorkspaceList, useQueueStatus
├── peers/
│   └── hooks.ts          ← usePeerList, usePeerDetail, usePeerCard,
│                           usePeerRepr, usePeerChat, useDeletePeer
├── sessions/
│   └── hooks.ts          ← useSessionList, useSessionContext, useMessageList,
│                           useSendMessage, useDeleteSession
└── conclusions/
    └── hooks.ts          ← useConclusionList, useConclusionSearch,
                            useDeleteConclusion
```

Hooks are the **only place** that imports `getHoncho()` from `src/lib/honcho.ts`. Feature components import from `hooks.ts` — never from `@honcho-ai/sdk` directly.
