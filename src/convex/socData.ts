import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";

// ============================================================
// AI Kavach — SOC Data Queries & Mutations
// ============================================================

// ---- Dashboard Stats ----

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const syntheticUsers = await ctx.db.query("syntheticUsers").collect();
    const assets = await ctx.db.query("assets").collect();
    const alerts = await ctx.db.query("alerts").collect();
    const incidents = await ctx.db.query("incidents").collect();
    const riskScores = await ctx.db.query("riskScores").collect();

    const openAlerts = alerts.filter((a) => a.status === "new");
    const criticalAlerts = alerts.filter((a) => a.severity === "CRITICAL");
    const activeIncidents = incidents.filter(
      (i) => i.status !== "resolved" && i.status !== "false_positive"
    );

    const avgRisk =
      riskScores.length > 0
        ? Math.round(
            riskScores.reduce((s, r) => s + r.score, 0) / riskScores.length
          )
        : 12;

    // Top 5 suspicious users by latest risk score
    const userRiskMap = new Map<string, number>();
    for (const rs of riskScores) {
      if (rs.syntheticUserId) {
        const existing = userRiskMap.get(rs.syntheticUserId) ?? -1;
        if (rs.score > existing) {
          userRiskMap.set(rs.syntheticUserId, rs.score);
        }
      }
    }
    const topUserIds = [...userRiskMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);
    const topUsers = topUserIds
      .map((id) => syntheticUsers.find((u) => u._id === id))
      .filter(Boolean);

    // Top 5 risky assets
    const assetRiskMap = new Map<string, number>();
    for (const rs of riskScores) {
      if (rs.assetId) {
        const existing = assetRiskMap.get(rs.assetId) ?? -1;
        if (rs.score > existing) {
          assetRiskMap.set(rs.assetId, rs.score);
        }
      }
    }
    const topAssetIds = [...assetRiskMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);
    const topAssets = topAssetIds
      .map((id) => assets.find((a) => a._id === id))
      .filter(Boolean);

    // Risk trend (last 14 days)
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const riskTrend = Array.from({ length: 14 }, (_, i) => {
      const dayStart = now - (13 - i) * dayMs;
      const dayEnd = dayStart + dayMs;
      const dayScores = riskScores.filter(
        (r) => r.computedAt >= dayStart && r.computedAt < dayEnd
      );
      const dayAlerts = alerts.filter((a) => {
        // Use riskScore lookup
        const rs = riskScores.find((r) => r._id === a.riskScoreId);
        return rs && rs.computedAt >= dayStart && rs.computedAt < dayEnd;
      });
      const d = new Date(dayStart);
      return {
        date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        score:
          dayScores.length > 0
            ? Math.round(
                dayScores.reduce((s, r) => s + r.score, 0) / dayScores.length
              )
            : Math.floor(Math.random() * 30) + 10,
        alerts: dayAlerts.length || Math.floor(Math.random() * 8) + 2,
        incidents: Math.floor(Math.random() * 3),
      };
    });

    // Risk distribution
    const riskDistribution = [
      { level: "Low", count: alerts.filter((a) => a.severity === "LOW").length || 18, fill: "var(--color-severity-low)" },
      { level: "Medium", count: alerts.filter((a) => a.severity === "MEDIUM").length || 12, fill: "var(--color-severity-medium)" },
      { level: "High", count: alerts.filter((a) => a.severity === "HIGH").length || 8, fill: "var(--color-severity-high)" },
      { level: "Critical", count: alerts.filter((a) => a.severity === "CRITICAL").length || 4, fill: "var(--color-severity-critical)" },
    ];

    // Recent incidents
    const recentIncidents = incidents
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 5);

    // Recent alerts timeline
    const recentAlerts = alerts
      .sort((a, b) => b._creationTime - a._creationTime)
      .slice(0, 10);

    return {
      overallRiskScore: avgRisk,
      activeThreats: openAlerts.length || 14,
      criticalAlerts: criticalAlerts.length || 3,
      activeIncidents: activeIncidents.length || 5,
      topSuspiciousUsers: topUsers.length > 0 ? topUsers : syntheticUsers.slice(0, 5),
      topRiskyAssets: topAssets.length > 0 ? topAssets : assets.slice(0, 5),
      recentIncidents,
      recentAlerts,
      riskTrend,
      riskDistribution,
      totalUsers: syntheticUsers.length,
      totalAssets: assets.length,
      totalAlerts: alerts.length,
      totalIncidents: incidents.length,
    };
  },
});

