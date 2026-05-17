import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { Activity, CheckCircle2, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { StatCardSkeleton } from "@/components/shared/Skeletons";
import { useQueueStatus } from "./hooks";

export function OverviewPage() {
  const { wid = "default" } = useParams();
  const { t } = useTranslation("overview");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">{t("title")}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          {t("workspace", { wid })}
        </p>
      </div>

      <QueueStats workspaceId={wid} />
      <RecentSessions workspaceId={wid} />
    </div>
  );
}

function QueueStats({ workspaceId }: { workspaceId: string }) {
  const { data: queue, isLoading, isError, error, refetch } = useQueueStatus(workspaceId);
  const { t } = useTranslation("overview");

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState title={t("queueFailed")} error={error} onRetry={() => refetch()} />;
  }

  if (!queue) return null;

  const stats = [
    { label: t("stats.total"), value: queue.totalWorkUnits, icon: Activity },
    { label: t("stats.completed"), value: queue.completedWorkUnits, icon: CheckCircle2 },
    { label: t("stats.inProgress"), value: queue.inProgressWorkUnits, icon: Loader2 },
    { label: t("stats.pending"), value: queue.pendingWorkUnits, icon: Clock },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--color-text-secondary)]">
                <stat.icon className="h-4 w-4" />
                {stat.label}
              </div>
              <div className="text-[28px] font-bold text-[var(--color-text-primary)]">{stat.value}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecentSessions({ workspaceId: _workspaceId }: { workspaceId: string }) {
  const { t } = useTranslation("overview");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentSessions")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3}>
                <EmptyState icon={Clock} title={t("noSessions")} description={t("noSessionsDesc")} />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
