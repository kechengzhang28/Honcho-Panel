import { useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { FileQuestion, Loader2, MessageSquare, User, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ChatMessage } from "@/components/shared/ChatMessage";
import { BackLink } from "@/components/shared/BackLink";
import { MessageSkeleton } from "@/components/shared/Skeletons";
import { useSessionContext, useSendMessage } from "./hooks";

export function SessionViewPage() {
  const { wid = "default", sid = "" } = useParams();
  const { t } = useTranslation("sessions");
  const { t: tc } = useTranslation("common");

  const { data: context, isLoading, isError, error, refetch } = useSessionContext(wid, sid);

  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<
    { peerId: string; content: string }[]
  >([]);
  const sendMutation = useSendMessage(wid, sid);

  const displayMessages = localMessages.length > 0 ? localMessages : context?.messages?.map(m => ({ peerId: m.peerId, content: m.content })) ?? [];
  const firstPeerId = context?.messages?.[0]?.peerId ?? "user";

  const handleSend = async () => {
    if (!input.trim() || sendMutation.isPending) return;
    const content = input.trim();
    setInput("");
    setLocalMessages((prev) => [...prev, { peerId: firstPeerId, content }]);
    await sendMutation.mutateAsync({ peerId: firstPeerId, content });
  };

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

  const msgCount = context?.messages?.length ?? 0;
  const peerId = context?.messages?.[0]?.peerId;
  const createdAt = msgCount > 0
    ? (context?.messages?.[0] as { createdAt?: string })?.createdAt
    : null;

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
              {t("info.created", { date: new Date(createdAt).toLocaleDateString() })}
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
        {displayMessages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title={t("noMessages")}
            description={t("noMessagesDesc")}
          />
        ) : (
          displayMessages.map((msg, i) => (
            <ChatMessage
              key={i}
              role={msg.peerId === firstPeerId ? "user" : "assistant"}
              content={msg.content}
            />
          ))
        )}
      </div>

      {sendMutation.isPending && <MessageSkeleton count={1} />}

      {sendMutation.isError && (
        <ErrorState
          title={t("sendFailed")}
          error={sendMutation.error}
          onRetry={() => sendMutation.mutate({ peerId: firstPeerId, content: input || "" })}
        />
      )}

      <div className="flex gap-2 pt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t("messagePlaceholder")}
          disabled={sendMutation.isPending}
        />
        <Button onClick={handleSend} disabled={sendMutation.isPending || !input.trim()}>
          {sendMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {tc("button.send")}
        </Button>
      </div>
    </div>
  );
}
