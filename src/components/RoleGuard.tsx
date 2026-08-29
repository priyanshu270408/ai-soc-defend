import { useRoleAccess } from "@/hooks/use-auth";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: string[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const { role } = useRoleAccess();

  if (!role || !allowedRoles.includes(role)) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-card/30 py-16 text-center">
        <AlertTriangle className="mb-3 size-8 text-muted-foreground/60" />
        <p className="text-sm font-medium text-muted-foreground">
          Access Restricted
        </p>
        <p className="mt-1 text-xs text-muted-foreground/70">
          Your role ({role ?? "unknown"}) does not have permission to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
