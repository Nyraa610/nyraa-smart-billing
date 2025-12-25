import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Banknote, Building2, FileText } from "lucide-react";
import { useState } from "react";

interface PaymentMethodDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (method: string) => void;
}

const paymentMethods = [
  { id: 'Virement', label: 'Virement bancaire', icon: Building2 },
  { id: 'Carte', label: 'Carte bancaire', icon: CreditCard },
  { id: 'Espèces', label: 'Espèces', icon: Banknote },
  { id: 'Chèque', label: 'Chèque', icon: FileText },
];

export function PaymentMethodDialog({ open, onClose, onConfirm }: PaymentMethodDialogProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected);
      setSelected(null);
    }
  };

  const handleClose = () => {
    setSelected(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mode de règlement</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 py-4">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.id}
                onClick={() => setSelected(method.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  selected === method.id 
                    ? 'border-primary bg-primary/10' 
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Icon size={24} className={selected === method.id ? 'text-primary' : 'text-muted-foreground'} />
                <span className={`text-sm font-medium ${selected === method.id ? 'text-primary' : 'text-foreground'}`}>
                  {method.label}
                </span>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>Annuler</Button>
          <Button onClick={handleConfirm} disabled={!selected} className="gradient-primary">
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
