import { cn } from "@/lib/utils";

interface RiskGaugeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RiskGauge({ score, label = "Risk Score", size = "md", className }: RiskGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));

  // Color based on score
  let color: string;
  let colorClass: string;
  if (clampedScore >= 80) {
    color = "var(--color-severity-critical)";
    colorClass = "text-[var(--color-severity-critical)]";
  } else if (clampedScore >= 60) {
    color = "var(--color-severity-high)";
    colorClass = "text-[var(--color-severity-high)]";
  } else if (clampedScore >= 35) {
    color = "var(--color-severity-medium)";
    colorClass = "text-[var(--color-severity-medium)]";
  } else {
    color = "var(--color-severity-low)";
    colorClass = "text-[var(--color-severity-low)]";
  }

  // SVG arc for the gauge
  const sizes = { sm: 100, md: 140, lg: 180 };
  const strokeW = { sm: 6, md: 8, lg: 10 };
  const r = sizes[size] / 2 - strokeW[size] * 2;
  const circumference = Math.PI * r; // half circle
  const offset = circumference - (clampedScore / 100) * circumference;
  const svgSize = sizes[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: svgSize, height: svgSize * 0.6 }}>
        <svg
          width={svgSize}
          height={svgSize * 0.6}
          viewBox={`0 0 ${svgSize} ${svgSize * 0.6}`}
          className="block"
        >
          {/* Background arc */}
          <path
            d={`M ${strokeW[size]} ${svgSize * 0.55} A ${r} ${r} 0 0 1 ${svgSize - strokeW[size]} ${svgSize * 0.55}`}
            fill="none"
            stroke="oklch(1 0 0 / 8%)"
            strokeWidth={strokeW[size]}
            strokeLinecap="round"
          />
          {/* Score arc */}
          <path
            d={`M ${strokeW[size]} ${svgSize * 0.55} A ${r} ${r} 0 0 1 ${svgSize - strokeW[size]} ${svgSize * 0.55}`}
            fill="none"
            stroke={color}
            strokeWidth={strokeW[size]}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        {/* Score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-end">
          <span className={cn("font-bold tabular-nums", colorClass, {
            "text-2xl": size === "sm",
            "text-4xl": size === "md",
            "text-5xl": size === "lg",
          })}>
            {clampedScore}
          </span>
        </div>
      </div>
      <span className="mt-1 text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  );
}
