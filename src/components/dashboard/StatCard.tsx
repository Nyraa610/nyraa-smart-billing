import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning";
  delay?: number;
}

export function StatCard({ title, value, change, icon: Icon, variant = "default", delay = 0 }: StatCardProps) {
  const variants = {
    default: "glass-card",
    primary: "gradient-primary shadow-glow-sm",
    success: "glass-card border-success/30",
    warning: "glass-card border-warning/30",
  };

  const iconVariants = {
    default: "bg-muted text-primary",
    primary: "bg-white/20 text-primary-foreground",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
  };

  const textVariants = {
    default: "text-foreground",
    primary: "text-primary-foreground",
    success: "text-foreground",
    warning: "text-foreground",
  };

  const subtitleVariants = {
    default: "text-muted-foreground",
    primary: "text-primary-foreground/80",
    success: "text-muted-foreground",
    warning: "text-muted-foreground",
  };

  return (
    <div 
      className={`${variants[variant]} rounded-2xl p-4 md:p-6 animate-slide-up transition-all duration-300 hover:scale-[1.02]`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={`text-xs md:text-sm font-medium ${subtitleVariants[variant]}`}>{title}</p>
          <p className={`text-xl md:text-3xl font-bold ${textVariants[variant]}`}>{value}</p>
          {change && (
            <p className={`text-xs md:text-sm ${change.startsWith('+') ? 'text-success' : 'text-destructive'}`}>
              {change} vs mois dernier
            </p>
          )}
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${iconVariants[variant]} flex items-center justify-center`}>
          <Icon size={20} className="md:w-6 md:h-6" />
        </div>
      </div>
    </div>
  );
}
