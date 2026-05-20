import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getHoncho } from "@/lib/honcho";

export function usePeerList(workspaceId: string, page: number, size = 20) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "peers", { page, size }],
    queryFn: async () => {
      const honcho = getHoncho(workspaceId);
      const result = await honcho.peers({ page, size });
      return result;
    },
    enabled: !!workspaceId,
  });
}

export function usePeerDetail(workspaceId: string, peerId: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "peers", peerId],
    queryFn: async () => {
      const honcho = getHoncho(workspaceId);
      return honcho.peer(peerId);
    },
    enabled: !!workspaceId && !!peerId,
  });
}

export function usePeerCard(workspaceId: string, peerId: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "peers", peerId, "card"],
    queryFn: async () => {
      const honcho = getHoncho(workspaceId);
      const peer = await honcho.peer(peerId);
      return peer.getCard();
    },
    enabled: !!workspaceId && !!peerId,
  });
}

export function usePeerRepr(
  workspaceId: string,
  peerId: string,
  opts?: { sessionId?: string; includeMostFrequent?: boolean; maxConclusions?: number },
) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "peers", peerId, "repr", opts],
    queryFn: async () => {
      const honcho = getHoncho(workspaceId);
      const peer = await honcho.peer(peerId);
      return peer.representation({
        session: opts?.sessionId,
        includeMostFrequent: opts?.includeMostFrequent ?? true,
        maxConclusions: opts?.maxConclusions ?? 20,
      });
    },
    enabled: !!workspaceId && !!peerId,
  });
}

export function usePeerChat(workspaceId: string, peerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      query,
      sessionId,
      reasoningLevel,
    }: {
      query: string;
      sessionId?: string;
      reasoningLevel?: string;
    }) => {
      const honcho = getHoncho(workspaceId);
      const peer = await honcho.peer(peerId);
      return peer.chat(query, {
        session: sessionId,
        reasoningLevel: reasoningLevel ?? "low",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "peers", peerId] });
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "queue"] });
    },
  });
}
