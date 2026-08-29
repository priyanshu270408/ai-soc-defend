import { ShieldCheck } from "lucide-react";

export function SOCLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-2 py-1.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
        <ShieldCheck className="size-4.5 text-primary" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-bold tracking-tight text-foreground">
            AI Kavach
          </span>
          <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            SOC Console
          </span>
        </div>
      )}
    </div>
  );
}
