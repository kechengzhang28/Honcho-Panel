import { useState, useMemo } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Lightbulb, Trash2, ChevronDown, Check, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableRowSkeleton } from "@/components/shared/Skeletons";
import { SearchBox } from "@/components/shared/SearchBox";
import { useConclusionList, useDeleteConclusion } from "./hooks";

export function ConclusionsPage() {
  const { wid = "default" } = useParams();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [observedFilter, setObservedFilter] = useState<string>("");
  const { t } = useTranslation("conclusions");
  const { t: tc } = useTranslation("common");

  const { data, isLoading, isError, error, refetch } = useConclusionList(wid, page, 50);
  const deleteMutation = useDeleteConclusion(wid);

  const conclusions = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const displayConclusions = useMemo(() => {
    let filtered = conclusions;
    if (search) {
      filtered = filtered.filter((c) =>
        c.content?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    if (observedFilter) {
      filtered = filtered.filter((c) => c.observedId === observedFilter);
    }
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt ?? 0).getTime();
      const dateB = new Date(b.createdAt ?? 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [conclusions, search, observedFilter, sortOrder]);

  const observedPeers = useMemo(() => {
    const set = new Set(conclusions.map((c) => c.observedId).filter(Boolean));
    return Array.from(set);
  }, [conclusions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">{t("title")}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("workspace", { wid })}
        </p>
      </div>

      <SearchBox
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("searchPlaceholder")}
      />

      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-muted)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
            {observedFilter
              ? `Observed: ${observedFilter}`
              : t("filter.allPeers")}
            <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setObservedFilter("")} className="flex items-center justify-between">
              {t("filter.allPeers")}
              {!observedFilter && <Check className="h-4 w-4 text-[var(--color-primary)]" />}
            </DropdownMenuItem>
            {observedPeers.map((peer) => (
              <DropdownMenuItem key={peer} onClick={() => setObservedFilter(peer)} className="flex items-center justify-between">
                {peer}
                {observedFilter === peer && <Check className="h-4 w-4 text-[var(--color-primary)]" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-muted)] px-3 py-2 text-sm text-[var(--color-text-primary)]">
            {t("filter.sort", { order: sortOrder === "newest" ? t("filter.newest") : t("filter.oldest") })}
            <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setSortOrder("newest")} className="flex items-center justify-between">
              {t("filter.newest")}
              {sortOrder === "newest" && <Check className="h-4 w-4 text-[var(--color-primary)]" />}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setSortOrder("oldest")} className="flex items-center justify-between">
              {t("filter.oldest")}
              {sortOrder === "oldest" && <Check className="h-4 w-4 text-[var(--color-primary)]" />}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <TableRowSkeleton rows={6} />
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : search && displayConclusions.length === 0 ? (
        <EmptyState icon={SearchX} title={t("noSearchResults", { query: search })} description="" />
      ) : displayConclusions.length === 0 ? (
        <EmptyState icon={Lightbulb} title={t("noConclusions")} description={t("noConclusionsDesc")} />
      ) : (
        <>
          <div className="space-y-3">
            {displayConclusions.map((c) => (
              <div
                key={c.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-[var(--color-bg)] p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-[var(--color-text-primary)]">{c.content}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                      <span>{t("observer", { id: c.observerId })}</span>
                      <span>{t("observed", { id: c.observedId })}</span>
                      {c.sessionId && <span>{t("session", { id: c.sessionId })}</span>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:text-[var(--color-destructive)]"
                    onClick={() => deleteMutation.mutate(c.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!search && totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-text-secondary)]">
                {tc("pagination.pageOf", { page, total: totalPages })}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  {tc("button.previous")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {tc("button.next")}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