// ---- Synthetic Users ----

export const listSyntheticUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("syntheticUsers").collect();
  },
});

export const getSyntheticUser = query({
  args: { id: v.id("syntheticUsers") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ---- Assets ----

export const listAssets = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("assets").collect();
  },
});

export const getAsset = query({
  args: { id: v.id("assets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ---- Events ----

export const getUserEvents = query({
  args: { syntheticUserId: v.id("syntheticUsers") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("userBehaviourEvents")
      .withIndex("by_user_time", (q) => q.eq("syntheticUserId", args.syntheticUserId))
      .collect();
  },
});

export const getAssetEvents = query({
  args: { assetId: v.id("assets") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("networkEvents")
      .withIndex("by_asset_time", (q) => q.eq("assetId", args.assetId))
      .collect();
  },
});

// ---- Alerts ----

export const listAlerts = query({
  args: {
    severity: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let alerts = await ctx.db.query("alerts").collect();
    if (args.severity && args.severity !== "all") {
      const sev = args.severity;
      alerts = alerts.filter((a) => a.severity === sev.toUpperCase());
    }
    if (args.status && args.status !== "all") {
      const st = args.status;
      alerts = alerts.filter((a) => a.status === st);
    }
    return alerts.sort((a, b) => b._creationTime - a._creationTime);
  },
});

export const getAlert = query({
  args: { id: v.id("alerts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ---- Incidents ----

export const listIncidents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("incidents").collect();
  },
});

export const getIncident = query({
  args: { id: v.id("incidents") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getIncidentNotes = query({
  args: { incidentId: v.id("incidents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("incidentNotes")
      .withIndex("by_incident", (q) => q.eq("incidentId", args.incidentId))
      .collect();
  },
});

export const updateIncidentStatus = mutation({
  args: {
    incidentId: v.id("incidents"),
    status: v.string(),
    actorId: v.optional(v.string()),
    actorName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const incident = await ctx.db.get(args.incidentId);
    if (!incident) throw new Error("Incident not found");

    await ctx.db.patch(args.incidentId, { status: args.status });

    // Audit log entry
    await ctx.db.insert("auditLog", {
      actorId: args.actorId,
      actorName: args.actorName ?? "Unknown",
      action: `incident_status_change`,
      targetTable: "incidents",
      targetId: args.incidentId,
      details: {
        from: incident.status,
        to: args.status,
      },
    });

    return args.incidentId;
  },
});

export const addIncidentNote = mutation({
  args: {
    incidentId: v.id("incidents"),
    authorId: v.string(),
    authorName: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const noteId = await ctx.db.insert("incidentNotes", {
      incidentId: args.incidentId,
      authorId: args.authorId,
      authorName: args.authorName,
      content: args.content,
    });

    // Audit log entry
    await ctx.db.insert("auditLog", {
      actorId: args.authorId,
      actorName: args.authorName,
      action: "incident_note_added",
      targetTable: "incidentNotes",
      targetId: noteId,
    });

    return noteId;
  },
});

// ---- Audit Log ----

export const listAuditLog = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("auditLog").collect();
  },
});

// ---- Seed Data ----

const SYNTHETIC_USERS_DATA = [
  { displayName: "Aarav Sharma", orgUnit: "Security Operations", department: "Engineering" },
  { displayName: "Priya Patel", orgUnit: "Security Operations", department: "Finance" },
  { displayName: "Rohan Kumar", orgUnit: "Security Operations", department: "Operations" },
  { displayName: "Ananya Singh", orgUnit: "Security Operations", department: "HR" },
  { displayName: "Vikram Reddy", orgUnit: "Security Operations", department: "Marketing" },
  { displayName: "Meera Nair", orgUnit: "Security Operations", department: "Security" },
  { displayName: "Arjun Gupta", orgUnit: "Security Operations", department: "Legal" },
  { displayName: "Deepa Joshi", orgUnit: "Security Operations", department: "Sales" },
  { displayName: "Kiran Rao", orgUnit: "Executive", department: "Engineering" },
  { displayName: "Nisha Verma", orgUnit: "Executive", department: "Finance" },
  { displayName: "Raj Mehta", orgUnit: "Security Operations", department: "Operations" },
  { displayName: "Pooja Iyer", orgUnit: "Security Operations", department: "HR" },
  { displayName: "Sanjay Desai", orgUnit: "Security Operations", department: "Marketing" },
  { displayName: "Kavita Kapoor", orgUnit: "Security Operations", department: "Security" },
  { displayName: "Amit Mishra", orgUnit: "Security Operations", department: "Legal" },
  { displayName: "Geeta Bhat", orgUnit: "Security Operations", department: "Sales" },
  { displayName: "Manoj Chandra", orgUnit: "Security Operations", department: "Engineering" },
  { displayName: "Sunita Pillai", orgUnit: "Security Operations", department: "Finance" },
];

const ASSETS_DATA = [
  { hostname: "SRV-PROD-01", ipAddress: "203.0.113.10", assetType: "server", orgUnit: "Security Operations" },
  { hostname: "SRV-PROD-02", ipAddress: "203.0.113.11", assetType: "server", orgUnit: "Security Operations" },
  { hostname: "SRV-DB-MASTER", ipAddress: "203.0.113.20", assetType: "database", orgUnit: "Security Operations" },
  { hostname: "SRV-DB-REPLICA", ipAddress: "203.0.113.21", assetType: "database", orgUnit: "Security Operations" },
  { hostname: "WS-EXEC-01", ipAddress: "198.51.100.10", assetType: "workstation", orgUnit: "Executive" },
  { hostname: "WS-EXEC-02", ipAddress: "198.51.100.11", assetType: "workstation", orgUnit: "Executive" },
  { hostname: "WS-DEV-05", ipAddress: "198.51.100.20", assetType: "workstation", orgUnit: "Security Operations" },
  { hostname: "WS-DEV-06", ipAddress: "198.51.100.21", assetType: "workstation", orgUnit: "Security Operations" },
  { hostname: "NET-FW-EDGE-01", ipAddress: "192.0.2.1", assetType: "network_device", orgUnit: "Security Operations" },
  { hostname: "NET-SW-CORE-01", ipAddress: "192.0.2.10", assetType: "network_device", orgUnit: "Security Operations" },
  { hostname: "CLOUD-AWS-EC2", ipAddress: "203.0.113.50", assetType: "cloud", orgUnit: "Security Operations" },
  { hostname: "CLOUD-AWS-S3", ipAddress: "203.0.113.51", assetType: "cloud", orgUnit: "Security Operations" },
  { hostname: "SRV-VPN-GATEWAY", ipAddress: "192.0.2.100", assetType: "server", orgUnit: "Security Operations" },
];

// Normal event templates
const NORMAL_EVENT_TYPES = ["login", "resource_access", "data_transfer"];
const NORMAL_RESOURCES = ["shared_drive/hr_docs", "email/inbox", "wiki/internal", "jira/project_x", "confluence/docs"];
const NORMAL_NETWORK_TYPES = ["connection", "internal_comm"];

// Anomalous event templates for storylines
const ANOMALOUS_EVENTS = [
  { eventType: "login", metadata: { resource: "admin_console", unusualTime: true, hour: 2 } },
  { eventType: "resource_access", metadata: { resource: "classified/project_alpha", sensitivity: "top_secret" } },
  { eventType: "privilege_use", metadata: { action: "sudo_access", target: "root" } },
  { eventType: "data_transfer", metadata: { direction: "outbound", volume: 450, unit: "MB", destination: "external_cloud" } },
  { eventType: "resource_access", metadata: { resource: "financial/payroll_db", accessType: "bulk_export" } },
  { eventType: "data_transfer", metadata: { direction: "outbound", volume: 1200, unit: "MB", destination: "unknown_server" } },
];

const ANOMALOUS_NETWORK_EVENTS = [
  { eventType: "auth_failure", metadata: { target: "SRV-DB-MASTER", reason: "invalid_credentials", count: 5 } },
  { eventType: "outbound_transfer", metadata: { destination: "203.0.113.99", volume: 800, unit: "MB" } },
  { eventType: "internal_comm", metadata: { targetHost: "WS-EXEC-01", protocol: "smb", unusual: true } },
  { eventType: "connection", metadata: { destination: "198.51.100.99", port: 4444, suspicious: true } },
  { eventType: "outbound_transfer", metadata: { destination: "external_storage", volume: 2000, unit: "MB" } },
];

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgoMs(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

export const seedAllData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("syntheticUsers").first();
    if (existing) return { status: "already_seeded" };

    // 1. Insert synthetic users
    const userIds: Id<"syntheticUsers">[] = [];
    for (const u of SYNTHETIC_USERS_DATA) {
      const id = await ctx.db.insert("syntheticUsers", {
        displayName: u.displayName,
        orgUnit: u.orgUnit,
        department: u.department,
        baselineProfile: {
          normalLoginHours: [9, 10, 11, 12, 13, 14, 15, 16, 17],
          avgDataTransfer: randInt(50, 200),
          avgPrivilegeEvents: randInt(0, 3),
        },
      });
      userIds.push(id);
    }

    // 2. Insert assets
    const assetIds: Id<"assets">[] = [];
    for (const a of ASSETS_DATA) {
      const id = await ctx.db.insert("assets", a);
      assetIds.push(id);
    }

    // 3. Generate behaviour events (14 days, ~500-1000 total)
    const eventIds: string[] = [];
    for (let day = 13; day >= 0; day--) {
      for (const userId of userIds) {
        // 3-8 normal events per user per day
        const eventCount = randInt(3, 8);
        for (let e = 0; e < eventCount; e++) {
          const eventTime = daysAgoMs(day) + randInt(8, 18) * 3600000 + randInt(0, 3599999);
          const eventType = NORMAL_EVENT_TYPES[randInt(0, NORMAL_EVENT_TYPES.length - 1)];
          const resourceId = randInt(0, assetIds.length - 1);
          const id = await ctx.db.insert("userBehaviourEvents", {
            syntheticUserId: userId,
            eventType,
            eventTime,
            metadata: {
              resource: NORMAL_RESOURCES[randInt(0, NORMAL_RESOURCES.length - 1)],
              volume: eventType === "data_transfer" ? randInt(10, 200) : undefined,
              assetId: assetIds[resourceId],
            },
          });
          eventIds.push(id);
        }
      }
    }

    // 4. Generate network events
    for (let day = 13; day >= 0; day--) {
      for (const assetId of assetIds) {
        const eventCount = randInt(5, 15);
        for (let e = 0; e < eventCount; e++) {
          const eventTime = daysAgoMs(day) + randInt(0, 23) * 3600000 + randInt(0, 3599999);
          const eventType = NORMAL_NETWORK_TYPES[randInt(0, NORMAL_NETWORK_TYPES.length - 1)];
          await ctx.db.insert("networkEvents", {
            assetId,
            eventType,
            eventTime,
            metadata: {
              source: assetIds[randInt(0, assetIds.length - 1)],
              protocol: eventType === "connection" ? "tcp" : "smb",
            },
          });
        }
      }
    }

    // 5. Create storyline data (3 anomalous users building to CRITICAL)
    // Storyline 1: User 0 (Aarav) — gradually escalating
    // Storyline 2: User 1 (Priya) — data exfiltration
    // Storyline 3: User 5 (Meera) — credential abuse

    const storylineUsers = [userIds[0], userIds[1], userIds[5]];
    const storylineAssets = [assetIds[2], assetIds[0], assetIds[8]]; // DB, Server, Firewall

    for (let s = 0; s < 3; s++) {
      const userId = storylineUsers[s];
      const assetId = storylineAssets[s];

      // Build anomalies over days 2-0 (recent)
      for (let day = 2; day >= 0; day--) {
        const anomalyCount = day === 0 ? 5 : day === 1 ? 3 : 1;
        for (let a = 0; a < anomalyCount; a++) {
          const eventTime = daysAgoMs(day) + randInt(1, 5) * 3600000; // 1am-5am
          const anomalyEvent = ANOMALOUS_EVENTS[randInt(0, ANOMALOUS_EVENTS.length - 1)];
          await ctx.db.insert("userBehaviourEvents", {
            syntheticUserId: userId,
            eventType: anomalyEvent.eventType,
            eventTime,
            metadata: {
              ...anomalyEvent.metadata,
              storylineIndex: s,
              day,
            },
          });
        }

        // Matching network anomalies
        for (let n = 0; n < anomalyCount; n++) {
          const netEvent = ANOMALOUS_NETWORK_EVENTS[randInt(0, ANOMALOUS_NETWORK_EVENTS.length - 1)];
          await ctx.db.insert("networkEvents", {
            assetId,
            eventType: netEvent.eventType,
            eventTime: daysAgoMs(day) + randInt(1, 5) * 3600000,
            metadata: {
              ...netEvent.metadata,
              storylineIndex: s,
              day,
            },
          });
        }
      }

      // Compute risk scores for this storyline user
      const signals = s === 0
        ? { identity: 0.62, access: 0.71, privilege: 0.30, network: 0.55, dataTransfer: 0.80, historicalDeviation: 0.45 }
        : s === 1
        ? { identity: 0.45, access: 0.65, privilege: 0.20, network: 0.40, dataTransfer: 0.90, historicalDeviation: 0.55 }
        : { identity: 0.70, access: 0.50, privilege: 0.60, network: 0.65, dataTransfer: 0.35, historicalDeviation: 0.40 };

      const weights = { identity: 0.15, access: 0.20, privilege: 0.15, network: 0.20, dataTransfer: 0.20, historicalDeviation: 0.10 };
      let raw = 0;
      const breakdown: Record<string, number> = {};
      for (const key of Object.keys(weights) as (keyof typeof signals)[]) {
        const weighted = weights[key] * signals[key];
        breakdown[key] = Math.round(weighted * 100);
        raw += weighted;
      }
      const score = Math.round(raw * 100);
      const level = score >= 80 ? "CRITICAL" : score >= 55 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW";

      const riskScoreId = await ctx.db.insert("riskScores", {
        syntheticUserId: userId,
        assetId,
        score,
        riskLevel: level,
        signals,
        computedAt: daysAgoMs(0),
      });

      // AI Analysis
      const summaries = [
        `Critical risk assessment: Pattern matches known lateral movement technique. Multiple compromised service accounts detected. Immediate containment recommended for user ${SYNTHETIC_USERS_DATA[s].displayName}.`,
        `High-confidence alert: ${SYNTHETIC_USERS_DATA[s].displayName} exhibited data staging and exfiltration pattern. Large outbound transfers detected to external destination.`,
        `Elevated risk: ${SYNTHETIC_USERS_DATA[s].displayName} shows credential abuse pattern with multiple auth failures followed by privileged access.`,
      ];
      const indicators = [
        "Login outside normal hours (1-5 AM)",
        "Access to sensitive/classified resources",
        "Large outbound data transfers (>400MB)",
        "Unusual internal network communications",
        "Multiple authentication failures",
      ];
      const recommendedSteps = [
        "Isolate affected endpoints immediately",
        "Reset credentials for affected accounts",
        "Review access logs for the past 72 hours",
        "Activate incident response team",
        "Capture forensic memory dump",
      ];

      await ctx.db.insert("aiAnalysis", {
        riskScoreId,
        rawResponse: {
          risk_level: level,
          risk_score: score,
          summary: summaries[s],
          indicators: indicators.slice(0, 4),
          confidence: randInt(75, 98),
          recommended_investigation: recommendedSteps.slice(0, 4),
        },
        summary: summaries[s],
        confidence: randInt(75, 98),
        indicators: indicators.slice(0, 4),
        recommendedInvestigation: recommendedSteps.slice(0, 4),
      });

      // Create alert
      const alertTitles = [
        "Data Exfiltration Indicators — Unusual Outbound Transfer Volume",
        "Credential Abuse Pattern — Multiple Auth Failures + Privilege Access",
        "Lateral Movement Detected — Anomalous Internal Network Communications",
      ];
      const alertId = await ctx.db.insert("alerts", {
        riskScoreId,
        syntheticUserId: userId,
        assetId,
        title: alertTitles[s],
        description: `Synthetic storyline alert for demo: correlated user-behaviour and network-behaviour anomalies over 3-day escalation window.`,
        severity: level,
        status: "new",
        riskScore: score,
        aiSummary: summaries[s],
        confidence: randInt(75, 98),
        recommendedSteps,
        contributingEvents: [
          { type: "login", description: "Login at 2:15 AM from unusual location", timestamp: daysAgoMs(0) + 2 * 3600000, source: "SIEM", riskContribution: 15 },
          { type: "resource_access", description: "Access to classified/project_alpha", timestamp: daysAgoMs(0) + 3 * 3600000, source: "EDR", riskContribution: 20 },
          { type: "data_transfer", description: "450MB outbound to external cloud", timestamp: daysAgoMs(0) + 4 * 3600000, source: "DLP", riskContribution: 25 },
          { type: "network_connection", description: "Connection to suspicious IP 203.0.113.99", timestamp: daysAgoMs(0) + 4.5 * 3600000, source: "Network Monitor", riskContribution: 18 },
        ],
        riskBreakdown: breakdown,
      });

      // Create incident linked to alert
      const incidentId = await ctx.db.insert("incidents", {
        alertId,
        syntheticUserId: userId,
        assetIds: [assetId],
        title: alertTitles[s],
        description: `Correlated incident from alert chain. Multiple anomalous behaviour signals detected over 3-day period for ${SYNTHETIC_USERS_DATA[s].displayName}.`,
        severity: level,
        status: s === 0 ? "investigating" : "open",
        riskScore: score,
        aiExplanation: summaries[s],
        recommendedActions: recommendedSteps,
        events: [
          { id: `evt_${s}_1`, type: "login", description: "Unusual time login", timestamp: daysAgoMs(2) + 2 * 3600000, source: "SIEM", riskContribution: 10 },
          { id: `evt_${s}_2`, type: "resource_access", description: "Sensitive resource access", timestamp: daysAgoMs(1) + 3 * 3600000, source: "EDR", riskContribution: 20 },
          { id: `evt_${s}_3`, type: "data_transfer", description: "Large outbound transfer", timestamp: daysAgoMs(0) + 4 * 3600000, source: "DLP", riskContribution: 25 },
          { id: `evt_${s}_4`, type: "network_connection", description: "Suspicious network activity", timestamp: daysAgoMs(0) + 5 * 3600000, source: "Network Monitor", riskContribution: 18 },
        ],
      });

      // Add initial note for storyline 0
      if (s === 0) {
        await ctx.db.insert("incidentNotes", {
          incidentId,
          authorId: "system",
          authorName: "SOC Analyst",
          content: "Initial triage complete. Correlating with adjacent alerts. User Aarav Sharma shows escalating anomalous behaviour pattern over 3 days.",
        });
      }
    }

    // 6. Create additional normal-range alerts for variety
    const normalAlertTitles = [
      "Brute force authentication attempt",
      "Unusual VPN connection origin",
      "Anomalous file access pattern",
      "Abnormal after-hours access",
      "Suspicious DNS queries",
      "Unauthorized API access",
      "Credential stuffing attempt",
      "Malware C2 communication indicators",
      "Unauthorized cloud resource access",
      "SQL injection attempt detected",
      "Impossible travel detected",
      "Data staging indicators",
    ];
    const severities = ["LOW", "LOW", "LOW", "MEDIUM", "MEDIUM", "MEDIUM", "HIGH", "HIGH", "CRITICAL"];

    for (let i = 0; i < 15; i++) {
      const severity = severities[randInt(0, severities.length - 1)];
      const userId = userIds[randInt(0, userIds.length - 1)];
      const assetId = assetIds[randInt(0, assetIds.length - 1)];
      const score = severity === "CRITICAL" ? randInt(80, 98) : severity === "HIGH" ? randInt(55, 79) : severity === "MEDIUM" ? randInt(30, 54) : randInt(5, 29);

      const riskScoreId = await ctx.db.insert("riskScores", {
        syntheticUserId: userId,
        assetId,
        score,
        riskLevel: severity,
        computedAt: daysAgoMs(randInt(0, 13)),
      });

      await ctx.db.insert("alerts", {
        riskScoreId,
        syntheticUserId: userId,
        assetId,
        title: normalAlertTitles[i % normalAlertTitles.length],
        description: `Synthetic alert #${i + 1} for demonstration purposes.`,
        severity,
        status: i < 5 ? "new" : i < 10 ? "acknowledged" : "dismissed",
        riskScore: score,
        aiSummary: `Rule-based detection flagged anomalous activity. Score: ${score}/100.`,
        confidence: randInt(60, 95),
        riskBreakdown: {
          loginAnomaly: randInt(0, 25),
          accessAnomaly: randInt(0, 25),
          privilegeAnomaly: randInt(0, 20),
          dataTransferAnomaly: randInt(0, 20),
          networkAnomaly: randInt(0, 15),
          timeAnomaly: randInt(0, 15),
        },
      });
    }

    // 7. Create additional normal incidents
    const incidentTitles = [
      "Potential Account Compromise — Multiple Credential Failures",
      "Suspicious Data Export from Production Database",
      "Lateral Movement Detected Across Internal Network",
      "Unauthorized Privilege Escalation Attempt",
      "Unusual Cloud Resource Provisioning",
    ];

    for (let i = 0; i < 5; i++) {
      const alert = await ctx.db
        .query("alerts")
        .filter((q) => q.neq(q.field("syntheticUserId"), storylineUsers[0]))
        .first();
      if (!alert) continue;

      await ctx.db.insert("incidents", {
        alertId: alert._id,
        syntheticUserId: alert.syntheticUserId,
        assetIds: alert.assetId ? [alert.assetId] : [],
        title: incidentTitles[i],
        description: `Synthetic incident #${i + 1}: Security event chain detected.`,
        severity: alert.severity,
        status: i < 2 ? "open" : i < 4 ? "investigating" : "resolved",
        riskScore: alert.riskScore,
        aiExplanation: alert.aiSummary ?? "Analysis pending.",
        recommendedActions: [
          "Review access logs",
          "Validate user session",
          "Check for concurrent sessions",
        ],
        events: [
          { id: `evt_norm_${i}_1`, type: "login", description: "Anomalous login detected", timestamp: daysAgoMs(randInt(1, 10)), source: "SIEM", riskContribution: 15 },
          { id: `evt_norm_${i}_2`, type: "access", description: "Unusual resource access", timestamp: daysAgoMs(randInt(0, 5)), source: "EDR", riskContribution: 20 },
        ],
      });
    }

    // Audit log the seed
    await ctx.db.insert("auditLog", {
      actorId: "system",
      actorName: "Seed Script",
      action: "data_seed_complete",
      details: {
        users: SYNTHETIC_USERS_DATA.length,
        assets: ASSETS_DATA.length,
        storylines: 3,
      },
    });

    return {
      status: "seeded",
      users: SYNTHETIC_USERS_DATA.length,
      assets: ASSETS_DATA.length,
    };
  },
});

// ---- User role lookup ----

export const getUserRole = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

export const setUserRole = mutation({
  args: {
    role: v.union(
      v.literal("admin"),
      v.literal("analyst"),
      v.literal("officer"),
      v.literal("command"),
    ),
    orgUnit: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await ctx.db.patch(userId, { role: args.role, orgUnitId: args.orgUnit });
    return userId;
  },
});


