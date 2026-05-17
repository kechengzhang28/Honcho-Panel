import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { SearchX, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { usePeerList } from "./hooks";

export function PeerListPage() {
  const { wid = "default" } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error, refetch } = usePeerList(wid, page);

  const peers = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  const filtered = search
    ? peers.filter((p) => p.id.toLowerCase().includes(search.toLowerCase()))
    : peers;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Peers</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Workspace: {wid}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-72">
          <Input
            placeholder="Search peers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

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
            title={`No peers match "${search}"`}
            description="Try a different search term."
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No peers found"
            description="Peers are created automatically when they send their first message."
          />
        )
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peer ID</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((peer) => (
                <TableRow key={peer.id}>
                  <TableCell className="font-mono text-sm">{peer.id}</TableCell>
                  <TableCell className="text-sm text-[var(--color-text-secondary)]">
                    {new Date(peer.createdAt ?? "").toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/workspaces/${wid}/peers/${peer.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
