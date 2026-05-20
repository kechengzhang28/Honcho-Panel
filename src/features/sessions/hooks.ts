import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getHoncho } from "@/lib/honcho";
import { getErrorMessage } from "@/lib/utils";

export function useSessionList(workspaceId: string, page: number, size = 20) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "sessions", { page, size }],
    queryFn: async () => {
      const honcho = getHoncho(workspaceId);
      return honcho.sessions({ page, size });
    },
    enabled: !!workspaceId,
  });
}

export function useDeleteSession(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const honcho = getHoncho(workspaceId);
      const session = await honcho.session(sessionId);
      return session.delete();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "sessions"] });
      toast.success("Session deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSessionContext(
  workspaceId: string,
  sessionId: string,
  options?: { tokens?: number; summary?: boolean; limitToSession?: boolean },
) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "sessions", sessionId, "context", options],
    queryFn: async () => {
      const honcho = getHoncho(workspaceId);
      const session = await honcho.session(sessionId);
      return session.context({
        tokens: options?.tokens ?? 100000,
        summary: options?.summary ?? true,
        limitToSession: options?.limitToSession ?? false,
      });
    },
    enabled: !!workspaceId && !!sessionId,
  });
}

export function useMessageList(workspaceId: string, sessionId: string, page: number, size = 50) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "sessions", sessionId, "messages", { page, size }],
    queryFn: async () => {
      const honcho = getHoncho(workspaceId);
      const session = await honcho.session(sessionId);
      return session.messages({ page, size, reverse: true });
    },
    enabled: !!workspaceId && !!sessionId,
  });
}

export function useSendMessage(workspaceId: string, sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { peerId: string; content: string }) => {
      const honcho = getHoncho(workspaceId);
      const session = await honcho.session(sessionId);
      return session.addMessages([input]);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "sessions", sessionId, "messages"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspaces", workspaceId, "sessions", sessionId, "context"],
      });
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "queue"] });
    },
  });
}
