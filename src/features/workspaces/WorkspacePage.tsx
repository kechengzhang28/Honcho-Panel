import { useSearchParams } from "react-router";
import { OverviewPage } from "@/features/workspaces/OverviewPage";
import { PeerListPage } from "@/features/peers/PeerListPage";
import { SessionListPage } from "@/features/sessions/SessionListPage";
import { ConclusionsPage } from "@/features/conclusions/ConclusionsPage";

export function WorkspacePage() {
  const [searchParams] = useSearchParams();
  const tab = searchParams.get("tab") ?? "overview";

  switch (tab) {
    case "overview":
      return <OverviewPage />;
    case "peers":
      return <PeerListPage />;
    case "sessions":
      return <SessionListPage />;
    case "conclusions":
      return <ConclusionsPage />;
    default:
      return <OverviewPage />;
  }
}
