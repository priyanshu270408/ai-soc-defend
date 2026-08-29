import { useState, useMemo } from "react";
import { SOCLayout } from "@/components/SOCLayout";
import { RoleGuard } from "@/components/RoleGuard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getSOCData, riskGaugeColor, type Asset } from "@/lib/soc-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Search,
  Server,
  AlertTriangle,
  Shield,
  Activity,
  Wifi,
  ArrowUpRight,
  ArrowDownRight,
  XCircle,
} from "lucide-react";

function AssetDetail({ asset, trafficData }: { asset: Asset; trafficData: any[] }) {
  return (
    <div className="space-y-4">
      {/* Asset header */}
      <div className="flex items-center gap-4">
        <div
          className="flex size-12 items-center justify-center rounded-xl bg-accent/60"
        >
          <Server className="size-6 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">{asset.name}</h3>
          <p className="text-xs text-muted-foreground">{asset.type.replace(/_/g, " ")} · {asset.ip} · {asset.id}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-3xl font-bold tabular-nums" style={{ color: riskGaugeColor(asset.riskScore) }}>
            {asset.riskScore}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Risk Score</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Connections", value: asset.connections, icon: Wifi },
          { label: "Unusual Conn.", value: asset.unusualConnections, icon: AlertTriangle, warn: asset.unusualConnections > 8 },
          { label: "Auth Failures", value: asset.authFailures, icon: XCircle, warn: asset.authFailures > 15 },
          { label: "Outbound (KB)", value: asset.outboundTransfers, icon: ArrowUpRight, warn: asset.outboundTransfers > 3000 },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-border/50 bg-card/40 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <s.icon className="size-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{s.label}</span>
            </div>
            <p className={`text-xl font-bold tabular-nums ${s.warn ? "text-[var(--color-severity-high)]" : "text-foreground"}`}>
              {s.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Traffic volume chart */}
      <Card className="border-border/50 bg-card/40 py-3">
        <CardHeader className="px-4 pb-0">
          <CardTitle className="text-xs font-semibold flex items-center gap-2">
            <Activity className="size-3.5 text-muted-foreground" />
            Traffic Volume (24h)
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 pt-3">
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={trafficData}>
              <defs>
                <linearGradient id="inGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.72 0.15 185)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="oklch(0.72 0.15 185)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="outGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.22 25)" stopOpacity={0.2} />
                  <stop offset="100%" stopColor="oklch(0.62 0.22 25)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 5%)" />
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: "oklch(0.5 0 0)" }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-xs shadow-xl">
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-muted-foreground">
                        Inbound: <span className="font-mono text-foreground">{payload[0]?.value?.toLocaleString()}</span>
                      </p>
                      <p className="text-muted-foreground">
                        Outbound: <span className="font-mono text-foreground">{payload[1]?.value?.toLocaleString()}</span>
                      </p>
                    </div>
                  );
                }}
              />
              <Area type="monotone" dataKey="inbound" stroke="oklch(0.72 0.15 185)" strokeWidth={1.5} fill="url(#inGrad)" />
              <Area type="monotone" dataKey="outbound" stroke="oklch(0.62 0.22 25)" strokeWidth={1.5} fill="url(#outGrad)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-[oklch(0.72_0.15_185)]" />
              <span className="text-[10px] text-muted-foreground">Inbound</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-[oklch(0.62_0.22_25)]" />
              <span className="text-[10px] text-muted-foreground">Outbound</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anomaly details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-border/50 bg-card/40 py-3">
          <CardContent className="px-4">
            <h4 className="text-xs font-semibold text-foreground mb-2">Unusual Connections</h4>
            <div className="space-y-1.5">
              {Array.from({ length: Math.min(asset.unusualConnections, 5) }, (_, i) => (
                <div key={i} className="flex items-center gap-2 rounded-md bg-[oklch(0.62_0.22_25/8%)] px-2.5 py-1.5">
                  <AlertTriangle className="size-3 text-[var(--color-severity-high)] shrink-0" />
                  <span className="text-[11px] text-foreground/80">
                    Unexpected connection to {`${10 + i}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`}
                  </span>
                </div>
              ))}
              {asset.unusualConnections === 0 && (
                <p className="text-[11px] text-muted-foreground">No unusual connections detected</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40 py-3">
          <CardContent className="px-4">
            <h4 className="text-xs font-semibold text-foreground mb-2">Auth Failure Timeline</h4>
            <div className="flex items-end gap-1 h-16">
              {Array.from({ length: 14 }, (_, i) => {
                const v = Math.random() * 100;
                return (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${Math.max(4, v)}%`,
                      backgroundColor:
                        v > 70
                          ? "oklch(0.62 0.22 25 / 60%)"
                          : v > 40
                            ? "oklch(0.72 0.16 55 / 50%)"
                            : "oklch(0.72 0.15 185 / 40%)",
                    }}
                  />
                );
              })}
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {asset.authFailures} failures in last 14 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Flags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="border-border/50 bg-card/40 py-3">
          <CardContent className="px-4">
            <h4 className="text-xs font-semibold text-foreground mb-2">Unusual Internal Communications</h4>
            <div className="space-y-1.5">
              {asset.unusualConnections > 5 ? (
                <div className="rounded-md bg-[oklch(0.72_0.16_55/10%)] px-2.5 py-2">
                  <p className="text-[11px] text-[var(--color-severity-high)]">
                    ⚠ Detected lateral communication with {asset.unusualConnections} unexpected internal hosts
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">No unusual internal communications</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/40 py-3">
          <CardContent className="px-4">
            <h4 className="text-xs font-semibold text-foreground mb-2">Abnormal Outbound Transfers</h4>
            <div className="space-y-1.5">
              {asset.outboundTransfers > 3000 ? (
                <div className="rounded-md bg-[oklch(0.62_0.22_25/10%)] px-2.5 py-2">
                  <p className="text-[11px] text-[var(--color-severity-critical)]">
                    ⚠ Outbound transfer volume ({asset.outboundTransfers} KB) exceeds normal threshold
                  </p>
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">Outbound transfers within normal range</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function NetworkPage() {
  const data = getSOCData();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = useMemo(() => {
    if (!searchQuery) return [...data.assets].sort((a, b) => b.riskScore - a.riskScore);
    const q = searchQuery.toLowerCase();
    return data.assets
      .filter((a) => a.name.toLowerCase().includes(q) || a.type.toLowerCase().includes(q) || a.ip.includes(q))
      .sort((a, b) => b.riskScore - a.riskScore);
  }, [data.assets, searchQuery]);

  return (
    <SOCLayout>
      <RoleGuard allowedRoles={["analyst", "officer"]}>
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Network Behaviour</h1>
            <p className="text-sm text-muted-foreground">
              Per-asset traffic analysis, connection anomalies, and authentication monitoring
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
            {/* Asset list */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  className="pl-8 h-8 text-xs bg-background/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-1">
                  {filteredAssets.map((asset) => (
                    <button
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`w-full text-left rounded-lg border px-3 py-2.5 transition-colors ${
                        selectedAsset?.id === asset.id
                          ? "border-primary/30 bg-primary/10"
                          : "border-border/40 bg-card/40 hover:bg-accent/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/60">
                          <Server className="size-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-foreground truncate">{asset.name}</p>
                          <p className="text-[10px] text-muted-foreground">{asset.ip}</p>
                        </div>
                        <p className="text-sm font-bold tabular-nums" style={{ color: riskGaugeColor(asset.riskScore) }}>
                          {asset.riskScore}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Asset detail */}
            {selectedAsset ? (
              <AssetDetail
                asset={selectedAsset}
                trafficData={data.trafficData[selectedAsset.id] || []}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 py-20 text-center">
                <Server className="mb-3 size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Select an asset to view network behaviour</p>
              </div>
            )}
          </div>
        </div>
      </RoleGuard>
    </SOCLayout>
  );
}
