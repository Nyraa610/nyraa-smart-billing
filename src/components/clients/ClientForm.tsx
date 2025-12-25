import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Client } from "@/types";
import { Search, Loader2 } from "lucide-react";
import { fetchCompanyBySiret, formatSiret } from "@/utils/siretApi";
import { toast } from "@/hooks/use-toast";

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
}

export function ClientForm({ open, onClose, onSave }: ClientFormProps) {
  const [siretInput, setSiretInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    siret: "",
    tvaNumber: "",
  });

  const handleSiretSearch = async () => {
    if (!siretInput.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un numéro SIRET",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const company = await fetchCompanyBySiret(siretInput);
      if (company) {
        setFormData({
          name: company.name,
          email: "",
          phone: "",
          address: company.address,
          postalCode: company.postalCode,
          city: company.city,
          siret: formatSiret(company.siret),
          tvaNumber: company.tvaNumber,
        });
        toast({
          title: "Entreprise trouvée",
          description: `${company.name} a été trouvée`,
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Erreur lors de la recherche",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Erreur",
        description: "Le nom et l'email sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    const client: Client = {
      id: String(Date.now()),
      ...formData,
    };

    onSave(client);
    toast({
      title: "Client ajouté",
      description: `${formData.name} a été ajouté avec succès`,
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSiretInput("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      postalCode: "",
      city: "",
      siret: "",
      tvaNumber: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Nouveau Client</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Recherche SIRET */}
          <div className="space-y-2">
            <Label>Recherche par SIRET (optionnel)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="123 456 789 00012"
                value={siretInput}
                onChange={(e) => setSiretInput(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSiretSearch} disabled={isSearching}>
                {isSearching ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Search size={18} />
                )}
                Rechercher
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Entrez le SIRET pour pré-remplir automatiquement les informations
            </p>
          </div>

          {/* Informations client */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Raison sociale *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input
                id="siret"
                value={formData.siret}
                onChange={(e) => setFormData({ ...formData, siret: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tvaNumber">N° TVA Intracommunautaire</Label>
              <Input
                id="tvaNumber"
                value={formData.tvaNumber}
                onChange={(e) => setFormData({ ...formData, tvaNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Annuler
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
