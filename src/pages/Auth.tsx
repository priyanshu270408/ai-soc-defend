import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Loader2, Mail, Lock, ArrowRight, UserPlus } from "lucide-react";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) {
    return returnTo;
  }
  return fallback;
}

// Demo quick-login buttons for different roles
function DemoLoginButtons({ onDemoLogin }: { onDemoLogin: (email: string) => void }) {
  return (
    <div className="mt-4 space-y-2">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Quick Demo Access</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { role: "Analyst", email: "analyst@demo.local", color: "oklch(0.72 0.15 185)" },
          { role: "Officer", email: "officer@demo.local", color: "oklch(0.72 0.16 55)" },
          { role: "Command", email: "command@demo.local", color: "oklch(0.70 0.14 220)" },
          { role: "Admin", email: "admin@demo.local", color: "oklch(0.62 0.22 25)" },
        ].map((d) => (
          <button
            key={d.role}
            type="button"
            onClick={() => onDemoLogin(d.email)}
            className="flex items-center gap-2 rounded-lg border border-border/50 bg-accent/30 px-3 py-2 text-left hover:bg-accent/60 transition-colors"
          >
            <div className="size-2 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-xs font-medium text-foreground">{d.role}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(
    searchParams.get("returnTo"),
    props.redirectAfterAuth
  );
  const { signIn, signUp } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setSuccess("Check your email for a verification link.");
      } else {
        await signIn(email, password);
        navigate(redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Demo login: try sign in first, if user doesn't exist, sign up
      try {
        await signIn(demoEmail, "DemoPassword123!");
      } catch {
        await signUp(demoEmail, "DemoPassword123!");
        await signIn(demoEmail, "DemoPassword123!");
      }
      navigate(redirect);
    } catch (err) {
      setError("Demo login failed. Supabase may not be configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(oklch(1 0 0 / 30%) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 30%) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/15">
              <ShieldCheck className="size-5 text-primary" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-foreground">AI Kavach</span>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">SOC Console</p>
            </div>
          </div>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg">
              {isSignUp ? "Create Account" : "Sign In"}
            </CardTitle>
            <CardDescription className="text-xs">
              {isSignUp
                ? "Create an account to access the SOC console"
                : "Enter your credentials to access the security dashboard"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  className="pl-9 h-9 text-sm bg-background/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  className="pl-9 h-9 text-sm bg-background/50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-500/10 rounded-md px-3 py-2">{error}</p>
              )}
              {success && (
                <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-md px-3 py-2">{success}</p>
              )}

              <Button
                type="submit"
                className="w-full h-9 text-sm"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="size-4 animate-spin mr-2" />
                ) : isSignUp ? (
                  <UserPlus className="size-4 mr-2" />
                ) : (
                  <ArrowRight className="size-4 mr-2" />
                )}
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>

            {/* Demo buttons */}
            <DemoLoginButtons onDemoLogin={handleDemoLogin} />
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
          AI Kavach SOC · All data is synthetic
        </p>
      </div>
    </div>
  );
}
