import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, label, value, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-xl border border-border bg-card px-4 py-3 text-center", className)} {...props}>
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="text-2xl font-display font-bold mt-0.5 text-foreground">{value}</p>
    </div>
  ),
);
StatCard.displayName = "StatCard";

export { StatCard };
