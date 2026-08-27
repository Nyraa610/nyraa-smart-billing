import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
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
    timeline: string | null;
    payment_terms: string | null;
    revisions: string | null;
    hosting: string | null;
    maintenance: string | null;
    support: string | null;
    features: string | null;
    show_total: boolean;
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
  const [timeline, setTimeline] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [revisions, setRevisions] = useState("");
  const [hosting, setHosting] = useState("");
  const [maintenance, setMaintenance] = useState("");
  const [support, setSupport] = useState("");
  const [features, setFeatures] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const [showTotal, setShowTotal] = useState(true);

  const isEditMode = !!editQuote;

  const resetForm = () => {
    setClientId("");
    setNotes("");
    setTimeline(""); setPaymentTerms(""); setRevisions(""); setHosting(""); setMaintenance(""); setSupport(""); setFeatures("");
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    setShowTotal(true);
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
      setTimeline(editQuote.timeline || "");
      setPaymentTerms(editQuote.payment_terms || "");
      setRevisions(editQuote.revisions || "");
      setHosting(editQuote.hosting || "");
      setMaintenance(editQuote.maintenance || "");
      setSupport(editQuote.support || "");
      setFeatures(editQuote.features || "");
      setItems(editQuote.items.length > 0 ? editQuote.items : [{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
      setShowTotal(editQuote.show_total !== false);
    } else {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editQuote, open]);

  const addItem = () => setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  const removeItem = (i: number) => items.length > 1 && setItems(items.filter((_, idx) => idx !== i));
  const moveItem = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(from, 1);
    newItems.splice(to, 0, moved);
    setItems(newItems);
  };
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

    const extra = {
      timeline: timeline || null,
      payment_terms: paymentTerms || null,
      revisions: revisions || null,
      hosting: hosting || null,
      maintenance: maintenance || null,
      support: support || null,
      features: features || null,
    };

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
        show_total: showTotal,
        ...extra,
      });
      if (success) {
        toast.success('Devis modifié avec succès');
        onClose();
      }
      return;
    }

    onSave({ client_id: clientId, quote_number: quoteNumber, issue_date: new Date().toISOString().split('T')[0], valid_until: validUntil, items, subtotal, tax, total, status: 'en_attente', notes: notes || null, show_total: showTotal, ...extra });
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
              <div key={index} className="space-y-1">
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5"><Input placeholder="Description" value={item.description} onChange={(e) => updateItem(index, 'description', e.target.value)} /></div>
                  <div className="col-span-2"><Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} /></div>
                  <div className="col-span-2"><Input type="number" min="0" value={item.unitPrice || ''} onChange={(e) => updateItem(index, 'unitPrice', e.target.value)} /></div>
                  <div className="col-span-2 text-right font-semibold text-sm">{item.total.toFixed(2)} €</div>
                  <div className="col-span-1"><Button variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}><Trash2 size={16} className="text-destructive" /></Button></div>
                </div>
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <Input placeholder="Détails (optionnel)" className="text-xs h-8 text-muted-foreground" value={item.details || ''} onChange={(e) => updateItem(index, 'details', e.target.value)} />
                  </div>
                  <div className="col-span-7 flex justify-end gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem(index, index - 1)} disabled={index === 0} aria-label="Monter la prestation"><ArrowUp size={14} /></Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => moveItem(index, index + 1)} disabled={index === items.length - 1} aria-label="Descendre la prestation"><ArrowDown size={14} /></Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="space-y-1">
              <Label className="text-base font-semibold">Conditions du projet</Label>
              <p className="text-xs text-muted-foreground">Mise en forme : <code>**gras**</code>, <code>__souligné__</code>, <code>*italique*</code></p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-sm">Timeline du projet</Label><Textarea rows={2} placeholder="Ex : 4 semaines, livraison le 30/09" value={timeline} onChange={(e) => setTimeline(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-sm">Modalités de paiement</Label><Textarea rows={2} placeholder="Ex : 40% à la commande, solde à la livraison" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-sm">Mises à jour incluses</Label><Textarea rows={2} placeholder="Ex : 3 séries de modifications" value={revisions} onChange={(e) => setRevisions(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-sm">Hébergement</Label><Textarea rows={2} placeholder="Ex : 1 an inclus puis 8 €/mois" value={hosting} onChange={(e) => setHosting(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-sm">Maintenance</Label><Textarea rows={2} placeholder="Ex : mises à jour techniques mensuelles" value={maintenance} onChange={(e) => setMaintenance(e.target.value)} /></div>
              <div className="space-y-1"><Label className="text-sm">Support technique</Label><Textarea rows={2} placeholder="Ex : support par email sous 48h" value={support} onChange={(e) => setSupport(e.target.value)} /></div>
              <div className="space-y-1 md:col-span-2"><Label className="text-sm">Fonctionnalités intégrées</Label><Textarea rows={3} placeholder="Une fonctionnalité par ligne" value={features} onChange={(e) => setFeatures(e.target.value)} /></div>
            </div>
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
