import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning";
  delay?: number;
}

export function StatCard({ title, value, change, icon: Icon, variant = "default", delay = 0 }: StatCardProps) {
  const variants = {
    default: "bg-card",
    primary: "gradient-primary text-primary-foreground",
    success: "bg-success/10 border-success/20",
    warning: "bg-warning/10 border-warning/20",
  };

  const iconVariants = {
    default: "bg-muted text-muted-foreground",
    primary: "bg-primary-foreground/20 text-primary-foreground",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
  };

  return (
    <div 
      className={cn(
        "rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up",
        variants[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn(
            "text-sm font-medium mb-1",
            variant === "primary" ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-bold tracking-tight",
            variant === "primary" ? "text-primary-foreground" : "text-card-foreground"
          )}>
            {value}
          </p>
          {change !== undefined && (
            <p className={cn(
              "text-sm mt-2 font-medium",
              change >= 0 
                ? "text-success" 
                : "text-destructive"
            )}>
              {change >= 0 ? "+" : ""}{change}% ce mois
            </p>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-xl",
          iconVariants[variant]
        )}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
