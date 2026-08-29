// ============================================================
// AI Kavach — Synthetic SOC Data Layer
// All data is 100% synthetic. No real PII or real threat data.
// ============================================================

export type Severity = "low" | "medium" | "high" | "critical";
export type AlertStatus = "open" | "investigating" | "resolved" | "false_positive";
export type RiskLevel = "low" | "elevated" | "high" | "critical";
export type UserRole = "analyst" | "officer" | "command" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  org_unit: string;
  avatar?: string;
}

export interface SyntheticUser {
  id: string;
  name: string;
  department: string;
  riskScore: number;
  lastLogin: string;
  loginCount30d: number;
  unusualLogins: number;
  privilegeEvents: number;
  dataTransfers: number;
  accessAnomalies: number;
  status: "normal" | "elevated" | "suspicious" | "critical";
}

export interface Asset {
  id: string;
  name: string;
  type: "server" | "workstation" | "network_device" | "database" | "cloud";
  ip: string;
  riskScore: number;
  connections: number;
  unusualConnections: number;
  authFailures: number;
  trafficVolume: number;
  outboundTransfers: number;
  status: "healthy" | "elevated" | "warning" | "critical";
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: AlertStatus;
  userId: string;
  userName: string;
  assetId: string;
  assetName: string;
  riskScore: number;
  confidence: number;
  timestamp: string;
  aiExplanation: string;
  recommendedSteps: string[];
  contributingEvents: ContributingEvent[];
  riskBreakdown: RiskBreakdown;
}

export interface ContributingEvent {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  source: string;
  riskContribution: number;
}

export interface RiskBreakdown {
  loginAnomaly: number;
  accessAnomaly: number;
  privilegeAnomaly: number;
  dataTransferAnomaly: number;
  networkAnomaly: number;
  timeAnomaly: number;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  status: AlertStatus;
  userId: string;
  userName: string;
  assetIds: string[];
  assetNames: string[];
  riskScore: number;
  createdAt: string;
  updatedAt: string;
  aiExplanation: string;
  recommendedActions: string[];
  events: ContributingEvent[];
  notes: IncidentNote[];
}

