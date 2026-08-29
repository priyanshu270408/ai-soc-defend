import { useState, useMemo } from "react";
import { SOCLayout } from "@/components/SOCLayout";
import { RoleGuard } from "@/components/RoleGuard";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSOCData, riskGaugeColor, type SyntheticUser } from "@/lib/soc-data";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Search,
  User,
  Clock,
  AlertTriangle,
  Shield,
  Activity,
  ArrowUpRight,
  Eye,
} from "lucide-react";

function UserDetail({ user, loginPatterns }: { user: SyntheticUser; loginPatterns: any[] }) {
  const hourLabels = loginPatterns.map((p: any) => `${p.hour}:00`);

  return (
    <div className="space-y-4">
      {/* User header */}
      <div className="flex items-center gap-4">
        <div
          className="flex size-12 items-center justify-center rounded-xl text-lg font-bold"
          style={{ backgroundColor: `${riskGaugeColor(user.riskScore)}18`, color: riskGaugeColor(user.riskScore) }}
        >
          {user.name.charAt(0)}
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{user.name}</h3>
          <p className="text-xs text-muted-foreground">{user.department} · {user.id}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-3xl font-bold tabular-nums" style={{ color: riskGaugeColor(user.riskScore) }}>
            {user.riskScore}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Score</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Logins (30d)", value: user.loginCount30d, icon: Clock },
          { label: "Unusual Logins", value: user.unusualLogins, icon: AlertTriangle, warn: user.unusualLogins > 5 },
          { label: "Privilege Events", value: user.privilegeEvents, icon: Shield, warn: user.privilegeEvents > 8 },
          { label: "Access Anomalies", value: user.accessAnomalies, icon: Eye, warn: user.accessAnomalies > 6 },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border/50 bg-card/40 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <s.icon className="size-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`text-xl font-bold tabular-nums ${s.warn ? "text-[var(--color-severity-high)]" : "text-foreground"}`}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Login frequency chart */}
      <Card className="border-border/50 bg-card/40 py-3">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Clock className="size-3.5 text-muted-foreground" />
            Login Frequency (24h)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={loginPatterns}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(h) => `${h}h`}
              />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-xs shadow-xl">
                      <p className="font-medium text-foreground">{payload[0]?.payload?.hour}:00</p>
                      <p className="text-muted-foreground">Logins: <span className="font-mono text-foreground">{payload[0]?.value}</span></p>
                      {!payload[0]?.payload?.normal && (
                        <p className="text-[var(--color-severity-high)] font-medium mt-0.5">⚠ Unusual hour</p>
                      )}
                    </div>
                  );
                }}
              />
              <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                {loginPatterns.map((entry: any, i: number) => (
                  <Cell
                    key={i}
                    fill={
                      entry.normal
                        ? "oklch(0.72 0.15 185 / 60%)"
                        : "oklch(0.62 0.22 25 / 60%)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Anomaly indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-border/50 bg-card/40 py-3">
          <CardContent className="px-4">
            <h4 className="text-xs font-semibold text-foreground mb-2">Unusual Login Time Flags</h4>
            <div className="space-y-1.5">
              {loginPatterns
                .filter((p: any) => !p.normal && p.count > 0)
                .slice(0, 5)
                .map((p: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 rounded-md bg-[oklch(0.62_0.22_25/8%)] px-2.5 py-1.5">
                    <AlertTriangle className="size-3 text-[var(--color-severity-high)]" />
                    <span className="text-[11px] text-foreground/80">{p.hour}:00 — {p.count} logins during off-hours</span>
                  </div>
                ))}
              {loginPatterns.filter((p: any) => !p.normal && p.count > 0).length === 0 && (
                <p className="text-[11px] text-muted-foreground">No unusual login times detected</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40 py-3">
          <CardContent className="px-4">
            <h4 className="text-xs font-semibold text-foreground mb-2">Data Transfer Activity</h4>
            <div className="flex items-end gap-1 h-16">
              {Array.from({ length: 14 }, (_, i) => {
                const v = Math.random() * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t transition-all"
                    style={{
                      height: `${Math.max(4, v)}%`,
                      backgroundColor:
                        v > 80
                          ? "oklch(0.62 0.22 25 / 60%)"
                          : v > 50
                            ? "oklch(0.72 0.16 55 / 50%)"
                            : "oklch(0.72 0.15 185 / 40%)",
                    }}
                  />
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">14-day transfer volume trend</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const data = getSOCData();
  const [selectedUser, setSelectedUser] = useState<SyntheticUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return [...data.users].sort((a, b) => b.riskScore - a.riskScore);
    const q = searchQuery.toLowerCase();
    return data.users
      .filter((u) => u.name.toLowerCase().includes(q) || u.department.toLowerCase().includes(q))
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [data.users, searchQuery]);

  return (
    <SOCLayout>
      <RoleGuard allowedRoles={["analyst", "officer"]}>
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">User Behaviour</h1>
            <p className="text-sm text-muted-foreground">
              Per-user login patterns, access anomalies, and behaviour analysis
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
            {/* User list */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8 h-8 text-xs bg-background/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-1">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                        selectedUser?.id === user.id
                          ? "border-primary/30 bg-primary/10"
                          : "border-border/40 bg-card/40 hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: `${riskGaugeColor(user.riskScore)}18`,
                            color: riskGaugeColor(user.riskScore),
                          }}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">{user.name}</p>
                          <p className="text-[10px] text-muted-foreground">{user.department}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold tabular-nums" style={{ color: riskGaugeColor(user.riskScore) }}>
                            {user.riskScore}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* User detail */}
            {selectedUser ? (
              <UserDetail
                user={selectedUser}
                loginPatterns={data.loginPatterns[selectedUser.id] || []}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 py-20 text-center">
                <User className="mb-3 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Select a user to view behaviour analysis</p>
              </div>
            )}
          </div>
        </div>
      </RoleGuard>
    </SOCLayout>
  );
}
