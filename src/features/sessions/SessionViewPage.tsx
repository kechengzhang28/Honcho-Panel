import { useState } from "react";
import { useParams } from "react-router";
import { FileQuestion, Loader2, MessageSquare } from "lucide-react";
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

  const {
    data: context,
    isLoading,
    isError,
    error,
    refetch,
  } = useSessionContext(wid, sid);

  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<
    { peerId: string; content: string }[]
  >([]);
  const sendMutation = useSendMessage(wid, sid);

  const displayMessages = localMessages.length > 0 ? localMessages : context?.messages ?? [];
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
        title="Session not found"
        description="It may have been deleted."
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <BackLink href={`/workspaces/${wid}?tab=sessions`}>Back to Sessions</BackLink>

      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">{sid}</h1>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">Session View</p>
      </div>

      {context?.summary && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
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
            title="No messages yet"
            description="Send a message to start the conversation."
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
          title="Failed to send message"
          error={sendMutation.error}
          onRetry={() => sendMutation.mutate({ peerId: firstPeerId, content: input || "" })}
        />
      )}

      <div className="flex gap-2 pt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          disabled={sendMutation.isPending}
        />
        <Button onClick={handleSend} disabled={sendMutation.isPending || !input.trim()}>
          {sendMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Send
        </Button>
      </div>
    </div>
  );
}
