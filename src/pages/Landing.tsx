import { motion } from "framer-motion";
import {
  ShieldCheck,
  Shield,
  Brain,
  Eye,
  Activity,
  AlertTriangle,
  Server,
  Users,
  ArrowRight,
  Lock,
  Zap,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    desc: "Grok-powered threat intelligence with contextual explanations and confidence scoring.",
  },
  {
    icon: Eye,
    title: "Real-Time Monitoring",
    desc: "Continuous synthetic event ingestion with behavioral anomaly detection.",
  },
  {
    icon: Target,
    title: "Incident Correlation",
    desc: "Automated incident grouping from correlated alert chains and attack patterns.",
  },
  {
    icon: Users,
    title: "User Behaviour Analytics",
    desc: "Per-user login patterns, privilege usage, and data transfer anomaly detection.",
  },
  {
    icon: Server,
    title: "Network Intelligence",
    desc: "Asset-level traffic analysis, connection anomalies, and authentication monitoring.",
  },
  {
    icon: Lock,
    title: "Role-Based Access",
    desc: "Analyst, officer, command, and admin roles with granular SOC UI permissions.",
  },
];

const STATS = [
  { value: "0.3s", label: "Avg. Detection Time" },
  { value: "99.7%", label: "Synthetic Coverage" },
  { value: "24/7", label: "Monitoring Mode" },
  { value: "50+", label: "Alert Types" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/15">
              <ShieldCheck className="size-4.5 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight">AI Kavach</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/auth")}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Launch SOC <ArrowRight className="size-3.5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-24 pb-16 lg:pt-32 lg:pb-24">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(oklch(1 0 0 / 30%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 30%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />

        <div className="relative mx-auto max-w-6xl px-4 lg:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Zap className="size-3" />
              DEFENSIVE CYBERSECURITY · DEMO PROTOTYPE
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Security Operations{" "}
              <span className="text-primary">Center</span>{" "}
              <br className="hidden sm:block" />
              Powered by AI
            </h1>
            <p className="mt-5 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
              AI Kavach is a next-generation SOC console that combines real-time threat monitoring,
              behavioral analytics, and AI-powered investigation to help security teams detect and
              respond to threats faster.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Access SOC Console <ArrowRight className="size-4" />
              </button>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="size-3" />
                Protected access · Role-based authentication
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {STATS.map((stat) => (
              <div key={stat.label} className="rounded-xl border border-border/50 bg-card/40 px-4 py-4 text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-6xl px-4 lg:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Complete SOC Capabilities
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              Every module is designed for high information density, clear severity coding, and
              actionable insights — with full AI integration.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group rounded-xl border border-border/50 bg-card/40 p-5 hover:border-primary/20 hover:bg-primary/5 transition-all"
              >
                <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="size-4.5" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-4 lg:px-6 text-center">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 lg:p-12">
            <Shield className="mx-auto size-10 text-primary mb-4" />
            <h2 className="text-2xl font-bold tracking-tight">Ready to Monitor?</h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              Sign in with your credentials to access the full SOC dashboard.
              All data is synthetic and for demonstration purposes only.
            </p>
            <button
              onClick={() => navigate("/auth")}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Sign In to AI Kavach <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6">
        <div className="mx-auto max-w-6xl px-4 lg:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />
            <span>AI Kavach · SOC Console</span>
          </div>
          <p className="text-[11px] text-muted-foreground/60">
            DEMO — 100% synthetic data · No offensive capabilities · Defensive hackathon prototype
          </p>
        </div>
      </footer>
    </div>
  );
}
