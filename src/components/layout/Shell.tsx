import { Outlet } from "react-router";
import { Sidebar } from "./Sidebar";

export function Shell() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-[var(--color-bg)] p-6">
        <Outlet />
      </main>
    </div>
  );
}