export interface IncidentNote {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface RiskTrendPoint {
  date: string;
  score: number;
  alerts: number;
  incidents: number;
}

export interface RiskDistribution {
  level: string;
  count: number;
  fill: string;
}

export interface LoginPattern {
  hour: number;
  count: number;
  normal: boolean;
}

export interface TrafficPoint {
  time: string;
  inbound: number;
  outbound: number;
  normal: boolean;
}

// ---- SEED DATA GENERATION ----

const DEPARTMENTS = ["Engineering", "Finance", "HR", "Marketing", "Operations", "Security", "Legal", "Sales"];
const ASSET_TYPES: Asset["type"][] = ["server", "workstation", "network_device", "database", "cloud"];
const ALERT_TITLES = [
  "Impossible travel detected",
  "Brute force authentication attempt",
  "Privilege escalation detected",
  "Unusual data export volume",
  "Lateral movement pattern",
  "Suspicious DNS queries",
  "Anomalous file access pattern",
  "Unauthorized API access",
  "Credential stuffing attempt",
  "Data exfiltration indicators",
  "Malware C2 communication",
  "Unauthorized cloud resource access",
  "SQL injection attempt detected",
  "Abnormal after-hours access",
  "Unusual VPN connection origin",
];

const SEVERITY_WEIGHTS: Severity[] = ["low", "low", "low", "low", "medium", "medium", "medium", "high", "high", "critical"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateId(prefix: string): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}_${id}`;
}

function generateIP(): string {
  return `${randInt(10, 192)}.${randInt(0, 255)}.${randInt(0, 255)}.${randInt(1, 254)}`;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(randInt(0, 23), randInt(0, 59), randInt(0, 59));
  return d.toISOString();
}

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  d.setMinutes(randInt(0, 59));
  return d.toISOString();
}

function severityToScore(s: Severity): number {
  switch (s) {
    case "critical": return randInt(80, 98);
    case "high": return randInt(60, 79);
    case "medium": return randInt(35, 59);
    case "low": return randInt(10, 34);
  }
}

function scoreToLevel(score: number): RiskLevel {
  if (score >= 80) return "critical";
  if (score >= 60) return "high";
  if (score >= 35) return "elevated";
  return "low";
}

// Generate synthetic users
function generateSyntheticUsers(count: number): SyntheticUser[] {
  const firstNames = ["Aarav", "Priya", "Rohan", "Ananya", "Vikram", "Meera", "Arjun", "Deepa", "Kiran", "Nisha",
    "Raj", "Pooja", "Sanjay", "Kavita", "Amit", "Geeta", "Manoj", "Sunita", "Prakash", "Lata"];
  const lastNames = ["Sharma", "Patel", "Kumar", "Singh", "Reddy", "Nair", "Gupta", "Joshi", "Rao", "Verma",
    "Mehta", "Iyer", "Desai", "Kapoor", "Mishra", "Bhat", "Chandra", "Pillai", "Sinha", "Das"];

  return Array.from({ length: count }, (_, i) => {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[(i + Math.floor(i / firstNames.length)) % lastNames.length];
    const riskScore = randInt(5, 95);
    const status = riskScore >= 80 ? "critical" : riskScore >= 60 ? "suspicious" : riskScore >= 35 ? "elevated" : "normal";
    return {
      id: generateId("user"),
      name: `${first} ${last}`,
      department: pick(DEPARTMENTS),
      riskScore,
      lastLogin: hoursAgo(randInt(1, 72)),
      loginCount30d: randInt(5, 45),
      unusualLogins: randInt(0, 8),
      privilegeEvents: randInt(0, 12),
      dataTransfers: randInt(0, 15),
      accessAnomalies: randInt(0, 10),
      status,
    };
  });
}

// Generate assets
function generateAssets(count: number): Asset[] {
  const names = [
    "SRV-PROD-01", "SRV-PROD-02", "SRV-DB-MASTER", "SRV-DB-REPLICA",
    "WS-EXEC-01", "WS-EXEC-02", "WS-DEV-05", "WS-DEV-06", "WS-FIN-03", "WS-HR-01",
    "NET-FW-EDGE-01", "NET-SW-CORE-01", "NET-AP-WIFI-01", "NET-LB-PROD",
    "DB-ANALYTICS", "DB-CRM", "DB-WAREHOUSE", "DB-AUDIT",
    "CLOUD-AWS-EC2", "CLOUD-AWS-S3", "CLOUD-AZURE-API", "CLOUD-GCP-GKE",
    "SRV-VPN-GATEWAY", "SRV-Mail-PROD", "SRV-OBS-STACK"
  ];

  return names.slice(0, count).map((name, i) => {
    const riskScore = randInt(5, 95);
    const status = riskScore >= 80 ? "critical" : riskScore >= 60 ? "warning" : riskScore >= 35 ? "elevated" : "healthy";
    return {
      id: generateId("asset"),
      name,
      type: ASSET_TYPES[i % ASSET_TYPES.length],
      ip: generateIP(),
      riskScore,
      connections: randInt(5, 200),
      unusualConnections: randInt(0, 15),
      authFailures: randInt(0, 25),
      trafficVolume: randInt(100, 50000),
      outboundTransfers: randInt(0, 5000),
      status,
    };
  });
}

// Generate alerts
function generateAlerts(count: number, users: SyntheticUser[], assets: Asset[]): Alert[] {
  return Array.from({ length: count }, (_, i) => {
    const severity = pick(SEVERITY_WEIGHTS);
    const user = pick(users);
    const asset = pick(assets);
    const riskScore = severityToScore(severity);
    const confidence = Math.round(randFloat(0.55, 0.98) * 100) / 100;

    return {
      id: generateId("alert"),
      title: pick(ALERT_TITLES),
      description: `Synthetic alert #${i + 1} for demonstration purposes. Generated rule-based detection on user activity.`,
      severity,
      status: pick(["open", "open", "investigating", "resolved", "false_positive"] as const),
      userId: user.id,
      userName: user.name,
      assetId: asset.id,
      assetName: asset.name,
      riskScore,
      confidence,
      timestamp: daysAgo(randInt(0, 13)),
      aiExplanation: generateAIExplanation(severity, user.name, asset.name),
      recommendedSteps: generateRecommendations(severity),
      contributingEvents: generateEvents(randInt(2, 5)),
      riskBreakdown: {
        loginAnomaly: randInt(0, 25),
        accessAnomaly: randInt(0, 25),
        privilegeAnomaly: randInt(0, 20),
        dataTransferAnomaly: randInt(0, 20),
        networkAnomaly: randInt(0, 15),
        timeAnomaly: randInt(0, 15),
      },
    };
  });
}

