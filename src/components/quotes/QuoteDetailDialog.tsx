import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Quote } from "@/types";
import { Download, Mail, Printer, FileCheck } from "lucide-react";
import { generateQuotePDF } from "@/utils/pdfGenerator";

interface QuoteDetailDialogProps {
  quote: Quote | null;
  open: boolean;
  onClose: () => void;
}

const statusConfig = {
  draft: { label: "Brouillon", variant: "secondary" as const },
  sent: { label: "Envoyé", variant: "default" as const },
  accepted: { label: "Accepté", variant: "success" as const },
  rejected: { label: "Refusé", variant: "destructive" as const },
};

export function QuoteDetailDialog({ quote, open, onClose }: QuoteDetailDialogProps) {
  if (!quote) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold">
              Devis {quote.number}
            </DialogTitle>
            <Badge variant={statusConfig[quote.status].variant}>
              {statusConfig[quote.status].label}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* En-tête avec infos */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Client</p>
              <p className="font-semibold">{quote.client.name}</p>
              <p className="text-sm text-muted-foreground">{quote.client.email}</p>
              <p className="text-sm text-muted-foreground">{quote.client.address}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-muted-foreground">Date d'émission</p>
              <p className="font-semibold">{quote.createdAt.toLocaleDateString('fr-FR')}</p>
              <p className="text-sm text-muted-foreground mt-2">Valide jusqu'au</p>
              <p className="font-semibold">{quote.validUntil.toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          {/* Tableau des articles */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">Description</th>
                  <th className="text-center p-3 font-semibold">Qté</th>
                  <th className="text-right p-3 font-semibold">Prix unitaire</th>
                  <th className="text-right p-3 font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {quote.items.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3">{item.description}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">{item.unitPrice.toLocaleString('fr-FR')} €</td>
                    <td className="p-3 text-right font-semibold">{item.total.toLocaleString('fr-FR')} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totaux */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total HT</span>
                <span>{quote.subtotal.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TVA (20%)</span>
                <span>{quote.tax.toLocaleString('fr-FR')} €</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total TTC</span>
                <span className="text-secondary">{quote.total.toLocaleString('fr-FR')} €</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline">
              <FileCheck size={18} />
              Convertir en facture
            </Button>
            <Button variant="outline">
              <Mail size={18} />
              Envoyer par email
            </Button>
            <Button variant="outline">
              <Printer size={18} />
              Imprimer
            </Button>
            <Button variant="gradient" onClick={() => generateQuotePDF(quote)}>
              <Download size={18} />
              Télécharger PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
