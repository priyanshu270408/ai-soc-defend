import { NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  ShieldAlert,
  Users,
  Network,
  FileWarning,
  Settings,
  LogOut,
} from "lucide-react";
import { useAuth, useRoleAccess } from "@/hooks/use-auth";
import { SOCLogo } from "./SOCLogo";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["analyst", "officer", "command"] },
  { label: "Threats", href: "/threats", icon: ShieldAlert, roles: ["analyst", "officer"] },
  { label: "User Behaviour", href: "/users", icon: Users, roles: ["analyst", "officer"] },
  { label: "Network", href: "/network", icon: Network, roles: ["analyst", "officer"] },
  { label: "Incidents", href: "/incidents", icon: FileWarning, roles: ["analyst", "officer"] },
  { label: "User Management", href: "/admin", icon: Settings, roles: ["admin"] },
];

export function SOCSidebar({ collapsed = false }: { collapsed?: boolean }) {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { role } = useRoleAccess();

  const filteredItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role || "")
  );

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/auth";
  };

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border/60 bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-border/60 px-3">
        <SOCLogo collapsed={collapsed} />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-2">
        {filteredItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? location.pathname === "/dashboard"
              : location.pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-4 shrink-0 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                )}
              />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-border/60 p-2">
        {!collapsed && user && (
          <div className="mb-2 rounded-md bg-accent/50 px-2.5 py-2">
            <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {user.role}
            </p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="size-4 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
