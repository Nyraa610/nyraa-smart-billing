import { Invoice } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RecentInvoicesProps {
  invoices: Invoice[];
}

const statusConfig = {
  draft: { label: "Brouillon", variant: "secondary" as const },
  sent: { label: "Envoyée", variant: "default" as const },
  paid: { label: "Payée", variant: "success" as const },
  overdue: { label: "En retard", variant: "destructive" as const },
};

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  return (
    <div className="bg-card rounded-2xl border shadow-sm p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-card-foreground">Factures récentes</h3>
        <a href="/invoices" className="text-sm text-primary hover:underline font-medium">
          Voir tout
        </a>
      </div>
      
      <div className="space-y-4">
        {invoices.map((invoice, index) => (
          <div 
            key={invoice.id} 
            className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            style={{ animationDelay: `${300 + index * 50}ms` }}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">
                  {invoice.client.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-card-foreground">{invoice.client.name}</p>
                <p className="text-sm text-muted-foreground">Facture #{invoice.number}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className="font-semibold text-card-foreground">
                {invoice.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              <Badge 
                variant={statusConfig[invoice.status].variant}
                className={cn(
                  "font-medium",
                  invoice.status === "paid" && "bg-success/10 text-success border-success/20",
                  invoice.status === "overdue" && "bg-destructive/10 text-destructive border-destructive/20"
                )}
              >
                {statusConfig[invoice.status].label}
              </Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
