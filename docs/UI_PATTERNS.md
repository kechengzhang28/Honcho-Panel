# Honcho-Panel — UI Patterns (Loading / Empty / Error)

> See also: [ARCHITECTURE.md](ARCHITECTURE.md) for architecture, routing, and component layers,
> [STATE_MANAGEMENT.md](STATE_MANAGEMENT.md) for query patterns and error handling logic.

## 1. Four-State Model

Every data-driven view MUST handle all four states. Components follow a single rendering pattern:

```
Loading → Empty ───────────┐
  ↓         ↓               ↓
  │    (no items in list)  (API failed)
  │         ↓               ↓
  └──→ Data ←───────────────┘
          ↑
       refetch
```

```tsx
function PeerListPage() {
  const { data, isLoading, isError, error, refetch } = usePeerList(workspaceId);

  if (isLoading) return <TableSkeleton rows={5} />;
  if (isError)   return <ErrorState error={error} onRetry={refetch} />;
  if (!data || data.items.length === 0) return <PeerListEmpty />;

  return <DataTable data={data.items} />;
}
```

## 2. State Components

### Skeleton

All skeletons extend a base primitive — a rounded gray bar with Tailwind's `animate-pulse`.

| Component | Props | Usage |
|---|---|---|
| `Skeleton` | `className?: string` | Primitive bar |
| `TableRowSkeleton` | `rows?: number` (default 5) | Table loading |
| `TextSkeleton` | `lines?: number` (default 4) | Paragraph loading (representation, card) |
| `MessageSkeleton` | `count?: number` (default 5) | Chat message timeline loading |
| `StatCardSkeleton` | none | Overview stat card placeholder |
| `DropdownSkeleton` | none | Sidebar workspace dropdown loading |

Visual spec (shared by all skeleton variants):
- `fill`: `$color-bg-muted`
- `cornerRadius`: `4`
- `animate-pulse` via Tailwind CSS (not in design.pen)

### EmptyState (design.pen: `X20EMC`)

Centered card: 400 px wide, 48 px padding, vertical layout, icon + title + description.

```ts
interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}
```

### ErrorState

Same visual footprint as `EmptyState` but with error context and a retry button.

```ts
interface ErrorStateProps {
  title?: string;        // default: "Something went wrong"
  description?: string;  // default: getErrorMessage(error)
  icon?: LucideIcon;     // default: AlertTriangle
  error?: unknown;
  onRetry?: () => void;
}
```