function generateAIExplanation(severity: Severity, userName: string, assetName: string): string {
  const explanations: Record<Severity, string[]> = {
    critical: [
      `Critical risk assessment for user ${userName}: Pattern matches known lateral movement technique. Multiple compromised service accounts detected accessing ${assetName}. Immediate containment recommended.`,
      `High-confidence critical alert: ${userName} exhibited impossible travel (login from two distant locations within minutes). Asset ${assetName} shows signs of credential harvesting.`,
    ],
    high: [
      `Elevated risk for ${userName}: Unusual privilege escalation sequence detected on ${assetName}. The pattern deviates significantly from baseline behavior for this user role.`,
      `${userName} accessed ${assetName} with elevated permissions outside normal business hours. Behavioral anomaly score exceeds organizational threshold.`,
    ],
    medium: [
      `Moderate risk: ${userName} shows anomalous access patterns on ${assetName}. While not definitively malicious, the deviation warrants monitoring.`,
      `${userName} data transfer patterns to ${assetName} exceed 2 standard deviations from departmental average.`,
    ],
    low: [
      `Low risk: Minor behavioral anomaly detected for ${userName} on ${assetName}. Within acceptable variance but flagged for record-keeping.`,
      `Routine anomaly flagged: ${userName} login pattern differs slightly from historical baseline on ${assetName}. No immediate action required.`,
    ],
  };
  return pick(explanations[severity]);
}

function generateRecommendations(severity: Severity): string[] {
  const recs: Record<Severity, string[]> = {
    critical: [
      "Isolate affected endpoints immediately",
      "Reset credentials for affected accounts",
      "Activate incident response team",
      "Capture forensic memory dump",
      "Review all access logs for the past 72 hours",
      "Block suspicious IP addresses at firewall",
    ],
    high: [
      "Review and restrict user privileges",
      "Enable enhanced logging on affected assets",
      "Schedule credential rotation",
      "Conduct targeted network traffic analysis",
      "Notify department security lead",
    ],
    medium: [
      "Monitor user activity for 48 hours",
      "Review recent access control changes",
      "Validate data transfer authorization",
      "Update behavioral baseline profile",
    ],
    low: [
      "Log for trend analysis",
      "Review during next security audit",
      "No immediate action required",
    ],
  };
  const count = severity === "critical" ? 5 : severity === "high" ? 4 : severity === "medium" ? 3 : 2;
  return recs[severity].slice(0, count);
}

function generateEvents(count: number): ContributingEvent[] {
  const eventTypes = ["login", "file_access", "api_call", "data_transfer", "privilege_change", "network_connection", "dns_query"];
  const sources = ["SIEM", "EDR", "Network Monitor", "DLP", "IAM"];
  return Array.from({ length: count }, (_, i) => ({
    id: generateId("evt"),
    type: pick(eventTypes),
    description: `Synthetic event ${i + 1} for rule-based detection`,
    timestamp: hoursAgo(randInt(1, 48)),
    source: pick(sources),
    riskContribution: randInt(5, 30),
  }));
}

