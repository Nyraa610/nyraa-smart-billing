import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Invoice, InvoiceStatus } from "@/hooks/useSupabaseInvoices";

interface RecentInvoicesProps {
  invoices: Invoice[];
}

const statusConfig: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  non_reglee: { label: "Non réglée", variant: "destructive" },
  reglement_en_cours: { label: "En cours", variant: "secondary" },
  reglee: { label: "Payée", variant: "default" },
};

export function RecentInvoices({ invoices }: RecentInvoicesProps) {
  if (invoices.length === 0) {
    return (
      <div className="bg-card rounded-2xl border shadow-sm p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-card-foreground">Factures récentes</h3>
          <a href="/invoices" className="text-sm text-primary hover:underline font-medium">
            Voir tout
          </a>
        </div>
        <p className="text-muted-foreground text-center py-8">Aucune facture</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border shadow-sm p-4 md:p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <h3 className="text-base md:text-lg font-semibold text-card-foreground">Factures récentes</h3>
        <a href="/invoices" className="text-sm text-primary hover:underline font-medium">
          Voir tout
        </a>
      </div>
      
      <div className="space-y-3 md:space-y-4">
        {invoices.map((invoice, index) => (
          <div 
            key={invoice.id} 
            className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
            style={{ animationDelay: `${300 + index * 50}ms` }}
          >
            <div className="flex items-center gap-3 md:gap-4 min-w-0">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg gradient-primary flex items-center justify-center flex-shrink-0">
                <span className="text-primary-foreground font-semibold text-sm">
                  {invoice.client?.name?.charAt(0) || '?'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="font-medium text-card-foreground text-sm md:text-base truncate">
                  {invoice.client?.name || 'Client inconnu'}
                </p>
                <p className="text-xs md:text-sm text-muted-foreground">#{invoice.invoice_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <p className="font-semibold text-card-foreground text-sm md:text-base">
                {Number(invoice.total).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              <Badge 
                variant={statusConfig[invoice.status].variant}
                className={cn(
                  "font-medium text-xs hidden sm:inline-flex",
                  invoice.status === "reglee" && "bg-success/10 text-success border-success/20",
                  invoice.status === "non_reglee" && "bg-destructive/10 text-destructive border-destructive/20"
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
