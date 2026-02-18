import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSupabaseTransactions } from "@/hooks/useSupabaseTransactions";
import { useSupabaseCompanyInfo } from "@/hooks/useSupabaseCompanyInfo";
import { useMemo, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Euro,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Landmark,
  Wallet,
  PiggyBank,
  ArrowDownRight,
  ReceiptText,
  Lightbulb,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

type ActivityType = "services" | "commerce" | "liberal";

const ACTIVITY_CONFIG: Record<ActivityType, { label: string; urssaf: number; abattement: number }> = {
  services: { label: "Prestations de services (BIC)", urssaf: 21.2, abattement: 50 },
  commerce: { label: "Vente de marchandises (BIC)", urssaf: 12.3, abattement: 71 },
  liberal: { label: "Activité libérale (BNC)", urssaf: 21.1, abattement: 34 },
};

// Barème IR 2024 (revenus 2023) - simplifié
const IR_BRACKETS = [
  { max: 11294, rate: 0 },
  { max: 28797, rate: 11 },
  { max: 82341, rate: 30 },
  { max: 177106, rate: 41 },
  { max: Infinity, rate: 45 },
];

function calculateIR(taxableIncome: number): number {
  let tax = 0;
  let prev = 0;
  for (const bracket of IR_BRACKETS) {
    const slice = Math.min(taxableIncome, bracket.max) - prev;
    if (slice <= 0) break;
    tax += slice * (bracket.rate / 100);
    prev = bracket.max;
  }
  return tax;
}

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(amount);
}

