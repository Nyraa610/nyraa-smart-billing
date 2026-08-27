import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Client } from "@/hooks/useSupabaseClients";
import { Quote, QuoteItem, QuoteStatus } from "@/hooks/useSupabaseQuotes";
import { CompanyInfo } from "@/hooks/useSupabaseCompanyInfo";

interface QuoteFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (quote: {
    client_id: string | null;
    quote_number: string;
    issue_date: string;
    valid_until: string;
    items: QuoteItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: QuoteStatus;
    notes: string | null;
  }) => void;
  onUpdate?: (id: string, quote: Partial<Quote>) => Promise<boolean>;
  clients: Client[];
  companyInfo: CompanyInfo;
  editQuote?: Quote | null;
}

export function QuoteForm({ open, onClose, onSave, onUpdate, clients, companyInfo, editQuote }: QuoteFormProps) {
  const [clientId, setClientId] = useState<string>("");
  const [quoteNumber, setQuoteNumber] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);

  const isEditMode = !!editQuote;

  const resetForm = () => {
    setClientId("");
    setNotes("");
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    setQuoteNumber(`${companyInfo.quote_prefix}${Date.now().toString().slice(-6)}`);
    const d = new Date();
    d.setDate(d.getDate() + (companyInfo.payment_delay || 30));
    setValidUntil(d.toISOString().split('T')[0]);
  };

  useEffect(() => {
    if (editQuote) {
      setClientId(editQuote.client_id || "");
      setQuoteNumber(editQuote.quote_number);
      setValidUntil(editQuote.valid_until);
      setNotes(editQuote.notes || "");
      setItems(editQuote.items.length > 0 ? editQuote.items : [{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editQuote, open]);

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const removeItem = (i: number) => items.length > 1 && setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity' || field === 'unitPrice') {
      const numValue = Number(value) || 0;
      newItems[index] = { ...newItems[index], [field]: numValue, total: field === 'quantity' ? numValue * newItems[index].unitPrice : newItems[index].quantity * numValue };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (companyInfo.tax_rate / 100);
  const total = subtotal + tax;

  const handleSave = async () => {
    if (!clientId) { toast.error("Sélectionnez un client"); return; }
    if (items.some(item => !item.description || item.total === 0)) { toast.error("Remplissez tous les articles"); return; }

    if (isEditMode && editQuote && onUpdate) {
      const success = await onUpdate(editQuote.id, {
        client_id: clientId,
        quote_number: quoteNumber,
        valid_until: validUntil,
        items,
        subtotal,
        tax,
        total,
        notes: notes || null,
      });
      if (success) {
        toast.success('Devis modifié avec succès');
        onClose();
      }
      return;
    }

    onSave({ client_id: clientId, quote_number: quoteNumber, issue_date: new Date().toISOString().split('T')[0], valid_until: validUntil, items, subtotal, tax, total, status: 'en_attente', notes: notes || null });
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-xl font-bold">{isEditMode ? 'Modifier le Devis' : 'Nouveau Devis'}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Numéro</Label><Input value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} /></div>
            <div className="space-y-2"><Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>Valide jusqu'au</Label><Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} /></div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between"><Label className="text-base font-semibold">Prestations</Label><Button variant="outline" size="sm" onClick={addItem}><Plus size={16} className="mr-1" />Ajouter</Button></div>
            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5"><Input placeholder="Description" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} /></div>
                <div className="col-span-2"><Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} /></div>
                <div className="col-span-2"><Input type="number" min="0" value={item.unitPrice || ''} onChange={(e) => updateItem(index, 'unitPrice', e.target.value)} /></div>
                <div className="col-span-2 text-right font-semibold text-sm">{item.total.toFixed(2)} €</div>
                <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}><Trash2 size={16} className="text-destructive" /></Button></div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Description / Notes (affichées sous les prestations)</Label>
            <Textarea placeholder="Ex: Acompte de 30% à la commande, délais de livraison, conditions particulières..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
          </div>

          <div className="border-t pt-4 space-y-1 text-right">
            <p className="text-muted-foreground">Sous-total HT: {subtotal.toFixed(2)} €</p>
            <p className="text-muted-foreground">TVA ({companyInfo.tax_rate}%): {tax.toFixed(2)} €</p>
            <p className="text-lg font-bold text-secondary">Total TTC: {total.toFixed(2)} €</p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={handleSave} className="gradient-primary">{isEditMode ? 'Enregistrer les modifications' : 'Enregistrer'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
