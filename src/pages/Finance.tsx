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

type ActivityType = "services_bic" | "commerce" | "liberal";

const ACTIVITY_CONFIG: Record<ActivityType, {
  label: string;
  urssaf: number;
  urssafAcre: number;
  abattement: number;
  vlIR: number;
  seuil: number;
  seuilMajore: number;
  formation: number;
}> = {
  services_bic: {
    label: "Prestations de services (BIC)",
    urssaf: 21.2,
    urssafAcre: 10.6,
    abattement: 50,
    vlIR: 1.7,
    seuil: 77700,
    seuilMajore: 85800,
    formation: 0.3,
  },
  commerce: {
    label: "Achat/revente - Vente de marchandises",
    urssaf: 12.3,
    urssafAcre: 6.2,
    abattement: 71,
    vlIR: 1.0,
    seuil: 188700,
    seuilMajore: 188700,
    formation: 0.1,
  },
  liberal: {
    label: "Prestations de services (BNC / libéral)",
    urssaf: 21.2,
    urssafAcre: 10.6,
    abattement: 34,
    vlIR: 2.2,
    seuil: 77700,
    seuilMajore: 85800,
    formation: 0.2,
  },
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
  const [activityType, setActivityType] = useState<ActivityType>("liberal");
  const [period, setPeriod] = useState<string>("year");

  const config = ACTIVITY_CONFIG[activityType];

  // Taux total déclaration URSSAF = cotisations + VL IR + CFP
  const totalRate = config.urssaf + config.vlIR + config.formation;
  const totalRateClassique = config.urssaf + config.formation; // sans VL

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

  // Répartition trimestrielle du CA (année en cours)
  const quarterlyData = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const quarters = [
      { label: "T1 (Jan-Mar)", months: [0, 1, 2] },
      { label: "T2 (Avr-Jun)", months: [3, 4, 5] },
      { label: "T3 (Jul-Sep)", months: [6, 7, 8] },
      { label: "T4 (Oct-Déc)", months: [9, 10, 11] },
    ];
    return quarters.map((q) => {
      const ca = transactions
        .filter((t) => {
          const d = new Date(t.date);
          return d.getFullYear() === year && q.months.includes(d.getMonth());
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);
      return { ...q, ca, charges: Math.round(ca * totalRate) / 100 };
    });
  }, [transactions, totalRate]);

  // Calculs avec versement libératoire (VL)
  const urssafAmount = totalRevenue * (config.urssaf / 100);
  const vlIRAmount = totalRevenue * (config.vlIR / 100);
  const cfpAmount = totalRevenue * (config.formation / 100);
  const totalChargesVL = urssafAmount + vlIRAmount + cfpAmount;

  // Calcul IR classique (sans VL) pour comparaison
  const taxableIncomeClassique = totalRevenue * ((100 - config.abattement) / 100);
  const irClassique = calculateIR(taxableIncomeClassique);
  const totalChargesClassique = urssafAmount + cfpAmount + irClassique;

  // Quel régime est le plus avantageux ?
  const vlIsBetter = totalChargesVL <= totalChargesClassique;
  const savings = Math.abs(totalChargesVL - totalChargesClassique);

  const netIncome = totalRevenue - totalChargesVL;
  const chargesPercent = totalRevenue > 0 ? (totalChargesVL / totalRevenue) * 100 : 0;

  const periodLabel = period === "month" ? "ce mois" : period === "quarter" ? "ce trimestre" : period === "year" ? "cette année" : "au total";

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Finances</h1>
            <p className="text-muted-foreground">Estimations fiscales — Régime micro-entrepreneur</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={activityType} onValueChange={(v) => setActivityType(v as ActivityType)}>
              <SelectTrigger className="w-[280px]">
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
                      <p className="text-xs text-muted-foreground">Charges à payer ({totalRate}% du CA)</p>
                      <p className="text-xl font-bold text-foreground">{formatEuro(totalChargesVL)}</p>
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
                <CardDescription>
                  {totalRate}% de charges (URSSAF {config.urssaf}% + IR libératoire {config.vlIR}% + CFP {config.formation}%) → {(100 - chargesPercent).toFixed(1)}% pour vous
                </CardDescription>
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

            {/* Déclaration trimestrielle URSSAF */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Landmark size={18} className="text-primary" />
                  Déclaration trimestrielle URSSAF
                </CardTitle>
                <CardDescription>
                  Montant à payer chaque trimestre = CA du trimestre × {totalRate}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {quarterlyData.map((q) => (
                    <div key={q.label} className="p-4 rounded-xl bg-muted/50 space-y-2">
                      <p className="text-sm font-medium text-foreground">{q.label}</p>
                      <p className="text-xs text-muted-foreground">CA : {formatEuro(q.ca)}</p>
                      <p className={`text-lg font-bold ${q.charges > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {formatEuro(q.charges)}
                      </p>
                      {q.ca === 0 && (
                        <p className="text-xs text-muted-foreground italic">Pas de CA → 0 € à payer</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Detail des charges + Comparaison */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ReceiptText size={18} className="text-primary" />
                    Détail des charges (VL)
                  </CardTitle>
                  <CardDescription>Avec versement libératoire de l'IR — Taux 2024/2025</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* URSSAF */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-start gap-3">
                      <Landmark size={18} className="text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground text-sm">Cotisations sociales</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {config.urssaf}% du CA — Maladie, retraite, CSG/CRDS
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-sm font-semibold shrink-0">
                      {formatEuro(urssafAmount)}
                    </Badge>
                  </div>

                  {/* VL IR */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-start gap-3">
                      <ReceiptText size={18} className="text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground text-sm">Impôt libératoire (VL)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {config.vlIR}% du CA — Règle l'IR directement
                        </p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="text-sm font-semibold shrink-0">
                      {formatEuro(vlIRAmount)}
                    </Badge>
                  </div>

                  {/* CFP */}
                  <div className="flex items-start justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-start gap-3">
                      <Landmark size={18} className="text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground text-sm">Formation professionnelle (CFP)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {config.formation}% du CA — Droit à la formation
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-sm font-semibold shrink-0">
                      {formatEuro(cfpAmount)}
                    </Badge>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-foreground">Total avec VL ({totalRate}%)</span>
                    <span className="text-destructive text-lg">{formatEuro(totalChargesVL)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Comparaison VL vs Classique */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp size={18} className="text-primary" />
                    VL vs Régime classique
                  </CardTitle>
                  <CardDescription>Quel régime est le plus avantageux pour vous ?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* VL */}
                  <div className={`p-3 rounded-xl border ${vlIsBetter ? 'border-success/30 bg-success/5' : 'border-muted bg-muted/30'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground text-sm flex items-center gap-2">
                        Versement libératoire
                        {vlIsBetter && <Badge variant="outline" className="text-success border-success/30 text-xs">Plus avantageux</Badge>}
                      </span>
                      <span className="font-bold text-foreground">{formatEuro(totalChargesVL)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {config.urssaf}% + {config.vlIR}% + {config.formation}% = {totalRate}% du CA
                    </p>
                  </div>

                  {/* Classique */}
                  <div className={`p-3 rounded-xl border ${!vlIsBetter ? 'border-success/30 bg-success/5' : 'border-muted bg-muted/30'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground text-sm flex items-center gap-2">
                        Régime classique (barème IR)
                        {!vlIsBetter && <Badge variant="outline" className="text-success border-success/30 text-xs">Plus avantageux</Badge>}
                      </span>
                      <span className="font-bold text-foreground">{formatEuro(totalChargesClassique)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cotisations {totalRateClassique}% ({formatEuro(urssafAmount + cfpAmount)}) + IR barème sur {formatEuro(taxableIncomeClassique)} (après abattement {config.abattement}%) = {formatEuro(irClassique)}
                    </p>
                    {taxableIncomeClassique < IR_BRACKETS[0].max && (
                      <p className="text-xs text-success mt-1 font-medium">
                        ✓ Revenu imposable sous le seuil de {new Intl.NumberFormat("fr-FR").format(IR_BRACKETS[0].max)} € → IR = 0 €
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className={`p-3 rounded-xl ${vlIsBetter ? 'bg-success/10 border border-success/20' : 'bg-warning/10 border border-warning/20'}`}>
                    <p className="text-sm font-medium text-foreground">
                      {vlIsBetter
                        ? `✅ Le versement libératoire vous fait économiser ${formatEuro(savings)}`
                        : `⚠️ Le régime classique vous ferait économiser ${formatEuro(savings)}`
                      }
                    </p>
                    {!vlIsBetter && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Avec un CA de {formatEuro(totalRevenue)}, votre revenu imposable ({formatEuro(taxableIncomeClassique)}) est en dessous du seuil d'imposition. Vous payez {formatEuro(vlIRAmount)} d'impôt libératoire inutilement.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recommandations */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb size={18} className="text-warning" />
                  Recommandations
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <RecoItem
                  icon={<PiggyBank size={16} />}
                  type="success"
                  title="Anticipation des charges"
                  text={`Mettez de côté 25% de chaque entrée d'argent soit ${formatEuro(totalRevenue * 0.25)} pour couvrir vos charges trimestrielles.`}
                />

                <RecoItem
                  icon={<CheckCircle size={16} />}
                  type="success"
                  title="Rémunération possible"
                  text={`Après déduction des charges ({totalRate}%), vous pouvez vous verser ${formatEuro(Math.max(0, netIncome))} ${periodLabel}.`}
                />

                {totalRevenue > config.seuil && (
                  <RecoItem
                    icon={<AlertTriangle size={16} />}
                    type="warning"
                    title="Seuil micro-entrepreneur"
                    text={`Votre CA dépasse le seuil de ${new Intl.NumberFormat("fr-FR").format(config.seuil)} €. Envisagez un changement de statut (EURL, SASU...).`}
                  />
                )}

                {!vlIsBetter && (
                  <RecoItem
                    icon={<AlertTriangle size={16} />}
                    type="warning"
                    title="Régime classique plus avantageux"
                    text={`Avec votre CA actuel, le régime classique (sans VL) serait plus avantageux. Vous économiseriez ${formatEuro(savings)} car votre revenu imposable est sous le seuil d'imposition.`}
                  />
                )}

                <RecoItem
                  icon={<Info size={16} />}
                  type="info"
                  title="ACRE (1ère année)"
                  text={`Si éligible, vos cotisations URSSAF passent de ${config.urssaf}% à ${config.urssafAcre}% la 1ère année, soit ${formatEuro(totalRevenue * config.urssafAcre / 100)} au lieu de ${formatEuro(urssafAmount)}.`}
                />

                <RecoItem
                  icon={<Info size={16} />}
                  type="info"
                  title="CFE"
                  text="La cotisation foncière des entreprises (CFE) est exonérée la 1ère année. Ensuite, elle est payée en décembre et varie selon votre commune (200 à 700 € en moyenne)."
                />
              </CardContent>
            </Card>

            {/* Note légale */}
            <Card className="border-warning/30 bg-warning/5">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Avertissement :</strong> Ces estimations sont données à titre indicatif pour le régime micro-entrepreneur avec versement libératoire. Les montants réels peuvent varier. La CFE (payée en décembre) n'est pas incluse dans le calcul trimestriel URSSAF. Consultez un expert-comptable pour une analyse personnalisée.
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
