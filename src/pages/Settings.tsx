import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Save, Building2, Mail, Phone, MapPin, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <Layout>
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground mt-1">Configurez les informations de votre entreprise</p>
        </div>

        {/* Company Info */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-6 animate-slide-up">
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
              <Label htmlFor="companyName">Nom de l'entreprise</Label>
              <Input id="companyName" defaultValue="Nyraa Digital" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="siret">SIRET</Label>
              <Input id="siret" placeholder="123 456 789 00012" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  Email
                </div>
              </Label>
              <Input id="email" type="email" defaultValue="contact@nyraadigital.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  Téléphone
                </div>
              </Label>
              <Input id="phone" placeholder="+33 1 23 45 67 89" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  Adresse
                </div>
              </Label>
              <Input id="address" placeholder="123 Rue de l'Exemple, 75001 Paris" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  Site web
                </div>
              </Label>
              <Input id="website" placeholder="https://nyraadigital.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tva">Numéro de TVA</Label>
              <Input id="tva" placeholder="FR12345678901" />
            </div>
          </div>
        </div>

        {/* Invoice Settings */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 space-y-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Paramètres de facturation</h2>
            <p className="text-sm text-muted-foreground">Configuration par défaut des documents</p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoicePrefix">Préfixe factures</Label>
              <Input id="invoicePrefix" defaultValue="FAC-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="quotePrefix">Préfixe devis</Label>
              <Input id="quotePrefix" defaultValue="DEV-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxRate">Taux de TVA (%)</Label>
              <Input id="taxRate" type="number" defaultValue="20" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentDelay">Délai de paiement (jours)</Label>
              <Input id="paymentDelay" type="number" defaultValue="30" />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end animate-slide-up" style={{ animationDelay: "150ms" }}>
          <Button variant="gradient" size="lg">
            <Save size={20} />
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </Layout>
  );
}
