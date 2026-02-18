import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { useSupabaseTransactions } from "@/hooks/useSupabaseTransactions";
import { useSupabaseCompanyInfo } from "@/hooks/useSupabaseCompanyInfo";
import { TrendingUp, Wallet, BookOpen, Loader2, Receipt, Trash2, Download, Calendar, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import { exportTransactionsToCSV, filterTransactionsByPeriod, ExportPeriod } from "@/utils/csvExport";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AccountingPage() {
  const { transactions, loading, deleteTransaction } = useSupabaseTransactions();
  const { companyInfo } = useSupabaseCompanyInfo();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [exportPeriod, setExportPeriod] = useState<ExportPeriod>('all');
  const [showPreview, setShowPreview] = useState(false);

  const totalIncome = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

  const filteredTransactions = useMemo(() => {
    return filterTransactionsByPeriod(transactions, exportPeriod)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, exportPeriod]);

  const filteredTotal = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  }, [filteredTransactions]);

  const handleDelete = async () => {
    if (deleteId) {
      const success = await deleteTransaction(deleteId);
      if (success) {
        toast.success('Transaction supprimée');
      }
      setDeleteId(null);
    }
  };

  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.error('Aucune recette à exporter pour cette période');
      return;
    }
    exportTransactionsToCSV(
      transactions,
      companyInfo ? {
        name: companyInfo.name,
        siret: companyInfo.siret,
        address: companyInfo.address,
        postal_code: companyInfo.postal_code,
        city: companyInfo.city,
      } : undefined,
      exportPeriod
    );
    toast.success('Export CSV téléchargé');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Comptabilité</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Livre de recettes - Entreprise individuelle</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={exportPeriod} onValueChange={(v) => setExportPeriod(v as ExportPeriod)}>
              <SelectTrigger className="w-[160px] gap-2">
                <Calendar size={16} />
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="quarter">Ce trimestre</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              className="gap-2"
            >
              {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
              <span className="hidden sm:inline">{showPreview ? 'Masquer' : 'Aperçu'}</span>
            </Button>
            <Button 
              onClick={handleExport}
              variant="outline"
              className="gap-2"
            >
              <Download size={18} />
              Exporter CSV
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
          <StatCard title="Total recettes" value={`${totalIncome.toLocaleString('fr-FR')} €`} icon={Wallet} variant="primary" delay={0} />
          <StatCard title="Nombre d'entrées" value={transactions.length.toString()} icon={BookOpen} delay={50} />
          <StatCard
            title="Ce mois"
            value={`${transactions
              .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
              .reduce((sum, t) => sum + Number(t.amount), 0)
              .toLocaleString('fr-FR')} €`}
            icon={TrendingUp} variant="success" delay={100}
          />
        </div>

        {/* Preview Table */}
        {showPreview && (
          <div className="bg-card rounded-2xl border shadow-sm p-4 md:p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Eye className="text-primary" size={20} />
                <h3 className="text-base md:text-lg font-semibold text-card-foreground">
                  Aperçu export ({filteredTransactions.length} recette{filteredTransactions.length > 1 ? 's' : ''})
                </h3>
              </div>
            </div>
            {filteredTransactions.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">Aucune recette pour cette période.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-12 text-center">N°</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Réf. facture</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Nature</TableHead>
                      <TableHead className="text-right">Montant</TableHead>
                      <TableHead>Règlement</TableHead>
                      <TableHead className="text-right">Cumul</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((t, i) => {
                      const cumul = filteredTransactions.slice(0, i + 1).reduce((s, tr) => s + Number(tr.amount), 0);
                      return (
                        <TableRow key={t.id}>
                          <TableCell className="text-center text-muted-foreground">{i + 1}</TableCell>
                          <TableCell className="whitespace-nowrap">{new Date(t.date).toLocaleDateString('fr-FR')}</TableCell>
                          <TableCell>{t.invoice_number || '—'}</TableCell>
                          <TableCell>{t.client_name || '—'}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{t.description}</TableCell>
                          <TableCell className="text-right font-medium text-success whitespace-nowrap">
                            {Number(t.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </TableCell>
                          <TableCell>{t.payment_method || 'Non précisé'}</TableCell>
                          <TableCell className="text-right font-semibold whitespace-nowrap">
                            {cumul.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={5} className="font-semibold">TOTAL</TableCell>
                      <TableCell className="text-right font-bold text-success whitespace-nowrap">
                        {filteredTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </TableCell>
                      <TableCell />
                      <TableCell className="text-right font-bold whitespace-nowrap">
                        {filteredTotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-card rounded-2xl border shadow-sm p-4 md:p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center gap-2 mb-4 md:mb-6">
            <Receipt className="text-primary" size={20} />
            <h3 className="text-base md:text-lg font-semibold text-card-foreground">Livre de recettes</h3>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-8 md:py-12 text-muted-foreground">
              <p>Aucune recette enregistrée.</p>
              <p className="text-sm mt-2">Les recettes sont automatiquement créées lorsqu'une facture est marquée comme payée.</p>
            </div>
          ) : (
            <div className="space-y-2 md:space-y-3">
              {transactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors gap-2"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg flex items-center justify-center bg-success/10 flex-shrink-0">
                      <TrendingUp className="text-success" size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground text-sm md:text-base truncate">{transaction.description}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {transaction.client_name && `${transaction.client_name} • `}
                        {new Date(transaction.date).toLocaleDateString('fr-FR')}
                        {transaction.payment_method && ` • ${transaction.payment_method}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-success text-right">
                      +{Number(transaction.amount).toLocaleString('fr-FR')} €
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(transaction.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette recette ?</AlertDialogTitle>
            <AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
