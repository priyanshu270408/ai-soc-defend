import { useState, useMemo } from "react";
import { SOCLayout } from "@/components/SOCLayout";
import { RoleGuard } from "@/components/RoleGuard";
import { SeverityBadge, StatusBadge } from "@/components/SeverityBadge";
import { RiskGauge } from "@/components/RiskGauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { getSOCData, type Alert, type Severity } from "@/lib/soc-data";
import {
  Search,
  ChevronRight,
  X,
  Bot,
  AlertTriangle,
  FileText,
  Clock,
  Shield,
  CheckCircle,
} from "lucide-react";

function AlertDetail({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const breakdown = alert.riskBreakdown;
  const breakdownItems = [
    { label: "Login Anomaly", value: breakdown.loginAnomaly, max: 25 },
    { label: "Access Anomaly", value: breakdown.accessAnomaly, max: 25 },
    { label: "Privilege Anomaly", value: breakdown.privilegeAnomaly, max: 20 },
    { label: "Data Transfer", value: breakdown.dataTransferAnomaly, max: 20 },
    { label: "Network Anomaly", value: breakdown.networkAnomaly, max: 15 },
    { label: "Time Anomaly", value: breakdown.timeAnomaly, max: 15 },
  ];

  return (
    <Sheet open={true} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg p-0 overflow-hidden">
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={alert.severity} />
            <StatusBadge status={alert.status} />
          </div>
          <SheetTitle className="text-base">{alert.title}</SheetTitle>
          <SheetDescription className="text-xs">
            {alert.id} · {new Date(alert.timestamp).toLocaleString()}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="space-y-5 px-5 py-4">
            {/* AI Explanation */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="size-4 text-primary" />
                <span className="text-xs font-semibold text-primary">AI Analysis</span>
              </div>
              <p className="text-xs leading-relaxed text-foreground/80">{alert.aiExplanation}</p>
            </div>

            {/* Confidence & Risk */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border/50 bg-card/40 p-3 text-center">
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Confidence</p>
                <p className="mt-1 text-xl font-bold text-foreground">{Math.round(alert.confidence * 100)}%</p>
              </div>
              <div className="flex justify-center">
                <RiskGauge score={alert.riskScore} label="Risk Score" size="sm" />
              </div>
            </div>

            {/* Risk Breakdown */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2.5">Risk Score Breakdown</h4>
              <div className="space-y-2">
                {breakdownItems.map((item) => (
                  <div key={item.label} className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground w-28 shrink-0">{item.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-accent/60 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground w-6 text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Affected Entity */}
            <div className="rounded-lg border border-border/50 bg-card/40 p-3.5">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="size-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold text-foreground">Affected Entities</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-muted-foreground">User</p>
                  <p className="font-medium text-foreground">{alert.userName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Asset</p>
                  <p className="font-medium text-foreground">{alert.assetName}</p>
                </div>
              </div>
            </div>

            {/* Contributing Events */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2.5">Contributing Events</h4>
              <div className="space-y-1.5">
                {alert.contributingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-md border border-border/40 bg-card/30 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-foreground">{event.type.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-muted-foreground">+{event.riskContribution}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {event.source} · {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Steps */}
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2.5">Recommended Investigation Steps</h4>
              <div className="space-y-1.5">
                {alert.recommendedSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="size-3.5 mt-0.5 shrink-0 text-primary/60" />
                    <span className="text-xs text-foreground/80">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

export default function ThreatsPage() {
  const data = getSOCData();
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAlerts = useMemo(() => {
    return data.alerts.filter((alert) => {
      if (severityFilter !== "all" && alert.severity !== severityFilter) return false;
      if (statusFilter !== "all" && alert.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          alert.title.toLowerCase().includes(q) ||
          alert.userName.toLowerCase().includes(q) ||
          alert.assetName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [data.alerts, severityFilter, statusFilter, searchQuery]);

  return (
    <SOCLayout>
      <RoleGuard allowedRoles={["analyst", "officer"]}>
        <div className="space-y-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Threat Monitoring</h1>
            <p className="text-sm text-muted-foreground">
              Active alerts with severity classification and AI analysis
            </p>
          </div>

          {/* Filters */}
          <Card className="border-border/50 bg-card/60 py-3">
            <CardContent className="flex flex-wrap items-center gap-3 px-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts, users, or assets..."
                  className="pl-8 h-8 text-xs bg-background/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={severityFilter} onValueChange={setSeverityFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs bg-background/50">
                  <SelectValue placeholder="Severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Severity</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px] h-8 text-xs bg-background/50">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="false_positive">False Positive</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">{filteredAlerts.length} alerts</span>
            </CardContent>
          </Card>

          {/* Alerts Table */}
          <Card className="border-border/50 bg-card/60">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Severity</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Alert</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">User</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Asset</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Risk</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Time</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlerts.slice(0, 25).map((alert) => (
                  <TableRow
                    key={alert.id}
                    className="border-border/30 cursor-pointer group"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <TableCell>
                      <SeverityBadge severity={alert.severity} />
                    </TableCell>
                    <TableCell>
                      <p className="text-xs font-medium text-foreground max-w-[200px] truncate">{alert.title}</p>
                    </TableCell>
                    <TableCell className="text-xs text-foreground/80">{alert.userName}</TableCell>
                    <TableCell className="text-xs text-foreground/80">{alert.assetName}</TableCell>
                    <TableCell className="text-right">
                      <span
                        className="text-sm font-bold tabular-nums"
                        style={{
                          color:
                            alert.riskScore >= 80
                              ? "var(--color-severity-critical)"
                              : alert.riskScore >= 60
                                ? "var(--color-severity-high)"
                                : alert.riskScore >= 35
                                  ? "var(--color-severity-medium)"
                                  : "var(--color-severity-low)",
                        }}
                      >
                        {alert.riskScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={alert.status} />
                    </TableCell>
                    <TableCell className="text-[11px] text-muted-foreground whitespace-nowrap">
                      {new Date(alert.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        {/* Detail panel */}
        {selectedAlert && (
          <AlertDetail alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
        )}
      </RoleGuard>
    </SOCLayout>
  );
}
