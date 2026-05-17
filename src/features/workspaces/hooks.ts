import { useQuery } from "@tanstack/react-query";
import { getHoncho } from "@/lib/honcho";
import type { QueueStatus } from "@/types/honcho";

export function useWorkspaceList() {
  return useQuery({
    queryKey: ["workspaces", "list"],
    queryFn: async () => {
      const honcho = getHoncho();
      const page = await honcho.workspaces({ size: 100 });
      return page.items;
    },
    staleTime: 60_000,
  });
}

export function useQueueStatus(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "queue"],
    queryFn: async () => {
      const honcho = getHoncho();
      const status = await honcho.queueStatus();
      return status as unknown as QueueStatus;
    },
    enabled: !!workspaceId,
    refetchInterval: 15_000,
  });
}
