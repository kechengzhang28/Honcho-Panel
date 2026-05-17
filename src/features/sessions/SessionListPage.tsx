import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Calendar, SearchX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableRowSkeleton } from "@/components/shared/Skeletons";
import { SearchBox } from "@/components/shared/SearchBox";
import { useSessionList, useDeleteSession } from "./hooks";

export function SessionListPage() {
  const { wid = "default" } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { t } = useTranslation("sessions");
  const { t: tc } = useTranslation("common");

  const { data, isLoading, isError, error, refetch } = useSessionList(wid, page);
  const deleteMutation = useDeleteSession(wid);

  const sessions = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  const filtered = search
    ? sessions.filter((s) => s.id.toLowerCase().includes(search.toLowerCase()))
    : sessions;

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

      {isLoading ? (
        <div className="space-y-3">
          <TableRowSkeleton rows={6} />
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        search ? (
          <EmptyState icon={SearchX} title={t("noSearchResults", { query: search })} description="" />
        ) : (
          <EmptyState icon={Calendar} title={t("noSessions")} description={t("noSessionsDesc")} />
        )
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>{tc("table.column.status")}</TableHead>
                <TableHead>{tc("table.column.created")}</TableHead>
                <TableHead className="w-24">{tc("table.column.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.id}</TableCell>
                  <TableCell>
                    <Badge variant={s.isActive ?? false ? "success" : "secondary"}>
                      {s.isActive ?? false ? tc("status.active") : tc("status.inactive")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[var(--color-text-secondary)]">
                    {new Date(s.createdAt ?? "").toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/workspaces/${wid}/sessions/${s.id}`)}
                      >
                        {tc("button.view")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(s.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-[var(--color-text-muted)]" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && !search && (
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
