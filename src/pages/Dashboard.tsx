import { SOCLayout } from "@/components/SOCLayout";
import { RiskGauge } from "@/components/RiskGauge";
import { SeverityBadge, StatusBadge } from "@/components/SeverityBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  getDashboardStats,
  getSOCData,
  riskGaugeColor,
  type RiskTrendPoint,
} from "@/lib/soc-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Server,
  TrendingUp,
  Activity,
  Clock,
  ArrowUpRight,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <Card className="border-border/50 bg-card/60 py-4">
      <CardContent className="flex items-center gap-3 px-4">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: color ? `${color}18` : "oklch(1 0 0 / 5%)" }}
        >
          <Icon className="size-5" style={{ color: color || undefined }} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tabular-nums text-foreground">{value}</p>
          {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function EventTimeline() {
  const stats = getDashboardStats();
  return (
    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
      {stats.recentEventsTimeline.map((alert) => (
        <div
          key={alert.id}
          className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/40 px-3 py-2.5"
        >
          <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-accent/60">
            <Activity className="size-3.5 text-muted-foreground" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <SeverityBadge severity={alert.severity} />
              <span className="text-[11px] text-muted-foreground">
                {new Date(alert.timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-foreground truncate">{alert.title}</p>
            <p className="text-[11px] text-muted-foreground">
              {alert.userName} · {alert.assetName}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const stats = getDashboardStats();
  const data = getSOCData();

  const chartConfig = {
    score: { label: "Risk Score", color: "oklch(0.72 0.15 185)" },
    alerts: { label: "Alerts", color: "oklch(0.62 0.22 25)" },
  };

  const pieConfig = {
    Low: { label: "Low", color: "oklch(0.65 0.06 260)" },
    Medium: { label: "Medium", color: "oklch(0.70 0.14 220)" },
    High: { label: "High", color: "oklch(0.72 0.16 55)" },
    Critical: { label: "Critical", color: "oklch(0.62 0.22 25)" },
  };

  return (
    <SOCLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Security Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Real-time synthetic threat monitoring dashboard
          </p>
        </div>

        {/* Top stats row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={ShieldAlert}
            label="Overall Risk Score"
            value={`${stats.overallRiskScore}/100`}
            sub={stats.riskLevel.toUpperCase()}
            color={riskGaugeColor(stats.overallRiskScore)}
          />
          <StatCard
            icon={AlertTriangle}
            label="Active Threats"
            value={stats.activeThreats}
            sub="Open alerts"
            color="var(--color-severity-high)"
          />
          <StatCard
            icon={AlertTriangle}
            label="Critical Alerts"
            value={stats.criticalAlerts}
            sub="Immediate attention"
            color="var(--color-severity-critical)"
          />
          <StatCard
            icon={Activity}
            label="Active Incidents"
            value={stats.activeIncidents}
            sub="Being investigated"
            color="var(--color-severity-medium)"
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Risk Gauge */}
          <Card className="border-border/50 bg-card/60 py-4">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm font-semibold">Cyber Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center px-4 pt-4">
              <RiskGauge score={stats.overallRiskScore} size="lg" />
            </CardContent>
          </Card>

          {/* Risk Trend Chart */}
          <Card className="border-border/50 bg-card/60 py-4 lg:col-span-2">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm font-semibold">Risk Trend — Last 14 Days</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-4">
              <ChartContainer config={chartConfig} className="h-[220px] w-full">
                <AreaChart data={data.riskTrend}>
                  <defs>
                    <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.72 0.15 185)" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="oklch(0.72 0.15 185)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="alertGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.22 25)" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="oklch(0.62 0.22 25)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "oklch(0.55 0 0)" }}
                    axisLine={false}
                    tickLine={false}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-xs shadow-xl">
                          <p className="font-medium text-foreground">{label}</p>
                          <p className="text-muted-foreground">
                            Risk Score: <span className="font-mono text-foreground">{payload[0]?.value}</span>
                          </p>
                          {payload[1] && (
                            <p className="text-muted-foreground">
                              Alerts: <span className="font-mono text-foreground">{payload[1]?.value}</span>
                            </p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="oklch(0.72 0.15 185)"
                    strokeWidth={2}
                    fill="url(#riskGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="alerts"
                    stroke="oklch(0.62 0.22 25)"
                    strokeWidth={1.5}
                    fill="url(#alertGrad)"
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Second row */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Donut chart */}
          <Card className="border-border/50 bg-card/60 py-4">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm font-semibold">Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-4">
              <ChartContainer config={pieConfig} className="h-[200px] w-full">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.riskDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="count"
                      nameKey="level"
                      strokeWidth={0}
                    >
                      {data.riskDistribution.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-xs shadow-xl">
                            <p className="font-medium text-foreground">{payload[0]?.name}</p>
                            <p className="text-muted-foreground">
                              Count: <span className="font-mono text-foreground">{payload[0]?.value}</span>
                            </p>
                          </div>
                        );
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {data.riskDistribution.map((d) => (
                  <div key={d.level} className="flex items-center gap-1.5">
                    <div className="size-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                    <span className="text-[11px] text-muted-foreground">{d.level} ({d.count})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Suspicious Users */}
          <Card className="border-border/50 bg-card/60 py-4">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm font-semibold">Top Suspicious Users</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-3">
              <div className="space-y-2">
                {stats.topSuspiciousUsers.map((user, i) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 px-3 py-2"
                  >
                    <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
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
                      <p className="text-[10px] text-muted-foreground">risk</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Risky Assets */}
          <Card className="border-border/50 bg-card/60 py-4">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm font-semibold">Top Risky Assets</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-3">
              <div className="space-y-2">
                {stats.topRiskyAssets.map((asset, i) => (
                  <div
                    key={asset.id}
                    className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/40 px-3 py-2"
                  >
                    <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                    <div className="flex size-7 items-center justify-center rounded-lg bg-accent/60 text-muted-foreground">
                      <Server className="size-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground truncate">{asset.name}</p>
                      <p className="text-[10px] text-muted-foreground">{asset.ip}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold tabular-nums" style={{ color: riskGaugeColor(asset.riskScore) }}>
                        {asset.riskScore}
                      </p>
                      <p className="text-[10px] text-muted-foreground">risk</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Incidents + Event Timeline */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="border-border/50 bg-card/60 py-4">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm font-semibold">Recent Incidents</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-3">
              <div className="space-y-2">
                {stats.recentIncidents.map((inc) => (
                  <div
                    key={inc.id}
                    className="flex items-start gap-3 rounded-lg border border-border/40 bg-card/40 px-3 py-2.5"
                  >
                    <div className="mt-0.5">
                      <SeverityBadge severity={inc.severity} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground">{inc.title}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {inc.userName} · {new Date(inc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={inc.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/60 py-4">
            <CardHeader className="px-4 pb-0">
              <CardTitle className="text-sm font-semibold">Recent Events Timeline</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pt-3">
              <EventTimeline />
            </CardContent>
          </Card>
        </div>
      </div>
    </SOCLayout>
  );
}