export default function FinancePage() {
  const { transactions, loading } = useSupabaseTransactions();
  const { companyInfo } = useSupabaseCompanyInfo();
  const [activityType, setActivityType] = useState<ActivityType>("services");
  const [period, setPeriod] = useState<string>("year");

  const config = ACTIVITY_CONFIG[activityType];

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      if (period === "month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (period === "quarter") {
        const q = Math.floor(now.getMonth() / 3);
        return Math.floor(d.getMonth() / 3) === q && d.getFullYear() === now.getFullYear();
      }
      if (period === "year") return d.getFullYear() === now.getFullYear();
      return true;
    });
  }, [transactions, period]);

  const totalRevenue = useMemo(
    () => filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0),
    [filteredTransactions]
  );

  // Calculs fiscaux
  const urssafAmount = totalRevenue * (config.urssaf / 100);
  const taxableIncome = totalRevenue * ((100 - config.abattement) / 100);
  const irAmount = calculateIR(taxableIncome);
  const cfeEstimate = totalRevenue > 0 ? Math.max(200, Math.min(totalRevenue * 0.005, 700)) : 0;
  const totalCharges = urssafAmount + irAmount + cfeEstimate;
  const netIncome = totalRevenue - totalCharges;
  const chargesPercent = totalRevenue > 0 ? (totalCharges / totalRevenue) * 100 : 0;

  const periodLabel = period === "month" ? "ce mois" : period === "quarter" ? "ce trimestre" : period === "year" ? "cette année" : "au total";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Finances</h1>
            <p className="text-muted-foreground">Vue d'ensemble fiscale et financière</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
              <SelectTrigger className="w-[260px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_CONFIG).map(([key, cfg]) => (
                  <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mois</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Année</SelectItem>
                <SelectItem value="all">Tout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Chargement...</p>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-primary/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Euro size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Recettes {periodLabel}</p>
                      <p className="text-xl font-bold text-foreground">{formatEuro(totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                      <ArrowDownRight size={20} className="text-destructive" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total charges estimées</p>
                      <p className="text-xl font-bold text-foreground">{formatEuro(totalCharges)}</p>
                      <p className="text-xs text-muted-foreground">{chargesPercent.toFixed(1)}% du CA</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-success/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <Wallet size={20} className="text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenu net estimé</p>
                      <p className="text-xl font-bold text-foreground">{formatEuro(netIncome)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-warning/20">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
                      <PiggyBank size={20} className="text-warning" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Vous pouvez vous verser</p>
                      <p className="text-xl font-bold text-foreground">{formatEuro(Math.max(0, netIncome))}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Gauge */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp size={18} className="text-primary" />
                  Répartition de votre chiffre d'affaires
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Charges ({chargesPercent.toFixed(1)}%)</span>
                    <span className="text-muted-foreground">Net ({(100 - chargesPercent).toFixed(1)}%)</span>
                  </div>
                  <Progress value={chargesPercent} className="h-3" />
                </div>
              </CardContent>
            </Card>

            {/* Detail des charges */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ReceiptText size={18} className="text-primary" />
                    Détail des charges
                  </CardTitle>
                  <CardDescription>Estimation basée sur le régime micro-entrepreneur</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* URSSAF */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-start gap-3">
                      <Landmark size={18} className="text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground text-sm">Cotisations URSSAF</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Taux : {config.urssaf}% du CA — Couvre maladie, retraite, allocations familiales
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-sm font-semibold shrink-0">
                      {formatEuro(urssafAmount)}
                    </Badge>
                  </div>

                  {/* IR */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-start gap-3">
                      <ReceiptText size={18} className="text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground text-sm">Impôt sur le revenu</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Abattement {config.abattement}% → Revenu imposable : {formatEuro(taxableIncome)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-sm font-semibold shrink-0">
                      {formatEuro(irAmount)}
                    </Badge>
                  </div>

                  {/* CFE */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-start gap-3">
                      <Landmark size={18} className="text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground text-sm">CFE (estimée)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Cotisation foncière des entreprises — Variable selon la commune
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm font-semibold shrink-0">
                      ~{formatEuro(cfeEstimate)}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-foreground">Total des charges</span>
                    <span className="text-destructive text-lg">{formatEuro(totalCharges)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Recommandations */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb size={18} className="text-warning" />
                    Recommandations
                  </CardTitle>
                  <CardDescription>Conseils personnalisés selon votre situation</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <RecoItem
                    icon={<PiggyBank size={16} />}
                    type="success"
                    title="Épargne de précaution"
                    text={`Mettez de côté environ ${formatEuro(totalRevenue * 0.25)} (25% du CA) chaque mois pour couvrir vos charges sociales et fiscales.`}
                  />

                  {totalRevenue > 72600 && activityType === "services" && (
                    <RecoItem
                      icon={<AlertTriangle size={16} />}
                      type="warning"
                      title="Seuil micro-entrepreneur dépassé"
                      text="Votre CA dépasse le seuil de 77 700 € pour les services. Envisagez un changement de statut."
                    />
                  )}

                  {totalRevenue > 188700 && activityType === "commerce" && (
                    <RecoItem
                      icon={<AlertTriangle size={16} />}
                      type="warning"
                      title="Seuil micro-entrepreneur dépassé"
                      text="Votre CA dépasse le seuil de 188 700 € pour la vente. Envisagez un changement de statut."
                    />
                  )}

                  <RecoItem
                    icon={<Info size={16} />}
                    type="info"
                    title="Versement libératoire de l'IR"
                    text={`Si votre revenu fiscal de référence le permet, vous pouvez opter pour le versement libératoire (${activityType === "commerce" ? "1%" : activityType === "services" ? "1,7%" : "2,2%"} du CA) pour simplifier votre fiscalité.`}
                  />

                  <RecoItem
                    icon={<CheckCircle size={16} />}
                    type="success"
                    title="Rémunération possible"
                    text={`Après déduction de toutes les charges estimées, vous pouvez vous verser ${formatEuro(Math.max(0, netIncome))} ${periodLabel}.`}
                  />

                  {netIncome > 0 && (
                    <RecoItem
                      icon={<PiggyBank size={16} />}
                      type="info"
                      title="Conseil investissement"
                      text={`Pensez à investir une partie de votre bénéfice net (ex: ${formatEuro(netIncome * 0.1)}) dans du matériel professionnel ou de la formation pour développer votre activité.`}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Note légale */}
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Avertissement :</strong> Ces estimations sont données à titre indicatif et ne constituent pas un conseil fiscal. Elles sont basées sur le régime micro-entrepreneur et les barèmes en vigueur. Consultez un expert-comptable pour une analyse personnalisée de votre situation.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </Layout>
  );
}

function RecoItem({ icon, type, title, text }: { icon: React.ReactNode; type: "success" | "warning" | "info"; title: string; text: string }) {
  const colors = {
    success: "bg-success/10 text-success border-success/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    info: "bg-primary/10 text-primary border-primary/20",
  };

  return (
    <div className={`p-3 rounded-xl border ${colors[type]}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="font-medium text-foreground text-sm">{title}</span>
      </div>
      <p className="text-xs text-muted-foreground">{text}</p>
    </div>
  );
}
