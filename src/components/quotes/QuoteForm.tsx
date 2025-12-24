import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { mockClients } from "@/data/mockData";
import { Client, Quote, InvoiceItem } from "@/types";
import { Plus, Trash2, FileText } from "lucide-react";
import { generateQuotePDF } from "@/utils/pdfGenerator";
import { toast } from "@/hooks/use-toast";

interface QuoteFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (quote: Quote) => void;
}

export function QuoteForm({ open, onClose, onSave }: QuoteFormProps) {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [quoteNumber, setQuoteNumber] = useState(`DEV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);
  const [validUntil, setValidUntil] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  });

  const addItem = () => {
    setItems([
      ...items,
      { id: String(items.length + 1), description: "", quantity: 1, unitPrice: 0, total: 0 }
    ]);
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
        total: field === 'quantity' 
          ? numValue * newItems[index].unitPrice 
          : newItems[index].quantity * numValue
      };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  const handleSave = () => {
    if (!selectedClient) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive"
      });
      return;
    }

    if (items.some(item => !item.description || item.total === 0)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les articles",
        variant: "destructive"
      });
      return;
    }

    const quote: Quote = {
      id: String(Date.now()),
      number: quoteNumber,
      client: selectedClient,
      items,
      subtotal,
      tax,
      total,
      status: "draft",
      createdAt: new Date(),
      validUntil: new Date(validUntil)
    };

    onSave(quote);
    toast({
      title: "Devis créé",
      description: `Le devis ${quoteNumber} a été créé avec succès`,
    });
    resetForm();
    onClose();
  };

  const handleGeneratePDF = () => {
    if (!selectedClient) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un client",
        variant: "destructive"
      });
      return;
    }

    const quote: Quote = {
      id: String(Date.now()),
      number: quoteNumber,
      client: selectedClient,
      items,
      subtotal,
      tax,
      total,
      status: "draft",
      createdAt: new Date(),
      validUntil: new Date(validUntil)
    };

    generateQuotePDF(quote);
    toast({
      title: "PDF généré",
      description: "Le devis a été téléchargé",
    });
  };

  const resetForm = () => {
    setSelectedClient(null);
    setItems([{ id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 }]);
    setQuoteNumber(`DEV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Nouveau Devis</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Numéro de devis</Label>
              <Input 
                value={quoteNumber} 
                onChange={(e) => setQuoteNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Client</Label>
              <Select onValueChange={(value) => setSelectedClient(mockClients.find(c => c.id === value) || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  {mockClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valide jusqu'au</Label>
              <Input 
                type="date" 
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
            </div>
          </div>

          {/* Client sélectionné */}
          {selectedClient && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="font-semibold">{selectedClient.name}</p>
              <p className="text-sm text-muted-foreground">{selectedClient.email}</p>
              <p className="text-sm text-muted-foreground">{selectedClient.address}</p>
            </div>
          )}

          {/* Articles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Articles</Label>
              <Button variant="outline" size="sm" onClick={addItem}>
                <Plus size={16} />
                Ajouter une ligne
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
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
                      placeholder="Prix HT"
                      min="0"
                      value={item.unitPrice || ''}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 text-right font-semibold">
                    {item.total.toLocaleString('fr-FR')} €
                  </div>
                  <div className="col-span-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totaux */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Sous-total HT</span>
              <span>{subtotal.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>TVA (20%)</span>
              <span>{tax.toLocaleString('fr-FR')} €</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-secondary">
              <span>Total TTC</span>
              <span>{total.toLocaleString('fr-FR')} €</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button variant="outline" onClick={handleGeneratePDF}>
              <FileText size={18} />
              Prévisualiser PDF
            </Button>
            <Button variant="gradient" onClick={handleSave}>
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
