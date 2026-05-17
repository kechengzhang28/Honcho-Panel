import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { SearchX, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableRowSkeleton } from "@/components/shared/Skeletons";
import { SearchBox } from "@/components/shared/SearchBox";
import { usePeerList } from "./hooks";

export function PeerListPage() {
  const { wid = "default" } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const { t } = useTranslation("peers");
  const { t: tc } = useTranslation("common");

  const { data, isLoading, isError, error, refetch } = usePeerList(wid, page);

  const peers = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  const filtered = search
    ? peers.filter((p) => p.id.toLowerCase().includes(search.toLowerCase()))
    : peers;

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
        placeholder={t("search")}
      />

      {isLoading ? (
        <div className="space-y-3">
          <TableRowSkeleton rows={6} />
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        search ? (
          <EmptyState
            icon={SearchX}
            title={t("noSearchResults", { query: search })}
            description={t("noSearchResultsDesc")}
          />
        ) : (
          <EmptyState icon={Users} title={t("noPeers")} description={t("noPeersDesc")} />
        )
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peer ID</TableHead>
                <TableHead className="w-36">{tc("table.column.created")}</TableHead>
                <TableHead className="w-20 text-center">{tc("table.column.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((peer) => (
                <TableRow key={peer.id}>
                  <TableCell className="font-mono text-sm">{peer.id}</TableCell>
                  <TableCell className="w-36 text-sm text-[var(--color-text-secondary)]">
                    {new Date(peer.createdAt ?? "").toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/workspaces/${wid}/peers/${peer.id}`)}
                    >
                      {tc("button.view")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
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
