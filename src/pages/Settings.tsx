import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Building2, Mail, Phone, MapPin, Globe, CreditCard, Search, Loader2 } from "lucide-react";
import { useCompanyInfo } from "@/hooks/useCompanyInfo";
import { useState } from "react";
import { fetchCompanyBySiret, formatSiret, calculateTvaNumber } from "@/utils/siretApi";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { companyInfo, setCompanyInfo } = useCompanyInfo();
  const [siretSearch, setSiretSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleChange = (field: string, value: string | number) => {
    setCompanyInfo({ ...companyInfo, [field]: value });
  };

  const handleSiretSearch = async () => {
    if (!siretSearch.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un numéro SIRET",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    try {
      const company = await fetchCompanyBySiret(siretSearch);
      if (company) {
        setCompanyInfo({
          ...companyInfo,
          siret: formatSiret(company.siret),
          address: company.address,
          postalCode: company.postalCode,
          city: company.city,
          tvaNumber: company.tvaNumber,
        });
        toast({
          title: "Informations mises à jour",
          description: "Les informations ont été pré-remplies depuis le SIRET",
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
    toast({
      title: "Paramètres enregistrés",
      description: "Les informations de votre entreprise ont été sauvegardées",
    });
  };

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground mt-1">Configurez les informations de votre entreprise</p>
        </div>

        {/* SIRET Search */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
              <Search className="text-primary-foreground" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Recherche par SIRET</h2>
              <p className="text-sm text-muted-foreground">Pré-remplissez automatiquement les informations</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Entrez votre numéro SIRET"
              value={siretSearch}
              onChange={(e) => setSiretSearch(e.target.value)}
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
        </div>

        {/* Company Info */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-6 animate-slide-up" style={{ animationDelay: "50ms" }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Building2 className="text-primary-foreground" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Informations entreprise</h2>
              <p className="text-sm text-muted-foreground">Ces informations apparaîtront sur vos documents</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Raison sociale</Label>
              <Input 
                id="name" 
                value={companyInfo.name}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="legalForm">Forme juridique</Label>
              <Input 
                id="legalForm" 
                placeholder="SARL, SAS, Auto-entrepreneur..."
                value={companyInfo.legalForm}
                onChange={(e) => handleChange('legalForm', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input 
                id="siret" 
                placeholder="123 456 789 00012"
                value={companyInfo.siret}
                onChange={(e) => handleChange('siret', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tva">N° TVA Intracommunautaire</Label>
              <Input 
                id="tva" 
                placeholder="FR12345678901"
                value={companyInfo.tvaNumber}
                onChange={(e) => handleChange('tvaNumber', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rcs">RCS</Label>
              <Input 
                id="rcs" 
                placeholder="Paris B 123 456 789"
                value={companyInfo.rcs}
                onChange={(e) => handleChange('rcs', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capital">Capital social (€)</Label>
              <Input 
                id="capital" 
                placeholder="10000"
                value={companyInfo.capital}
                onChange={(e) => handleChange('capital', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apeCode">Code APE</Label>
              <Input 
                id="apeCode" 
                placeholder="6201Z"
                value={companyInfo.apeCode}
                onChange={(e) => handleChange('apeCode', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </div>
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={companyInfo.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  Téléphone
                </div>
              </Label>
              <Input 
                id="phone" 
                placeholder="+33 1 23 45 67 89"
                value={companyInfo.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  Site web
                </div>
              </Label>
              <Input 
                id="website" 
                placeholder="https://example.com"
                value={companyInfo.website}
                onChange={(e) => handleChange('website', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  Adresse
                </div>
              </Label>
              <Input 
                id="address" 
                placeholder="123 Rue de l'Exemple"
                value={companyInfo.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Code postal</Label>
              <Input 
                id="postalCode" 
                placeholder="75001"
                value={companyInfo.postalCode}
                onChange={(e) => handleChange('postalCode', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Ville</Label>
              <Input 
                id="city" 
                placeholder="Paris"
                value={companyInfo.city}
                onChange={(e) => handleChange('city', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
              <CreditCard className="text-secondary-foreground" size={24} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Coordonnées bancaires</h2>
              <p className="text-sm text-muted-foreground">Affichées sur vos factures pour le paiement</p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="bankName">Banque</Label>
              <Input 
                id="bankName" 
                placeholder="Nom de la banque"
                value={companyInfo.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="iban">IBAN</Label>
              <Input 
                id="iban" 
                placeholder="FR76 1234 5678 9012 3456 7890 123"
                value={companyInfo.iban}
                onChange={(e) => handleChange('iban', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bic">BIC</Label>
              <Input 
                id="bic" 
                placeholder="BNPAFRPP"
                value={companyInfo.bic}
                onChange={(e) => handleChange('bic', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Paramètres de facturation</h2>
            <p className="text-sm text-muted-foreground">Configuration par défaut des documents</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Préfixe factures</Label>
              <Input 
                id="invoicePrefix" 
                value={companyInfo.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quotePrefix">Préfixe devis</Label>
              <Input 
                id="quotePrefix" 
                value={companyInfo.quotePrefix}
                onChange={(e) => handleChange('quotePrefix', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Taux de TVA (%)</Label>
              <Input 
                id="taxRate" 
                type="number" 
                value={companyInfo.taxRate}
                onChange={(e) => handleChange('taxRate', Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDelay">Délai de paiement (jours)</Label>
              <Input 
                id="paymentDelay" 
                type="number" 
                value={companyInfo.paymentDelay}
                onChange={(e) => handleChange('paymentDelay', Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end animate-slide-up" style={{ animationDelay: "200ms" }}>
          <Button variant="gradient" size="lg" onClick={handleSave}>
            <Save size={20} />
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </Layout>
  );
}
