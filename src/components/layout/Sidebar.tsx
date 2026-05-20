import { useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Lightbulb,
  Settings,
  BrainCircuit,
  ChevronDown,
  Check,
  Loader2,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWorkspaceList } from "@/features/workspaces/hooks";

const navItems = [
  { tab: "overview", icon: LayoutDashboard, key: "overview" as const },
  { tab: "peers", icon: Users, key: "peers" as const },
  { tab: "sessions", icon: Calendar, key: "sessions" as const },
  { tab: "conclusions", icon: Lightbulb, key: "conclusions" as const },
];

export function Sidebar() {
  const { wid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const prevWid = useRef(wid);
  const { t } = useTranslation("common");

  const currentTab = searchParams.get("tab") ?? location.pathname.match(/\/(peers|sessions|conclusions)\//)?.[1] ?? "overview";
  const isWorkspaceRoute = location.pathname.startsWith("/workspaces");

  const { data: workspaces, isLoading: loadingWorkspaces } = useWorkspaceList();

  useEffect(() => {
    if (prevWid.current && prevWid.current !== wid) {
      queryClient.removeQueries({ queryKey: ["workspaces", prevWid.current] });
    }
    prevWid.current = wid;
  }, [wid, queryClient]);

  const currentWorkspace = wid ?? "default";

  return (
    <aside className="flex w-60 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="flex h-14 items-center gap-2 border-b-2 border-[var(--color-border-light)] px-4">
        <BrainCircuit className="h-6 w-6 text-[var(--color-primary)]" />
        <span className="text-lg font-semibold text-[var(--color-text-primary)]">{t("sidebar.brand")}</span>
      </div>

      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-muted)] px-3 py-2 text-left text-sm font-medium text-[var(--color-text-primary)] hover:bg-zinc-200 transition-colors">
            <div className="flex items-center gap-2">
              {loadingWorkspaces ? (
                <Loader2 className="h-4 w-4 animate-spin text-[var(--color-primary)]" />
              ) : (
                <Layers className="h-4 w-4 text-[var(--color-primary)]" />
              )}
              <span className="truncate">{currentWorkspace}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-54">
            {loadingWorkspaces ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
              </div>
            ) : workspaces && workspaces.length > 0 ? (
              workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws}
                  onClick={() => navigate(`/workspaces/${ws}?tab=${currentTab}`)}
                  className="flex items-center justify-between"
                >
                  <span className="truncate">{ws}</span>
                  {ws === currentWorkspace && (
                    <Check className="h-4 w-4 text-[var(--color-primary)]" />
                  )}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>{t("empty.noWorkspaces")}</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1 border-b-2 border-[var(--color-border-light)] px-3 py-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = isWorkspaceRoute && currentTab === item.tab;
            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => navigate(`/workspaces/${currentWorkspace}?tab=${item.tab}`)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]",
                )}
              >
                <item.icon className="h-5 w-5" />
                {t(`sidebar.${item.key}`)}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="p-3">
        <button
          type="button"
          onClick={() => navigate("/settings")}
          className={cn(
            "flex w-full items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors",
            location.pathname === "/settings"
              ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
              : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]",
          )}
        >
          <Settings className="h-5 w-5" />
          {t("sidebar.settings")}
        </button>
      </div>
    </aside>
  );
}
