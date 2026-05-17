import { useSearchParams } from "react-router";
import { OverviewPage } from "@/features/workspaces/OverviewPage";
import { PeerListPage } from "@/features/peers/PeerListPage";
import { SessionListPage } from "@/features/sessions/SessionListPage";
import { PlaceholderPage } from "@/components/shared/PlaceholderPage";

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
      return <PlaceholderPage title="Conclusions" />;
    default:
      return <OverviewPage />;
  }
}
