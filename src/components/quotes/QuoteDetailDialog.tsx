import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, Download, Languages, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getDailyRate } from "@/utils/exchangeRate";
import { Quote, QuoteStatus } from "@/hooks/useSupabaseQuotes";
import { CompanyInfo } from "@/hooks/useSupabaseCompanyInfo";
import { generateQuotePDF } from "@/utils/pdfGenerator";

interface QuoteDetailDialogProps {
  quote: Quote | null;
  open: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: QuoteStatus) => void;
  companyInfo?: CompanyInfo;
}

const statusConfig: Record<QuoteStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  en_attente: { label: "En attente", variant: "secondary" },
  accepte: { label: "Accepté", variant: "default" },
  refuse: { label: "Refusé", variant: "destructive" },
  expire: { label: "Expiré", variant: "outline" },
};

export function QuoteDetailDialog({ quote, open, onClose, onStatusChange, companyInfo }: QuoteDetailDialogProps) {
  const [converting, setConverting] = useState(false);

  if (!quote) return null;

  const handleDownloadPDF = () => {
    if (companyInfo) {
      generateQuotePDF(quote, companyInfo);
    }
  };

  const handleDownloadUsdPDF = async () => {
    if (!companyInfo) return;
    setConverting(true);
    try {
      const { rate, date } = await getDailyRate('USD');
      generateQuotePDF(quote, companyInfo, { lang: 'en', currency: 'USD', rate, rateDate: date });
      toast.success(`Devis converti en anglais (1 EUR = ${rate.toFixed(4)} USD)`);
    } catch (e) {
      toast.error("Taux de change indisponible, réessayez plus tard");
    } finally {
      setConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">Devis {quote.quote_number}</DialogTitle>
            <Badge variant={statusConfig[quote.status].variant}>{statusConfig[quote.status].label}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-semibold">{quote.client?.name || 'Client'}</p>
              <p className="text-sm text-muted-foreground">{quote.client?.email}</p>
              <p className="text-sm text-muted-foreground">{quote.client?.address}{quote.client?.postal_code && `, ${quote.client.postal_code}`}{quote.client?.city && ` ${quote.client.city}`}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Date d'émission</p>
              <p className="font-semibold">{new Date(quote.issue_date).toLocaleDateString('fr-FR')}</p>
              <p className="text-sm text-muted-foreground mt-2">Valide jusqu'au</p>
              <p className="font-semibold">{new Date(quote.valid_until).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50"><tr>
                <th className="text-left p-3 font-semibold text-sm">Description</th>
                <th className="text-center p-3 font-semibold text-sm">Qté</th>
                <th className="text-right p-3 font-semibold text-sm">Prix</th>
                <th className="text-right p-3 font-semibold text-sm">Total</th>
              </tr></thead>
              <tbody>{quote.items.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3 text-sm">{item.description}{item.details && <span className="block text-xs text-muted-foreground italic mt-0.5">{item.details}</span>}</td>
                  <td className="p-3 text-center text-sm">{item.quantity}</td>
                  <td className="p-3 text-right text-sm">{item.unitPrice.toFixed(2)} €</td>
                  <td className="p-3 text-right font-semibold text-sm">{item.total.toFixed(2)} €</td>
                </tr>
              ))}</tbody>
            </table>
          </div>

          {quote.notes && (
            <div className="space-y-1">
              <p className="text-sm font-semibold">Description</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}


          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sous-total HT</span><span>{Number(quote.subtotal).toFixed(2)} €</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">TVA</span><span>{Number(quote.tax).toFixed(2)} €</span></div>
              <div className="flex justify-between text-lg font-bold border-t pt-2"><span>Total TTC</span><span className="text-secondary">{Number(quote.total).toFixed(2)} €</span></div>
            </div>
          </div>

          {onStatusChange && (
            <div className="flex gap-2 flex-wrap border-t pt-4">
              <Button size="sm" variant={quote.status === 'en_attente' ? 'default' : 'outline'} onClick={() => onStatusChange(quote.id, 'en_attente')}><Clock className="mr-1 h-4 w-4" />En attente</Button>
              <Button size="sm" variant={quote.status === 'accepte' ? 'default' : 'outline'} onClick={() => onStatusChange(quote.id, 'accepte')}><Check className="mr-1 h-4 w-4" />Accepté</Button>
              <Button size="sm" variant={quote.status === 'refuse' ? 'default' : 'outline'} onClick={() => onStatusChange(quote.id, 'refuse')}><X className="mr-1 h-4 w-4" />Refusé</Button>
            </div>
          )}

          <div className="flex flex-wrap justify-between gap-2 pt-2">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </Button>
              <Button variant="outline" onClick={handleDownloadUsdPDF} disabled={converting}>
                {converting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Languages className="mr-2 h-4 w-4" />}
                PDF en anglais ($)
              </Button>
            </div>
            <Button variant="outline" onClick={onClose}>Fermer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
