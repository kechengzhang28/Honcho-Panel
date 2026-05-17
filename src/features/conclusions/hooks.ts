import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getHoncho } from "@/lib/honcho";
import { getErrorMessage } from "@/lib/utils";

export function useConclusionList(
  workspaceId: string,
  page: number,
  size = 20,
  observerId = "honcho",
) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "conclusions", { page, size, observerId }],
    queryFn: async () => {
      const honcho = getHoncho();
      const peer = await honcho.peer(observerId);
      return peer.conclusions.list({ page, size });
    },
    enabled: !!workspaceId,
  });
}

export function useConclusionSearch(_workspaceId: string, observerId = "honcho") {
  return useMutation({
    mutationFn: async ({ query, topK = 10 }: { query: string; topK?: number }) => {
      const honcho = getHoncho();
      const peer = await honcho.peer(observerId);
      return peer.conclusions.query(query, topK);
    },
  });
}

export function useDeleteConclusion(workspaceId: string, observerId = "honcho") {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conclusionId: string) => {
      const honcho = getHoncho();
      const peer = await honcho.peer(observerId);
      return peer.conclusions.delete(conclusionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces", workspaceId, "conclusions"] });
      toast.success("Conclusion deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
