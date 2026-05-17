import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Calendar, Trash2 } from "lucide-react";
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
import { useSessionList, useDeleteSession } from "./hooks";

export function SessionListPage() {
  const { wid = "default" } = useParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error, refetch } = useSessionList(wid, page);
  const deleteMutation = useDeleteSession(wid);

  const sessions = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">Sessions</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Workspace: {wid}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <TableRowSkeleton rows={6} />
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : sessions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No sessions yet"
          description="Sessions are created when peers interact."
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">{s.id}</TableCell>
                  <TableCell>
                    <Badge variant={s.isActive ?? false ? "success" : "secondary"}>
                      {s.isActive ?? false ? "Active" : "Inactive"}
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
                        View
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
