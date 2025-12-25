import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Invoice, InvoiceStatus } from "@/hooks/useSupabaseInvoices";
import { CompanyInfo } from "@/hooks/useSupabaseCompanyInfo";
import { generateInvoicePDF } from "@/utils/pdfGenerator";

interface InvoiceDetailDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: InvoiceStatus) => void;
  companyInfo?: CompanyInfo;
}

const statusConfig: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  non_reglee: { label: "Non réglée", variant: "destructive" },
  reglement_en_cours: { label: "Règlement en cours", variant: "secondary" },
  reglee: { label: "Payée", variant: "default" },
};

export function InvoiceDetailDialog({ invoice, open, onClose, onStatusChange, companyInfo }: InvoiceDetailDialogProps) {
  if (!invoice) return null;

  const handleDownloadPDF = () => {
    if (companyInfo) {
      generateInvoicePDF(invoice, companyInfo);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              Facture {invoice.invoice_number}
            </DialogTitle>
            <Badge variant={statusConfig[invoice.status].variant}>
              {statusConfig[invoice.status].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Client info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-semibold">{invoice.client?.name || 'Client inconnu'}</p>
              <p className="text-sm text-muted-foreground">{invoice.client?.email}</p>
              <p className="text-sm text-muted-foreground">
                {invoice.client?.address}
                {invoice.client?.postal_code && `, ${invoice.client.postal_code}`}
                {invoice.client?.city && ` ${invoice.client.city}`}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Date d'émission</p>
              <p className="font-semibold">{new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</p>
              <p className="text-sm text-muted-foreground mt-2">Date d'échéance</p>
              <p className="font-semibold">{new Date(invoice.due_date).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          {/* Items table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold text-sm">Description</th>
                  <th className="text-center p-3 font-semibold text-sm">Qté</th>
                  <th className="text-right p-3 font-semibold text-sm">Prix unitaire</th>
                  <th className="text-right p-3 font-semibold text-sm">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-3 text-sm">{item.description}</td>
                    <td className="p-3 text-center text-sm">{item.quantity}</td>
                    <td className="p-3 text-right text-sm">{item.unitPrice.toFixed(2)} €</td>
                    <td className="p-3 text-right font-semibold text-sm">{item.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total HT</span>
                <span>{Number(invoice.subtotal).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA</span>
                <span>{Number(invoice.tax).toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total TTC</span>
                <span className="text-primary">{Number(invoice.total).toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Status change buttons */}
          {onStatusChange && (
            <div className="flex gap-2 flex-wrap border-t pt-4">
              <Button 
                size="sm" 
                variant={invoice.status === 'non_reglee' ? 'default' : 'outline'}
                onClick={() => onStatusChange(invoice.id, 'non_reglee')}
              >
                <AlertCircle className="mr-1 h-4 w-4" />
                Non réglée
              </Button>
              <Button 
                size="sm" 
                variant={invoice.status === 'reglement_en_cours' ? 'default' : 'outline'}
                onClick={() => onStatusChange(invoice.id, 'reglement_en_cours')}
              >
                <Clock className="mr-1 h-4 w-4" />
                En cours
              </Button>
              <Button 
                size="sm" 
                variant={invoice.status === 'reglee' ? 'default' : 'outline'}
                onClick={() => onStatusChange(invoice.id, 'reglee')}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Payée
              </Button>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={handleDownloadPDF}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger PDF
            </Button>
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
