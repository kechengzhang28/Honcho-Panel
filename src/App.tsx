import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Shell } from "./components/layout/Shell";
import { PlaceholderPage } from "./components/shared/PlaceholderPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route path="/" element={<Navigate to="/workspaces/default?tab=overview" replace />} />
          <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="/workspaces/:wid" element={<PlaceholderPage title="Workspace Overview" />} />
          <Route path="/workspaces/:wid/peers/:pid" element={<PlaceholderPage title="Peer Detail" />} />
          <Route path="/workspaces/:wid/sessions/:sid" element={<PlaceholderPage title="Session View" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
