import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Loader2 } from "lucide-react";
import { fetchCompanyBySiret, formatSiret } from "@/utils/siretApi";
import { toast } from "sonner";

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (client: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    postal_code: string | null;
    city: string | null;
    siret: string | null;
    tva_number: string | null;
  }) => void;
}

export function ClientForm({ open, onClose, onSave }: ClientFormProps) {
  const [siretInput, setSiretInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", address: "",
    postalCode: "", city: "", siret: "", tvaNumber: "",
  });

  const handleSiretSearch = async () => {
    if (!siretInput.trim()) { toast.error("Veuillez entrer un SIRET"); return; }
    setIsSearching(true);
    try {
      const company = await fetchCompanyBySiret(siretInput);
      if (company) {
        setFormData({
          name: company.name, email: "", phone: "",
          address: company.address, postalCode: company.postalCode,
          city: company.city, siret: formatSiret(company.siret), tvaNumber: company.tvaNumber,
        });
        toast.success("Entreprise trouvée");
      }
    } catch (error) {
      toast.error("Erreur lors de la recherche");
    } finally { setIsSearching(false); }
  };

  const handleSave = () => {
    if (!formData.name) { toast.error("Le nom est obligatoire"); return; }
    onSave({
      name: formData.name, email: formData.email || null, phone: formData.phone || null,
      address: formData.address || null, postal_code: formData.postalCode || null,
      city: formData.city || null, siret: formData.siret || null, tva_number: formData.tvaNumber || null,
    });
    setFormData({ name: "", email: "", phone: "", address: "", postalCode: "", city: "", siret: "", tvaNumber: "" });
    setSiretInput("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Nouveau Client</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input placeholder="SIRET" value={siretInput} onChange={(e) => setSiretInput(e.target.value)} />
            <Button onClick={handleSiretSearch} disabled={isSearching}>
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><Label>Nom *</Label><Input value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Email</Label><Input value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} /></div>
            <div><Label>Téléphone</Label><Input value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="col-span-2"><Label>Adresse</Label><Input value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} /></div>
            <div><Label>CP</Label><Input value={formData.postalCode} onChange={(e) => setFormData(p => ({ ...p, postalCode: e.target.value }))} /></div>
            <div><Label>Ville</Label><Input value={formData.city} onChange={(e) => setFormData(p => ({ ...p, city: e.target.value }))} /></div>
            <div><Label>SIRET</Label><Input value={formData.siret} onChange={(e) => setFormData(p => ({ ...p, siret: e.target.value }))} /></div>
            <div><Label>TVA</Label><Input value={formData.tvaNumber} onChange={(e) => setFormData(p => ({ ...p, tvaNumber: e.target.value }))} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Annuler</Button>
            <Button onClick={handleSave} className="gradient-primary">Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
