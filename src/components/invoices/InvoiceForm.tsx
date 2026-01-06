import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Client } from "@/hooks/useSupabaseClients";
import { Invoice, InvoiceItem, InvoiceStatus } from "@/hooks/useSupabaseInvoices";
import { CompanyInfo } from "@/hooks/useSupabaseCompanyInfo";

interface InvoiceFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (invoice: {
    client_id: string | null;
    invoice_number: string;
    title: string | null;
    issue_date: string;
    due_date: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    status: InvoiceStatus;
    notes: string | null;
  }) => void;
  onUpdate?: (id: string, invoice: Partial<Invoice>) => Promise<boolean>;
  clients: Client[];
  companyInfo: CompanyInfo;
  editInvoice?: Invoice | null;
}

export function InvoiceForm({ open, onClose, onSave, onUpdate, clients, companyInfo, editInvoice }: InvoiceFormProps) {
  const [clientId, setClientId] = useState<string>("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);

  const isEditMode = !!editInvoice;

  useEffect(() => {
    if (editInvoice) {
      setClientId(editInvoice.client_id || "");
      setInvoiceNumber(editInvoice.invoice_number);
      setTitle(editInvoice.title || "");
      setDueDate(editInvoice.due_date);
      setItems(editInvoice.items.length > 0 ? editInvoice.items : [{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    } else {
      resetForm();
    }
  }, [editInvoice, open]);

  const resetForm = () => {
    setClientId("");
    setTitle("");
    setItems([{ description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    setInvoiceNumber(`${companyInfo.invoice_prefix}${Date.now().toString().slice(-6)}`);
    const d = new Date();
    d.setDate(d.getDate() + (companyInfo.payment_delay || 30));
    setDueDate(d.toISOString().split('T')[0]);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'quantity' || field === 'unitPrice') {
      const numValue = Number(value) || 0;
      newItems[index] = {
        ...newItems[index],
        [field]: numValue,
        total: field === 'quantity' ? numValue * newItems[index].unitPrice : newItems[index].quantity * numValue
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * (companyInfo.tax_rate / 100);
  const total = subtotal + tax;

  const handleSave = async () => {
    if (!clientId) {
      toast.error("Veuillez sélectionner un client");
      return;
    }

    if (items.some(item => !item.description || item.total === 0)) {
      toast.error("Veuillez remplir tous les articles");
      return;
    }

    if (isEditMode && editInvoice && onUpdate) {
      const success = await onUpdate(editInvoice.id, {
        client_id: clientId,
        invoice_number: invoiceNumber,
        title: title || null,
        due_date: dueDate,
        items,
        subtotal,
        tax,
        total,
      });
      if (success) {
        toast.success('Facture modifiée avec succès');
        onClose();
      }
    } else {
      onSave({
        client_id: clientId,
        invoice_number: invoiceNumber,
        title: title || null,
        issue_date: new Date().toISOString().split('T')[0],
        due_date: dueDate,
        items,
        subtotal,
        tax,
        total,
        status: 'non_reglee',
        notes: null,
      });
      resetForm();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditMode ? 'Modifier la Facture' : 'Nouvelle Facture'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Numéro</Label>
              <Input value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Objet / Titre de la facture</Label>
              <Input 
                placeholder="Ex: Prestation de développement web" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Échéance</Label>
              <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Prestations</Label>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus size={16} className="mr-1" />Ajouter
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-5">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qté"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Prix"
                    min="0"
                    value={item.unitPrice || ''}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                  />
                </div>
                <div className="col-span-2 text-right font-semibold text-sm">
                  {item.total.toFixed(2)} €
                </div>
                <div className="col-span-1">
                  <Button variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}>
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4 space-y-1 text-right">
            <p className="text-muted-foreground">Sous-total HT: {subtotal.toFixed(2)} €</p>
            <p className="text-muted-foreground">TVA ({companyInfo.tax_rate}%): {tax.toFixed(2)} €</p>
            <p className="text-lg font-bold text-primary">Total TTC: {total.toFixed(2)} €</p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={handleSave} className="gradient-primary">
              {isEditMode ? 'Enregistrer les modifications' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}