// Generate incidents
function generateIncidents(count: number, users: SyntheticUser[], assets: Asset[]): Incident[] {
  const titles = [
    "Potential Account Compromise — Multiple Credential Failures",
    "Suspicious Data Export from Production Database",
    "Lateral Movement Detected Across Internal Network",
    "Unauthorized Privilege Escalation Attempt",
    "Unusual Cloud Resource Provisioning",
    "Potential Insider Threat — Abnormal Access Patterns",
    "C2 Communication Detected from Workstation",
    "Credential Harvesting Attempt via Phishing Link",
  ];
  const actions: Record<Severity, string[]> = {
    critical: ["Isolate endpoints", "Engage IR team", "Notify CISO", "Preserve forensic evidence"],
    high: ["Restrict user access", "Review network segmentation", "Enable MFA enforcement"],
    medium: ["Increase monitoring", "Review access policies", "Schedule user training"],
    low: ["Log for audit", "Review in next cycle"],
  };

  return Array.from({ length: count }, (_, i) => {
    const severity = pick(SEVERITY_WEIGHTS);
    const user = pick(users);
    const affectedAssets = [pick(assets), pick(assets)];
    const riskScore = severityToScore(severity);
    const createdAt = daysAgo(randInt(0, 12));
    return {
      id: generateId("inc"),
      title: titles[i % titles.length],
      description: `Synthetic incident #${i + 1}: Security event chain detected. Multiple correlated alerts suggest coordinated activity requiring investigation.`,
      severity,
      status: pick(["open", "open", "investigating", "investigating", "resolved"] as const),
      userId: user.id,
      userName: user.name,
      assetIds: affectedAssets.map(a => a.id),
      assetNames: affectedAssets.map(a => a.name),
      riskScore,
      createdAt,
      updatedAt: hoursAgo(randInt(1, 24)),
      aiExplanation: generateAIExplanation(severity, user.name, affectedAssets[0].name),
      recommendedActions: actions[severity],
      events: generateEvents(randInt(3, 7)),
      notes: [
        {
          id: generateId("note"),
          author: "SOC Analyst",
          content: "Initial triage complete. Correlating with adjacent alerts.",
          timestamp: daysAgo(randInt(0, 5)),
        },
      ],
    };
  });
}

// Generate risk trend data (14 days)
function generateRiskTrend(): RiskTrendPoint[] {
  let baseScore = randInt(40, 60);
  return Array.from({ length: 14 }, (_, i) => {
    baseScore += randInt(-8, 8);
    baseScore = Math.max(20, Math.min(90, baseScore));
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      score: baseScore,
      alerts: randInt(3, 18),
      incidents: randInt(0, 5),
    };
  });
}

// Generate login patterns (24h)
function generateLoginPatterns(): LoginPattern[] {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hour >= 9 && hour <= 17 ? randInt(20, 80) : hour >= 1 && hour <= 5 ? randInt(0, 3) : randInt(5, 25),
    normal: !(hour >= 1 && hour <= 5),
  }));
}

// Generate traffic data (24h)
function generateTrafficData(): TrafficPoint[] {
  return Array.from({ length: 24 }, (_, i) => {
    const normal = i >= 6 && i <= 22;
    return {
      time: `${String(i).padStart(2, "0")}:00`,
      inbound: normal ? randInt(500, 5000) : randInt(10, 200),
      outbound: normal ? randInt(200, 3000) : randInt(5, 100),
      normal,
    };
  });
}

// ---- FULL DATASET ----

let _data: {
  users: SyntheticUser[];
  assets: Asset[];
  alerts: Alert[];
  incidents: Incident[];
  riskTrend: RiskTrendPoint[];
  riskDistribution: RiskDistribution[];
  loginPatterns: Record<string, LoginPattern[]>;
  trafficData: Record<string, TrafficPoint[]>;
} | null = null;

