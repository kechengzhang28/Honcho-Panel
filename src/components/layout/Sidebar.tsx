import { NavLink, useNavigate, useParams } from "react-router";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Lightbulb,
  Settings,
  Bot,
  ChevronDown,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/workspaces/:wid?tab=overview", icon: LayoutDashboard, label: "Overview" },
  { to: "/workspaces/:wid?tab=peers", icon: Users, label: "Peers" },
  { to: "/workspaces/:wid?tab=sessions", icon: Calendar, label: "Sessions" },
  { to: "/workspaces/:wid?tab=conclusions", icon: Lightbulb, label: "Conclusions" },
];

export function Sidebar() {
  const { wid } = useParams();
  const navigate = useNavigate();

  const replaceWid = (path: string) => path.replace(":wid", wid ?? "default");

  return (
    <aside className="flex w-60 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="flex h-14 items-center gap-2 px-4">
        <Bot className="h-6 w-6 text-[var(--color-primary)]" />
        <span className="text-lg font-semibold text-[var(--color-text-primary)]">Honcho Panel</span>
      </div>

      <Separator />

      <div className="p-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-muted)] px-3 py-2 text-left text-sm font-medium text-[var(--color-text-primary)] hover:bg-zinc-200 transition-colors">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-[var(--color-primary)]" />
              <span className="truncate">{wid ?? "default"}</span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-54">
            <DropdownMenuItem onClick={() => navigate("/workspaces/default?tab=overview")}>
              default
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-3 py-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.label}
              to={replaceWid(item.to)}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]",
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </ScrollArea>

      <Separator />

      <div className="p-3 space-y-1">
        <div className="flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--color-bg-muted)] px-3 py-2 text-sm text-[var(--color-text-secondary)] cursor-pointer hover:bg-zinc-200 transition-colors">
          <Globe className="h-4 w-4" />
          <span>English</span>
        </div>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition-colors",
              isActive
                ? "bg-[var(--color-primary-light)] text-[var(--color-primary)] font-medium"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] hover:text-[var(--color-text-primary)]",
            )
          }
        >
          <Settings className="h-5 w-5" />
          Settings
        </NavLink>
      </div>
    </aside>
  );
}
