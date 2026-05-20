import { Calendar, Clock, MessageSquare, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { StatCardSkeleton, TableRowSkeleton } from "@/components/shared/Skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePeerList } from "@/features/peers/hooks";
import { useSessionList } from "@/features/sessions/hooks";
import { useQueueStatus } from "./hooks";

export function OverviewPage() {
  const { wid = "default" } = useParams();
  const { t } = useTranslation("overview");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">{t("title")}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t("workspace", { wid })}</p>
      </div>

      <WorkspaceStats workspaceId={wid} />
      <div className="grid grid-cols-[1fr_380px] gap-6">
        <RecentSessions workspaceId={wid} />
        <QueueDetailPanel workspaceId={wid} />
      </div>
    </div>
  );
}

function WorkspaceStats({ workspaceId }: { workspaceId: string }) {
  const { data: sessions } = useSessionList(workspaceId, 1, 1);
  const { data: peers } = usePeerList(workspaceId, 1, 1);
  const { data: queue } = useQueueStatus(workspaceId);
  const { t } = useTranslation("overview");

  const stats = [
    {
      label: t("stats.sessions"),
      value: sessions?.total ?? "—",
      desc: t("stats.sessionsDesc"),
      icon: Calendar,
    },
    {
      label: t("stats.peers"),
      value: peers?.total ?? "—",
      desc: t("stats.peersDesc"),
      icon: Users,
    },
    {
      label: t("stats.messages"),
      value: queue?.totalWorkUnits ?? "—",
      desc: t("stats.messagesDesc"),
      icon: MessageSquare,
    },
    {
      label: t("stats.queueLength"),
      value: queue?.pendingWorkUnits ?? "—",
      desc: t("stats.queueLengthDesc"),
      icon: Clock,
    },
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
              <div className="text-[28px] font-bold text-[var(--color-text-primary)]">
                {stat.value}
              </div>
              <div className="text-[13px] text-[var(--color-text-muted)]">{stat.desc}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QueueDetailPanel({ workspaceId }: { workspaceId: string }) {
  const { data: queue, isLoading, isError, error, refetch } = useQueueStatus(workspaceId);
  const { t } = useTranslation("overview");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("queueStatus")}</CardTitle>
        </CardHeader>
        <CardContent>
          <StatCardSkeleton />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return <ErrorState title={t("statsFailed")} error={error} onRetry={() => refetch()} />;
  }

  if (!queue) return null;

  const rows = [
    {
      label: t("queue.total"),
      value: queue.totalWorkUnits,
      color: "text-[var(--color-text-primary)]",
    },
    {
      label: t("queue.completed"),
      value: queue.completedWorkUnits,
      color: "text-[var(--color-success)]",
    },
    {
      label: t("queue.processing"),
      value: queue.inProgressWorkUnits,
      color: "text-[var(--color-warning)]",
    },
    {
      label: t("queue.pending"),
      value: queue.pendingWorkUnits,
      color: "text-[var(--color-primary)]",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("queueStatus")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-sm text-[var(--color-text-secondary)]">{row.label}</span>
              <span className={`text-sm font-semibold ${row.color}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function RecentSessions({ workspaceId }: { workspaceId: string }) {
  const { data, isLoading, isError, error, refetch } = useSessionList(workspaceId, 1, 5);
  const { t } = useTranslation("overview");

  const sessions = data?.items?.slice(0, 5) ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("recentSessions")}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableRowSkeleton rows={3} />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : sessions.length === 0 ? (
          <EmptyState icon={Calendar} title={t("noSessions")} description={t("noSessionsDesc")} />
        ) : (
          <div className="space-y-3">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <Link
                  to={`/workspaces/${workspaceId}/sessions/${s.id}`}
                  className="text-sm font-mono hover:text-[var(--color-primary)]"
                >
                  {s.id}
                </Link>
                <span className="text-sm text-[var(--color-text-muted)]">
                  {formatRelativeTime(s.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
