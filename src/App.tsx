import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Shell } from "./components/layout/Shell";
import { PlaceholderPage } from "./components/shared/PlaceholderPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { OverviewPage } from "./features/workspaces/OverviewPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Navigate to="/workspaces/default?tab=overview" replace />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/workspaces/:wid" element={<OverviewPage />} />
          <Route path="/workspaces/:wid/peers/:pid" element={<PlaceholderPage title="Peer Detail" />} />
          <Route path="/workspaces/:wid/sessions/:sid" element={<PlaceholderPage title="Session View" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
