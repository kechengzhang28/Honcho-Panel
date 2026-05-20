import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { FileQuestion, MessageSquare, User, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ChatMessage } from "@/components/shared/ChatMessage";
import { BackLink } from "@/components/shared/BackLink";
import { MessageSkeleton } from "@/components/shared/Skeletons";
import { useSessionContext } from "./hooks";

export function SessionViewPage() {
  const { wid = "default", sid = "" } = useParams();
  const { t } = useTranslation("sessions");

  const { data: context, isLoading, isError, error, refetch } = useSessionContext(wid, sid);

  if (isLoading) return <MessageSkeleton count={5} />;

  if (isError) {
    return (
      <ErrorState
        icon={FileQuestion}
        title={t("notFound")}
        description={t("notFoundDesc")}
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  const messages = context?.messages ?? [];
  const msgCount = messages.length;
  const peerId = messages[0]?.peerId;
  const firstPeerId = peerId ?? "user";
  const createdAt = messages[0]?.createdAt;

  return (
    <div className="space-y-4">
      <BackLink href={`/workspaces/${wid}?tab=sessions`}>{t("backToList")}</BackLink>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">{sid}</h1>
        <div className="mt-2 flex items-center gap-6 text-[13px] text-[var(--color-text-secondary)]">
          {peerId && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              {t("info.peer", { peer: peerId })}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
            {t("info.messages", { count: msgCount })}
          </span>
          {createdAt && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              {t("info.created", { date: new Date(createdAt).toLocaleString() })}
            </span>
          )}
        </div>
      </div>

      {context?.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("summary")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {context.summary.content}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={t("noMessages")}
            description={t("noMessagesDesc")}
          />
        ) : (
          messages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.peerId === firstPeerId ? "user" : "assistant"}
              content={msg.content}
            />
          ))
        )}
      </div>
    </div>
  );
}