Always renders a "Try again" button when `onRetry` is provided. Error descriptions come from `getErrorMessage()` (defined in [STATE_MANAGEMENT.md §6](STATE_MANAGEMENT.md#6-error-handling)).

### BackLink (design.pen: `zeBYg`)

Inline navigation link used at the top of detail pages to return to the parent list.

```ts
interface BackLinkProps {
  href: string;
  children: string;   // e.g. "Back to Peers", "Back to Sessions"
}
```

Renders: `← Back to Peers` with `arrow-left` lucide icon (16 px, `$color-primary`) and text link (14 px, `$color-primary`). Used in Peer Detail, Session View, and any nested page.

### ChatMessage (design.pen: `S9xijd`, `AdR7T`)

Message bubble component for chat and session timelines. Two variants:

```ts
interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}
```

| Variant | Alignment | Background | Role label |
|---------|-----------|------------|-------------|
| `ChatMessage/User` | Right | `$color-primary-light` | "User" |
| `ChatMessage/Assistant` | Left | `$color-bg-muted` | "Assistant" |

Both variants include a header row (role label 12 px bold + timestamp 11 px) and a content bubble (14 px text, `cornerRadius: 8`, `padding: [10,14]`).

### Spinner (Button Loading)

shadcn/ui `Loader2` icon with `animate-spin`:

```tsx
<Button disabled={isPending}>
  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  Send
</Button>
```

### Toast

Library: `sonner` from shadcn/ui ecosystem. Position: bottom-right.

| API | Duration | Usage |
|---|---|---|
| `toast.success()` | 3 s | Delete confirm, create success, connection OK |
| `toast.error()` | 5 s | API failure, connection failed |
| `toast()` | 4 s | Copy to clipboard, neutral info |

Toast text is one line. Never toast for chat responses or search results — those are inline.

## 3. Per-Page State Catalog

### Overview Page

| State | Component | Details |
|---|---|---|
| Loading | `StatCardSkeleton` × 4 + `TableRowSkeleton` rows={3} | Four stat cards + recent sessions table |
| Error | `ErrorState` (full-page) | `title`: "Failed to load overview" |
| Sessions empty | `EmptyState` icon=`Calendar` | "No sessions yet. Sessions will appear here once peers start interacting." |

### Peer List

| State | Component | Details |
|---|---|---|
| Loading | `TableRowSkeleton` rows={6} | |
| Error | `ErrorState` + retry | |
| Empty | `EmptyState` icon=`Users` | "No peers found. Peers are created automatically when they send their first message." |
| Search empty | `EmptyState` icon=`SearchX` | `title`: "No peers match …" |

### Peer Detail — Representation Tab

| State | Component | Details |
|---|---|---|
| Loading | `TextSkeleton` lines={6} | |
| Error | `ErrorState` + retry | |
| Empty | `EmptyState` icon=`FileText` | "No representation yet. The deriver processes messages in the background." |

### Peer Detail — Card Tab

| State | Component | Details |
|---|---|---|
| Loading | `TextSkeleton` lines={5} | One bar per card item |
| Error | `ErrorState` + retry | |
| Empty | `EmptyState` icon=`IdCard` | "No peer card yet. Peer cards are generated automatically by the deriver." |

### Peer Detail — Chat Tab

| State | Component | Details |
|---|---|---|
| Chat loading | `MessageSkeleton` count={3} | Alternating left/right bubbles |
| Chat error | `ErrorState` icon=`Clock` | "Reasoning is taking longer than expected. The deriver may be processing a large backlog." |
| Empty (pre-chat) | `EmptyState` icon=`MessageCircle` | "Ask a question about this peer. Honcho will search its memory and provide reasoning." |

### Session List

| State | Component | Details |
|---|---|---|
| Loading | `TableRowSkeleton` rows={6} | |
| Error | `ErrorState` + retry | |
| Empty | `EmptyState` icon=`Calendar` | "No sessions yet. Sessions are created when peers interact." |

### Session View

| State | Component | Details |
|---|---|---|
| Loading | `MessageSkeleton` count={5} | Alternating left/right bubbles |
| Error | `ErrorState` + retry | |
| Context 404 | `ErrorState` icon=`FileQuestion` | "Session not found. It may have been deleted." + `BackLink` to sessions |
| No messages | `EmptyState` icon=`MessageSquare` | "No messages yet. Send a message to start the conversation." |
| Send pending | `Spinner` in button | Send button shows spinner, input stays enabled |

### Conclusions List

| State | Component | Details |
|---|---|---|
| Loading | `TableRowSkeleton` rows={6} | |
| Error | `ErrorState` + retry | |
| Empty | `EmptyState` icon=`Lightbulb` | "No conclusions yet. The deriver processes messages in the background — check back soon." |
| Search empty | `EmptyState` icon=`Search` | `title`: "No results for …" |
| Search error | `ErrorState` **inline** | Error scoped to search area only; list remains visible |

### Settings Page

| State | Component | Details |
|---|---|---|
| Connection testing | `Spinner` in button | |
| Connected | `Badge/Success` "Connected" | Green badge + Hostono version string |
| Disconnected | `Badge/Error` "Disconnected" | Red badge + "Check that your Honcho server is running at {url}" |

## 4. Implementation Order

For each feature page, build in this order:

1. **Data state** first — the happy path
2. **Loading states** — add the appropriate skeleton
3. **Error handling** — add `ErrorState` with retry
4. **Empty states** — add `EmptyState` with appropriate copy

Exception: for Overview and Settings, implement error/empty states alongside loading since they are the most common first-run experiences.