export function getSOCData() {
  if (_data) return _data;

  const users = generateSyntheticUsers(20);
  const assets = generateAssets(25);
  const alerts = generateAlerts(50, users, assets);
  const incidents = generateIncidents(12, users, assets);
  const riskTrend = generateRiskTrend();

  const riskDistribution: RiskDistribution[] = [
    { level: "Low", count: alerts.filter(a => a.severity === "low").length, fill: "var(--color-severity-low)" },
    { level: "Medium", count: alerts.filter(a => a.severity === "medium").length, fill: "var(--color-severity-medium)" },
    { level: "High", count: alerts.filter(a => a.severity === "high").length, fill: "var(--color-severity-high)" },
    { level: "Critical", count: alerts.filter(a => a.severity === "critical").length, fill: "var(--color-severity-critical)" },
  ];

  const loginPatterns: Record<string, LoginPattern[]> = {};
  const trafficData: Record<string, TrafficPoint[]> = {};
  users.forEach(u => { loginPatterns[u.id] = generateLoginPatterns(); });
  assets.forEach(a => { trafficData[a.id] = generateTrafficData(); });

  _data = { users, assets, alerts, incidents, riskTrend, riskDistribution, loginPatterns, trafficData };
  return _data;
}

// ---- COMPUTED DASHBOARD STATS ----

export function getDashboardStats() {
  const data = getSOCData();
  const openAlerts = data.alerts.filter(a => a.status === "open");
  const criticalAlerts = data.alerts.filter(a => a.severity === "critical");
  const activeIncidents = data.incidents.filter(i => i.status !== "resolved" && i.status !== "false_positive");
  const avgRisk = Math.round(data.users.reduce((s, u) => s + u.riskScore, 0) / data.users.length);

  return {
    overallRiskScore: avgRisk,
    riskLevel: scoreToLevel(avgRisk),
    activeThreats: openAlerts.length,
    criticalAlerts: criticalAlerts.length,
    activeIncidents: activeIncidents.length,
    topSuspiciousUsers: [...data.users].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5),
    topRiskyAssets: [...data.assets].sort((a, b) => b.riskScore - a.riskScore).slice(0, 5),
    recentIncidents: data.incidents.slice(0, 5),
    recentEventsTimeline: data.alerts
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10),
  };
}

// Severity helpers
export function severityColor(severity: Severity): string {
  switch (severity) {
    case "critical": return "text-[var(--color-severity-critical)]";
    case "high": return "text-[var(--color-severity-high)]";
    case "medium": return "text-[var(--color-severity-medium)]";
    case "low": return "text-[var(--color-severity-low)]";
  }
}

export function severityBgColor(severity: Severity): string {
  switch (severity) {
    case "critical": return "bg-[oklch(0.62_0.22_25/12%)]";
    case "high": return "bg-[oklch(0.72_0.16_55/12%)]";
    case "medium": return "bg-[oklch(0.70_0.14_220/12%)]";
    case "low": return "bg-[oklch(0.65_0.06_260/12%)]";
  }
}

export function statusColor(status: AlertStatus): string {
  switch (status) {
    case "open": return "bg-red-500/15 text-red-400 border-red-500/30";
    case "investigating": return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "resolved": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "false_positive": return "bg-zinc-500/15 text-zinc-400 border-zinc-500/30";
  }
}

export function statusLabel(status: AlertStatus): string {
  switch (status) {
    case "open": return "Open";
    case "investigating": return "Investigating";
    case "resolved": return "Resolved";
    case "false_positive": return "False Positive";
  }
}

export function riskGaugeColor(score: number): string {
  if (score >= 80) return "var(--color-severity-critical)";
  if (score >= 60) return "var(--color-severity-high)";
  if (score >= 35) return "var(--color-severity-medium)";
  return "var(--color-severity-low)";
}
