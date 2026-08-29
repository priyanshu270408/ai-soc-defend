import { useState } from "react";
import { useLocation } from "react-router";
import { Bell, Menu, X, Search, AlertTriangle, Clock } from "lucide-react";
import { SOCSidebar } from "./SOCSidebar";
import { useAuth, useRoleAccess } from "@/hooks/use-auth";
import { getSOCData } from "@/lib/soc-data";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

function TopBar() {
  const { user } = useAuth();
  const { role } = useRoleAccess();
  const data = getSOCData();
  const openCritical = data.alerts.filter(
    (a) => a.severity === "critical" && a.status === "open"
  ).length;

  return (
    <header className="flex h-14 items-center justify-between border-b border-border/60 bg-card/50 px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="size-3.5" />
          <span className="hidden sm:inline">
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-400">LIVE</span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {openCritical > 0 && (
          <div className="flex items-center gap-1.5 rounded-md bg-[oklch(0.62_0.22_25/12%)] px-2.5 py-1.5 text-xs font-medium animate-pulse-critical">
            <AlertTriangle className="size-3.5 text-[var(--color-severity-critical)]" />
            <span className="text-[var(--color-severity-critical)]">
              {openCritical} Critical
            </span>
          </div>
        )}
        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
          <Bell className="size-4" />
          {openCritical > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-[var(--color-severity-critical)] text-[9px] font-bold text-white">
              {openCritical}
            </span>
          )}
        </button>
        <div className="flex items-center gap-2 rounded-md bg-accent/50 px-2.5 py-1.5">
          <div className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            {user?.name?.charAt(0) || "?"}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-medium text-foreground">{user?.name}</span>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export function SOCLayout({ children, readOnly = false }: { children: ReactNode; readOnly?: boolean }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <SOCSidebar />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50">
            <SOCSidebar />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-[-40px] rounded-md p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center border-b border-border/60 px-4 py-2">
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <Menu className="size-5" />
            </button>
          </div>
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
