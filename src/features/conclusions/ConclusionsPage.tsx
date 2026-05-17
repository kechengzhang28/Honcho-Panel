import { useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Lightbulb, Search, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableRowSkeleton } from "@/components/shared/Skeletons";
import { useConclusionList, useConclusionSearch, useDeleteConclusion } from "./hooks";

export function ConclusionsPage() {
  const { wid = "default" } = useParams();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const { t } = useTranslation("conclusions");
  const { t: tc } = useTranslation("common");

  const { data, isLoading, isError, error, refetch } = useConclusionList(wid, page);
  const searchMutation = useConclusionSearch(wid);
  const deleteMutation = useDeleteConclusion(wid);

  const conclusions = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  const [searchResults, setSearchResults] = useState<
    { items: Awaited<ReturnType<typeof searchMutation.mutateAsync>>; query: string } | null
  >(null);

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    const result = await searchMutation.mutateAsync({ query: searchInput.trim() });
    setSearchResults({ items: result, query: searchInput.trim() });
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchResults(null);
  };

  const displayConclusions = searchResults?.items ?? conclusions;
  const showSearchEmpty = searchResults && searchResults.items.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">{t("title")}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("workspace", { wid })}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-80">
          <Input
            placeholder={t("searchPlaceholder")}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button
          variant="outline"
          onClick={handleSearch}
          disabled={searchMutation.isPending || !searchInput.trim()}
        >
          {searchMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          <Search className="h-4 w-4 mr-2" />
          {tc("button.search")}
        </Button>
        {searchResults && (
          <Button variant="ghost" size="sm" onClick={clearSearch}>
            {tc("button.clear")}
          </Button>
        )}
      </div>

      {searchMutation.isError && !searchResults && (
        <div className="text-sm text-[var(--color-destructive)] flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {t("searchFailed")}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          <TableRowSkeleton rows={6} />
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : showSearchEmpty ? (
        <EmptyState icon={Search} title={t("noSearchResults", { query: searchResults?.query ?? "" })} description="" />
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
                    onClick={() => deleteMutation.mutate(c.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-[var(--color-text-muted)]" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {!searchResults && totalPages > 1 && (
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
