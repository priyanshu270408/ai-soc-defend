import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Loader2, Mail, ArrowRight, ArrowLeft, KeyRound, UserPlus } from "lucide-react";

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

// 6-digit OTP input with auto-focus and auto-submit
function OtpInput({ onComplete, disabled }: { onComplete: (code: string) => void; disabled?: boolean }) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;

      const newDigits = [...digits];
      newDigits[index] = value.slice(-1); // take last digit only
      setDigits(newDigits);

      // Auto-advance to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when all 6 digits entered
      if (value && index === 5) {
        const code = newDigits.join("");
        if (code.length === 6) {
          onComplete(code);
        }
      }
    },
    [digits, onComplete]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (pasted.length === 0) return;

      const newDigits = [...digits];
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);

      // Focus the next empty or the last filled
      const nextEmpty = newDigits.findIndex((d) => !d);
      const focusIndex = nextEmpty === -1 ? 5 : nextEmpty;
      inputRefs.current[focusIndex]?.focus();

      // Auto-submit if 6 digits pasted
      if (pasted.length === 6) {
        onComplete(pasted);
      }
    },
    [digits, onComplete]
  );

  return (
    <div className="flex justify-center gap-2">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className="size-11 text-center text-lg font-mono font-bold bg-background/50 border border-border/60 rounded-lg
            focus:border-primary focus:ring-1 focus:ring-primary/30 outline-none transition-all
            disabled:opacity-50 disabled:cursor-not-allowed"
          autoComplete="one-time-code"
        />
      ))}
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
  const { signInDemo } = useAuth();
  const { signIn } = useAuthActions();

  // Flow state: "email" → "otp" → "done"
  const [step, setStep] = useState<"email" | "otp">("email");
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await signIn("email-otp", { email });
      if (!result.signingIn) {
        // OTP was sent successfully — move to OTP step
        setStep("otp");
        setOtpSent(true);
        setCountdown(60);
        setSuccess(`OTP sent to ${email}. Check your inbox.`);
      } else {
        // Immediately signed in (shouldn't happen with email-otp)
        navigate(redirect);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (code: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("email-otp", { email, code });
      if (result.signingIn) {
        setSuccess("Verification successful! Redirecting...");
        // Small delay to show success message
        setTimeout(() => navigate(redirect), 500);
      } else {
        setError("Invalid OTP. Please check the code and try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (countdown > 0) return;

    setIsLoading(true);
    setError(null);

    try {
      await signIn("email-otp", { email });
      setCountdown(60);
      setSuccess(`New OTP sent to ${email}.`);
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to email step
  const handleBack = () => {
    setStep("email");
    setError(null);
    setSuccess(null);
    setOtpSent(false);
  };

  // Demo login
  const handleDemoLogin = async (demoEmail: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await signInDemo(demoEmail);
      navigate(redirect);
    } catch (err) {
      setError("Demo login failed. Please try again.");
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
              {step === "otp" ? "Verify OTP" : isSignUp ? "Create Account" : "Sign In"}
            </CardTitle>
            <CardDescription className="text-xs">
              {step === "otp"
                ? `Enter the 6-digit code sent to ${email}`
                : isSignUp
                  ? "Create an account to access the SOC console"
                  : "Enter your email to receive a one-time password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" ? (
              /* ---- Step 1: Email input ---- */
              <form onSubmit={handleSendOtp} className="space-y-3">
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
                    autoFocus
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
                  ) : (
                    <KeyRound className="size-4 mr-2" />
                  )}
                  {isSignUp ? "Send Verification Code" : "Send OTP"}
                </Button>
              </form>
            ) : (
              /* ---- Step 2: OTP verification ---- */
              <div className="space-y-4">
                <OtpInput onComplete={handleVerifyOtp} disabled={isLoading} />

                {error && (
                  <p className="text-xs text-red-400 bg-red-500/10 rounded-md px-3 py-2">{error}</p>
                )}
                {success && (
                  <p className="text-xs text-emerald-400 bg-emerald-500/10 rounded-md px-3 py-2">{success}</p>
                )}

                {isLoading && (
                  <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    Verifying...
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft className="size-3" />
                    Change email
                  </button>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0}
                    className="text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(null); setSuccess(null); setStep("email"); }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>

            {/* Demo buttons */}
            {step === "email" && <DemoLoginButtons onDemoLogin={handleDemoLogin} />}
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-[11px] text-muted-foreground/60">
          AI Kavach SOC · All data is synthetic
        </p>
      </div>
    </div>
  );
}
