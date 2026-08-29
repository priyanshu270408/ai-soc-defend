import { SOCLayout } from "@/components/SOCLayout";
import { RoleGuard } from "@/components/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { Settings, UserPlus, Shield } from "lucide-react";

// Demo user table — in production, this would come from Supabase
const DEMO_USERS = [
  { id: "1", email: "analyst@demo.local", name: "SOC Analyst", role: "analyst", status: "active" },
  { id: "2", email: "officer@demo.local", name: "Security Officer", role: "officer", status: "active" },
  { id: "3", email: "command@demo.local", name: "Command Staff", role: "command", status: "active" },
  { id: "4", email: "admin@demo.local", name: "System Admin", role: "admin", status: "active" },
  { id: "5", email: "analyst2@demo.local", name: "Junior Analyst", role: "analyst", status: "active" },
  { id: "6", email: "analyst3@demo.local", name: "Senior Analyst", role: "analyst", status: "inactive" },
];

function roleBadgeColor(role: string): string {
  switch (role) {
    case "admin": return "bg-red-500/15 text-red-400 border-red-500/30";
    case "officer": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "analyst": return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
    case "command": return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    default: return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
  }
}

export default function AdminPage() {
  return (
    <SOCLayout>
      <RoleGuard allowedRoles={["admin"]}>
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">User Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage user accounts and role assignments
              </p>
            </div>
            <Button size="sm" className="gap-1.5">
              <UserPlus className="size-3.5" />
              Add User
            </Button>
          </div>

          {/* Role summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { role: "admin", count: 1, label: "Admins" },
              { role: "officer", count: 1, label: "Officers" },
              { role: "analyst", count: 3, label: "Analysts" },
              { role: "command", count: 1, label: "Command" },
            ].map((r) => (
              <Card key={r.role} className="border-border/50 bg-card/60 py-3">
                <CardContent className="flex items-center gap-3 px-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-accent/60">
                    <Shield className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-foreground">{r.count}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{r.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Users table */}
          <Card className="border-border/50 bg-card/60">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-semibold">All Users</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">User</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Email</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Role</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DEMO_USERS.map((user) => (
                  <TableRow key={user.id} className="border-border/30">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                          {user.name.charAt(0)}
                        </div>
                        <span className="text-xs font-medium text-foreground">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${roleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs ${user.status === "active" ? "text-emerald-400" : "text-muted-foreground"}`}>
                        {user.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 text-xs">
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <p className="text-[11px] text-muted-foreground/60 text-center">
            This is a demo admin panel. In production, user management would integrate with Supabase Auth and your backend.
          </p>
        </div>
      </RoleGuard>
    </SOCLayout>
  );
}
