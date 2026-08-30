/**
 * AI Kavach — Supabase Seed Script
 *
 * Run: npx tsx scripts/seed-supabase.ts
 *
 * Requires env vars:
 *   SUPABASE_URL=https://<project-ref>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=<service-role key from Supabase dashboard>
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
  process.exit(1);
}

const supabase = createClient(url, key);

// ---- Helpers ----

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgoMs(days: number) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

// ---- Static data ----

const ORG_UNITS = [
  { id: "a0000000-0000-0000-0000-000000000001", name: "Security Operations" },
  { id: "a0000000-0000-0000-0000-000000000002", name: "Executive" },
];

const SYNTHETIC_USERS = [
  { display_name: "Aarav Sharma", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Priya Patel", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Rohan Kumar", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Ananya Singh", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Vikram Reddy", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Meera Nair", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Arjun Gupta", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Deepa Joshi", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Kiran Rao", org_unit_id: ORG_UNITS[1].id },
  { display_name: "Nisha Verma", org_unit_id: ORG_UNITS[1].id },
  { display_name: "Raj Mehta", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Pooja Iyer", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Sanjay Desai", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Kavita Kapoor", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Amit Mishra", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Geeta Bhat", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Manoj Chandra", org_unit_id: ORG_UNITS[0].id },
  { display_name: "Sunita Pillai", org_unit_id: ORG_UNITS[0].id },
];

const ASSETS = [
  { hostname: "SRV-PROD-01", ip_address: "203.0.113.10", asset_type: "server", org_unit_id: ORG_UNITS[0].id },
  { hostname: "SRV-PROD-02", ip_address: "203.0.113.11", asset_type: "server", org_unit_id: ORG_UNITS[0].id },
  { hostname: "SRV-DB-MASTER", ip_address: "203.0.113.20", asset_type: "database", org_unit_id: ORG_UNITS[0].id },
  { hostname: "SRV-DB-REPLICA", ip_address: "203.0.113.21", asset_type: "database", org_unit_id: ORG_UNITS[0].id },
  { hostname: "WS-EXEC-01", ip_address: "198.51.100.10", asset_type: "workstation", org_unit_id: ORG_UNITS[1].id },
  { hostname: "WS-EXEC-02", ip_address: "198.51.100.11", asset_type: "workstation", org_unit_id: ORG_UNITS[1].id },
  { hostname: "WS-DEV-05", ip_address: "198.51.100.20", asset_type: "workstation", org_unit_id: ORG_UNITS[0].id },
  { hostname: "WS-DEV-06", ip_address: "198.51.100.21", asset_type: "workstation", org_unit_id: ORG_UNITS[0].id },
  { hostname: "NET-FW-EDGE-01", ip_address: "192.0.2.1", asset_type: "network_device", org_unit_id: ORG_UNITS[0].id },
  { hostname: "NET-SW-CORE-01", ip_address: "192.0.2.10", asset_type: "network_device", org_unit_id: ORG_UNITS[0].id },
  { hostname: "CLOUD-AWS-EC2", ip_address: "203.0.113.50", asset_type: "cloud", org_unit_id: ORG_UNITS[0].id },
  { hostname: "CLOUD-AWS-S3", ip_address: "203.0.113.51", asset_type: "cloud", org_unit_id: ORG_UNITS[0].id },
  { hostname: "SRV-VPN-GATEWAY", ip_address: "192.0.2.100", asset_type: "server", org_unit_id: ORG_UNITS[0].id },
];

const NORMAL_EVENT_TYPES = ["login", "resource_access", "data_transfer"];
const NORMAL_RESOURCES = ["shared_drive/hr_docs", "email/inbox", "wiki/internal", "jira/project_x", "confluence/docs"];
const NORMAL_NETWORK_TYPES = ["connection", "internal_comm"];

// ---- Main ----

async function seed() {
  console.log("Seeding AI Kavach data into Supabase...");

  // 1. Synthetic users
  const { data: existingUsers } = await supabase.from("synthetic_users").select("id").limit(1);
  if (existingUsers && existingUsers.length > 0) {
    console.log("Data already seeded. Skipping.");
    return;
  }

  const { data: insertedUsers, error: userErr } = await supabase
    .from("synthetic_users")
    .insert(SYNTHETIC_USERS)
    .select("id");
  if (userErr) throw userErr;
  console.log(`  Inserted ${insertedUsers?.length} synthetic users`);

  const userIds = insertedUsers!.map((u) => u.id);

  // 2. Assets
  const { data: insertedAssets, error: assetErr } = await supabase
    .from("assets")
    .insert(ASSETS)
    .select("id");
  if (assetErr) throw assetErr;
  console.log(`  Inserted ${insertedAssets?.length} assets`);

  const assetIds = insertedAssets!.map((a) => a.id);

  // 3. Behaviour events (14 days, ~500-800 total)
  const behaviourEvents: any[] = [];
  for (let day = 13; day >= 0; day--) {
    for (const userId of userIds) {
      const count = randInt(3, 6);
      for (let e = 0; e < count; e++) {
        const eventTime = new Date(daysAgoMs(day) + randInt(8, 18) * 3600000 + randInt(0, 3599999));
        behaviourEvents.push({
          synthetic_user_id: userId,
          event_type: NORMAL_EVENT_TYPES[randInt(0, NORMAL_EVENT_TYPES.length - 1)],
          event_time: eventTime.toISOString(),
          metadata: {
            resource: NORMAL_RESOURCES[randInt(0, NORMAL_RESOURCES.length - 1)],
            volume: Math.random() > 0.5 ? randInt(10, 200) : null,
          },
        });
      }
    }
  }
  // Batch insert (Supabase handles up to ~1000 rows per call well)
  const BATCH = 200;
  for (let i = 0; i < behaviourEvents.length; i += BATCH) {
    const batch = behaviourEvents.slice(i, i + BATCH);
    const { error } = await supabase.from("user_behaviour_events").insert(batch);
    if (error) throw error;
  }
  console.log(`  Inserted ${behaviourEvents.length} behaviour events`);

  // 4. Network events
  const networkEvents: any[] = [];
  for (let day = 13; day >= 0; day--) {
    for (const assetId of assetIds) {
      const count = randInt(3, 8);
      for (let e = 0; e < count; e++) {
        const eventTime = new Date(daysAgoMs(day) + randInt(0, 23) * 3600000 + randInt(0, 3599999));
        networkEvents.push({
          asset_id: assetId,
          event_type: NORMAL_NETWORK_TYPES[randInt(0, NORMAL_NETWORK_TYPES.length - 1)],
          event_time: eventTime.toISOString(),
          metadata: {
            protocol: Math.random() > 0.5 ? "tcp" : "smb",
          },
        });
      }
    }
  }
  for (let i = 0; i < networkEvents.length; i += BATCH) {
    const batch = networkEvents.slice(i, i + BATCH);
    const { error } = await supabase.from("network_events").insert(batch);
    if (error) throw error;
  }
  console.log(`  Inserted ${networkEvents.length} network events`);

  // 5. Storyline alerts + incidents (3 critical storylines)
  const STORYLINE_USERS = [userIds[0], userIds[1], userIds[5]];
  const STORY_TITLES = [
    "Data Exfiltration Indicators — Unusual Outbound Transfer Volume",
    "Credential Abuse Pattern — Multiple Auth Failures + Privilege Access",
    "Lateral Movement Detected — Anomalous Internal Network Communications",
  ];
  const STORY_SUMMARIES = [
    "Critical risk: Pattern matches known lateral movement technique. Multiple compromised service accounts detected. Immediate containment recommended.",
    "High-confidence alert: Data staging and exfiltration pattern. Large outbound transfers to external destination detected.",
    "Elevated risk: Credential abuse pattern with multiple auth failures followed by privileged access.",
  ];

  for (let s = 0; s < 3; s++) {
    const score = s === 0 ? 85 : s === 1 ? 78 : 72;
    const riskLevel = score >= 80 ? "CRITICAL" : "HIGH";

    // Risk score
    const { data: rs, error: rsErr } = await supabase
      .from("risk_scores")
      .insert({
        synthetic_user_id: STORYLINE_USERS[s],
        score,
        risk_level: riskLevel,
        computed_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (rsErr) throw rsErr;

    // AI analysis
    await supabase.from("ai_analysis").insert({
      risk_score_id: rs.id,
      raw_response: { risk_level: riskLevel, risk_score: score, summary: STORY_SUMMARIES[s] },
      confidence: randInt(80, 98),
    });

    // Alert
    const { data: alert, error: alertErr } = await supabase
      .from("alerts")
      .insert({
        risk_score_id: rs.id,
        severity: riskLevel,
        status: "new",
      })
      .select("id")
      .single();
    if (alertErr) throw alertErr;

    // Incident
    await supabase.from("incidents").insert({
      alert_id: alert.id,
      assigned_to: null,
      status: s === 0 ? "investigating" : "open",
    });
  }
  console.log("  Inserted 3 storyline alerts + incidents");

  // 6. Additional normal alerts
  const severities = ["LOW", "LOW", "MEDIUM", "MEDIUM", "HIGH"];
  for (let i = 0; i < 10; i++) {
    const sev = severities[i % severities.length];
    const score = sev === "HIGH" ? randInt(55, 79) : sev === "MEDIUM" ? randInt(30, 54) : randInt(5, 29);
    const userId = userIds[randInt(0, userIds.length - 1)];

    const { data: rs } = await supabase
      .from("risk_scores")
      .insert({
        synthetic_user_id: userId,
        score,
        risk_level: sev,
        computed_at: new Date(daysAgoMs(randInt(0, 13))).toISOString(),
      })
      .select("id")
      .single();

    if (rs) {
      const { data: alert } = await supabase
        .from("alerts")
        .insert({
          risk_score_id: rs.id,
          severity: sev,
          status: i < 4 ? "new" : "acknowledged",
        })
        .select("id")
        .single();

      if (alert) {
        await supabase.from("incidents").insert({
          alert_id: alert.id,
          status: i < 3 ? "open" : "resolved",
        });
      }
    }
  }
  console.log("  Inserted 10 normal alerts + incidents");

  // 7. Audit log
  await supabase.from("audit_log").insert({
    action: "data_seed_complete",
    target_table: null,
    details: { users: SYNTHETIC_USERS.length, assets: ASSETS.length, storylines: 3 },
  });

  console.log("\n✓ Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
