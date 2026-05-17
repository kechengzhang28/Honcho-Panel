import { useState } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { FileText, IdCard, MessageCircle, Clock, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/shared/ErrorState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ChatMessage } from "@/components/shared/ChatMessage";
import { BackLink } from "@/components/shared/BackLink";
import { TextSkeleton, MessageSkeleton } from "@/components/shared/Skeletons";
import { usePeerRepr, usePeerCard, usePeerChat } from "./hooks";

export function PeerDetailPage() {
  const { wid = "default", pid = "" } = useParams();
  const { t } = useTranslation("peers");

  return (
    <div className="space-y-4">
      <BackLink href={`/workspaces/${wid}?tab=peers`}>{t("backToList")}</BackLink>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">{pid}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{t("detail")}</p>
      </div>

      <Tabs defaultValue="representation">
        <TabsList>
          <TabsTrigger value="representation">
            <FileText className="h-4 w-4 mr-2" />
            {t("tabs.representation")}
          </TabsTrigger>
          <TabsTrigger value="card">
            <IdCard className="h-4 w-4 mr-2" />
            {t("tabs.card")}
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageCircle className="h-4 w-4 mr-2" />
            {t("tabs.chat")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="representation">
          <RepresentationTab workspaceId={wid} peerId={pid} />
        </TabsContent>
        <TabsContent value="card">
          <CardTab workspaceId={wid} peerId={pid} />
        </TabsContent>
        <TabsContent value="chat">
          <ChatTab workspaceId={wid} peerId={pid} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function RepresentationTab({ workspaceId, peerId }: { workspaceId: string; peerId: string }) {
  const { data: repr, isLoading, isError, error, refetch } = usePeerRepr(workspaceId, peerId);
  const { t } = useTranslation("peers");

  if (isLoading) return <TextSkeleton lines={6} />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!repr) {
    return (
      <EmptyState
        icon={FileText}
        title={t("representation.noRepresentation")}
        description={t("representation.noRepresentationDesc")}
      />
    );
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border-light)] bg-[var(--color-bg)] p-6">
      <pre className="whitespace-pre-wrap font-mono text-sm text-[var(--color-text-primary)] leading-relaxed">
        {repr}
      </pre>
    </div>
  );
}

function CardTab({ workspaceId, peerId }: { workspaceId: string; peerId: string }) {
  const { data: card, isLoading, isError, error, refetch } = usePeerCard(workspaceId, peerId);
  const { t } = useTranslation("peers");

  if (isLoading) return <TextSkeleton lines={5} />;
  if (isError) return <ErrorState error={error} onRetry={() => refetch()} />;
  if (!card || card.length === 0) {
    return (
      <EmptyState
        icon={IdCard}
        title={t("card.noCard")}
        description={t("card.noCardDesc")}
      />
    );
  }

  return (
    <div className="space-y-2">
      {card.map((item, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-sm)] border border-[var(--color-border-light)] bg-[var(--color-bg)] p-4 text-sm text-[var(--color-text-primary)]"
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function ChatTab({ workspaceId, peerId }: { workspaceId: string; peerId: string }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const { t } = useTranslation("peers");
  const { t: tc } = useTranslation("common");

  const chatMutation = usePeerChat(workspaceId, peerId);

  const handleSend = async () => {
    if (!input.trim() || chatMutation.isPending) return;
    const query = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);

    const result = await chatMutation.mutateAsync({ query });
    if (result) {
      setMessages((prev) => [...prev, { role: "assistant", content: result }]);
    }
  };

  return (
    <div className="space-y-4">
      {messages.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title={t("chat.emptyTitle")}
          description={t("chat.emptyDesc")}
        />
      ) : (
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
        </div>
      )}

      {chatMutation.isPending && <MessageSkeleton count={3} />}

      {chatMutation.isError && (
        <ErrorState
          icon={Clock}
          title={t("chat.reasoningTimeout")}
          error={chatMutation.error}
          description={t("chat.reasoningTimeoutDesc")}
        />
      )}

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={t("chat.placeholder")}
          disabled={chatMutation.isPending}
        />
        <Button onClick={handleSend} disabled={chatMutation.isPending || !input.trim()}>
          {chatMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {tc("button.send")}
        </Button>
      </div>
    </div>
  );
}
