import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// ---- Roles ----

export const ROLES = {
  ADMIN: "admin",
  ANALYST: "analyst",
  OFFICER: "officer",
  COMMAND: "command",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.ANALYST),
  v.literal(ROLES.OFFICER),
  v.literal(ROLES.COMMAND),
);
export type Role = Infer<typeof roleValidator>;

// ---- Schema ----

const schema = defineSchema(
  {
    // Default auth tables — do not remove
    ...authTables,

    // Users table (extends the auth users table with role)
    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      orgUnitId: v.optional(v.string()),
    }).index("email", ["email"]),

    // ---- AI Kavach SOC tables ----

    // Synthetic users (monitored entities in the demo)
    syntheticUsers: defineTable({
      displayName: v.string(),
      orgUnit: v.string(),
      department: v.string(),
      baselineProfile: v.optional(v.any()),
    }).index("by_orgUnit", ["orgUnit"]),

    // Assets (hosts, servers, network devices)
    assets: defineTable({
      hostname: v.string(),
      ipAddress: v.string(),
      assetType: v.string(),
      orgUnit: v.string(),
    }).index("by_orgUnit", ["orgUnit"]),

    // User behaviour events (login, resource_access, privilege_use, data_transfer)
    userBehaviourEvents: defineTable({
      syntheticUserId: v.id("syntheticUsers"),
      eventType: v.string(),
      eventTime: v.number(), // unix timestamp ms
      metadata: v.optional(v.any()),
    }).index("by_user_time", ["syntheticUserId", "eventTime"]),

    // Network events (connection, auth_failure, outbound_transfer, internal_comm)
    networkEvents: defineTable({
      assetId: v.id("assets"),
      eventType: v.string(),
      eventTime: v.number(), // unix timestamp ms
      metadata: v.optional(v.any()),
    }).index("by_asset_time", ["assetId", "eventTime"]),

    // Risk scores (computed per user/asset)
    riskScores: defineTable({
      syntheticUserId: v.optional(v.id("syntheticUsers")),
      assetId: v.optional(v.id("assets")),
      score: v.number(), // 0-100
      riskLevel: v.string(), // LOW, MEDIUM, HIGH, CRITICAL
      signals: v.optional(v.any()), // scoring signal breakdown
      computedAt: v.number(),
    }).index("by_user", ["syntheticUserId"])
      .index("by_asset", ["assetId"])
      .index("by_time", ["computedAt"]),

    // AI analysis results (Grok output)
    aiAnalysis: defineTable({
      riskScoreId: v.id("riskScores"),
      rawResponse: v.optional(v.any()),
      summary: v.optional(v.string()),
      confidence: v.number(),
      indicators: v.optional(v.array(v.string())),
      recommendedInvestigation: v.optional(v.array(v.string())),
    }).index("by_riskScore", ["riskScoreId"]),

    // Alerts (generated when score crosses threshold)
    alerts: defineTable({
      riskScoreId: v.id("riskScores"),
      syntheticUserId: v.optional(v.id("syntheticUsers")),
      assetId: v.optional(v.id("assets")),
      title: v.string(),
      description: v.string(),
      severity: v.string(), // LOW, MEDIUM, HIGH, CRITICAL
      status: v.string(),   // new, acknowledged, dismissed
      riskScore: v.number(),
      aiSummary: v.optional(v.string()),
      confidence: v.optional(v.number()),
      recommendedSteps: v.optional(v.array(v.string())),
      contributingEvents: v.optional(v.array(v.any())),
      riskBreakdown: v.optional(v.any()),
    }).index("by_severity", ["severity"])
      .index("by_status", ["status"])
      .index("by_user", ["syntheticUserId"]),

    // Incidents (linked to alerts)
    incidents: defineTable({
      alertId: v.id("alerts"),
      syntheticUserId: v.optional(v.id("syntheticUsers")),
      assetIds: v.optional(v.array(v.id("assets"))),
      title: v.string(),
      description: v.string(),
      severity: v.string(),
      status: v.string(), // open, investigating, resolved, false_positive
      riskScore: v.number(),
      assignedTo: v.optional(v.string()), // user id
      aiExplanation: v.optional(v.string()),
      recommendedActions: v.optional(v.array(v.string())),
      events: v.optional(v.array(v.any())),
    }).index("by_status", ["status"])
      .index("by_alert", ["alertId"]),

    // Incident notes (analyst commentary)
    incidentNotes: defineTable({
      incidentId: v.id("incidents"),
      authorId: v.string(),
      authorName: v.string(),
      content: v.string(),
    }).index("by_incident", ["incidentId"]),

    // Audit log (every AI call and analyst action)
    auditLog: defineTable({
      actorId: v.optional(v.string()),
      actorName: v.optional(v.string()),
      action: v.string(),
      targetTable: v.optional(v.string()),
      targetId: v.optional(v.string()),
      details: v.optional(v.any()),
    }).index("by_time", ["actorId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
