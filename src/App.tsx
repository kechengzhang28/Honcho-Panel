import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Shell } from "./components/layout/Shell";
import { SettingsPage } from "./features/settings/SettingsPage";
import { WorkspacePage } from "./features/workspaces/WorkspacePage";
import { PeerDetailPage } from "./features/peers/PeerDetailPage";
import { SessionViewPage } from "./features/sessions/SessionViewPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Navigate to="/workspaces/default?tab=overview" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/workspaces/:wid" element={<WorkspacePage />} />
          <Route path="/workspaces/:wid/peers/:pid" element={<PeerDetailPage />} />
          <Route path="/workspaces/:wid/sessions/:sid" element={<SessionViewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
