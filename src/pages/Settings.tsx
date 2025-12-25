import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Building2, Mail, Phone, MapPin, Globe, CreditCard, Search, Loader2 } from "lucide-react";
import { useSupabaseCompanyInfo } from "@/hooks/useSupabaseCompanyInfo";
import { useState, useEffect } from "react";
import { fetchCompanyBySiret, formatSiret } from "@/utils/siretApi";
import { toast } from "sonner";

export default function SettingsPage() {
  const { companyInfo, loading, saveCompanyInfo } = useSupabaseCompanyInfo();
  const [localInfo, setLocalInfo] = useState(companyInfo);
  const [siretSearch, setSiretSearch] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync local state when companyInfo loads
  useEffect(() => {
    setLocalInfo(companyInfo);
  }, [companyInfo]);

  const handleChange = (field: string, value: string | number) => {
    setLocalInfo({ ...localInfo, [field]: value });
  };

  const handleSiretSearch = async () => {
    if (!siretSearch.trim()) { toast.error("Veuillez entrer un SIRET"); return; }
    setIsSearching(true);
    try {
      const company = await fetchCompanyBySiret(siretSearch);
      if (company) {
        setLocalInfo({
          ...localInfo,
          siret: formatSiret(company.siret),
          address: company.address,
          postal_code: company.postalCode,
          city: company.city,
          tva_number: company.tvaNumber,
        });
        toast.success("Informations pré-remplies");
      }
    } catch (error) {
      toast.error("Erreur lors de la recherche");
    } finally { setIsSearching(false); }
  };

  const handleSave = async () => {
    setIsSaving(true);
    await saveCompanyInfo(localInfo);
    setIsSaving(false);
  };

  if (loading) {
    return <Layout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 max-w-4xl">
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Configurez les informations de votre entreprise</p>
        </div>

        {/* SIRET Search */}
        <div className="bg-card rounded-2xl border shadow-sm p-4 md:p-6 space-y-4 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center"><Search className="text-primary-foreground" size={20} /></div>
            <div><h2 className="text-base md:text-lg font-semibold">Recherche par SIRET</h2><p className="text-xs md:text-sm text-muted-foreground">Pré-remplir automatiquement</p></div>
          </div>
          <div className="flex gap-2">
            <Input placeholder="SIRET" value={siretSearch} onChange={(e) => setSiretSearch(e.target.value)} className="flex-1" />
            <Button onClick={handleSiretSearch} disabled={isSearching}>{isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}</Button>
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-card rounded-2xl border shadow-sm p-4 md:p-6 space-y-4 md:space-y-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center"><Building2 className="text-primary-foreground" size={20} /></div>
            <div><h2 className="text-base md:text-lg font-semibold">Informations entreprise</h2><p className="text-xs md:text-sm text-muted-foreground">Apparaîtront sur vos documents</p></div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Raison sociale</Label><Input value={localInfo.name} onChange={(e) => handleChange('name', e.target.value)} /></div>
            <div className="space-y-1"><Label>Forme juridique</Label><Input placeholder="SARL, SAS..." value={localInfo.legal_form} onChange={(e) => handleChange('legal_form', e.target.value)} /></div>
            <div className="space-y-1"><Label>SIRET</Label><Input value={localInfo.siret} onChange={(e) => handleChange('siret', e.target.value)} /></div>
            <div className="space-y-1"><Label>N° TVA</Label><Input value={localInfo.tva_number} onChange={(e) => handleChange('tva_number', e.target.value)} /></div>
            <div className="space-y-1"><Label>RCS</Label><Input value={localInfo.rcs} onChange={(e) => handleChange('rcs', e.target.value)} /></div>
            <div className="space-y-1"><Label>Capital (€)</Label><Input value={localInfo.capital} onChange={(e) => handleChange('capital', e.target.value)} /></div>
            <div className="space-y-1"><Label>Code APE</Label><Input value={localInfo.ape_code} onChange={(e) => handleChange('ape_code', e.target.value)} /></div>
            <div className="space-y-1"><Label><Mail size={14} className="inline mr-1" />Email</Label><Input value={localInfo.email} onChange={(e) => handleChange('email', e.target.value)} /></div>
            <div className="space-y-1"><Label><Phone size={14} className="inline mr-1" />Téléphone</Label><Input value={localInfo.phone} onChange={(e) => handleChange('phone', e.target.value)} /></div>
            <div className="space-y-1"><Label><Globe size={14} className="inline mr-1" />Site web</Label><Input value={localInfo.website} onChange={(e) => handleChange('website', e.target.value)} /></div>
            <div className="space-y-1 md:col-span-2"><Label><MapPin size={14} className="inline mr-1" />Adresse</Label><Input value={localInfo.address} onChange={(e) => handleChange('address', e.target.value)} /></div>
            <div className="space-y-1"><Label>Code postal</Label><Input value={localInfo.postal_code} onChange={(e) => handleChange('postal_code', e.target.value)} /></div>
            <div className="space-y-1"><Label>Ville</Label><Input value={localInfo.city} onChange={(e) => handleChange('city', e.target.value)} /></div>
          </div>
        </div>

        {/* Bank Info */}
        <div className="bg-card rounded-2xl border shadow-sm p-4 md:p-6 space-y-4 md:space-y-6 animate-slide-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-secondary flex items-center justify-center"><CreditCard className="text-secondary-foreground" size={20} /></div>
            <div><h2 className="text-base md:text-lg font-semibold">Coordonnées bancaires</h2><p className="text-xs md:text-sm text-muted-foreground">Pour le paiement</p></div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1"><Label>Banque</Label><Input value={localInfo.bank_name} onChange={(e) => handleChange('bank_name', e.target.value)} /></div>
            <div className="space-y-1"><Label>IBAN</Label><Input value={localInfo.iban} onChange={(e) => handleChange('iban', e.target.value)} /></div>
            <div className="space-y-1"><Label>BIC</Label><Input value={localInfo.bic} onChange={(e) => handleChange('bic', e.target.value)} /></div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="bg-card rounded-2xl border shadow-sm p-4 md:p-6 space-y-4 md:space-y-6 animate-slide-up">
          <div><h2 className="text-base md:text-lg font-semibold">Paramètres de facturation</h2><p className="text-xs md:text-sm text-muted-foreground">Configuration par défaut</p></div>
          <Separator />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1"><Label>Préfixe factures</Label><Input value={localInfo.invoice_prefix} onChange={(e) => handleChange('invoice_prefix', e.target.value)} /></div>
            <div className="space-y-1"><Label>Préfixe devis</Label><Input value={localInfo.quote_prefix} onChange={(e) => handleChange('quote_prefix', e.target.value)} /></div>
            <div className="space-y-1"><Label>TVA (%)</Label><Input type="number" value={localInfo.tax_rate} onChange={(e) => handleChange('tax_rate', Number(e.target.value))} /></div>
            <div className="space-y-1"><Label>Délai (jours)</Label><Input type="number" value={localInfo.payment_delay} onChange={(e) => handleChange('payment_delay', Number(e.target.value))} /></div>
          </div>
        </div>

        <div className="flex justify-end animate-slide-up">
          <Button onClick={handleSave} disabled={isSaving} className="gradient-primary" size="lg">
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2" size={18} />}
            Enregistrer
          </Button>
        </div>
      </div>
    </Layout>
  );
}
