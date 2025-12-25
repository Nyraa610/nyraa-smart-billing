import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Eye, MoreHorizontal, Search, Loader2, Check, X, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSupabaseQuotes, Quote, QuoteStatus } from "@/hooks/useSupabaseQuotes";
import { useSupabaseClients } from "@/hooks/useSupabaseClients";
import { useSupabaseCompanyInfo } from "@/hooks/useSupabaseCompanyInfo";
import { QuoteForm } from "@/components/quotes/QuoteForm";
import { QuoteDetailDialog } from "@/components/quotes/QuoteDetailDialog";
import { toast } from "sonner";
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

const statusConfig: Record<QuoteStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  en_attente: { label: "En attente", variant: "secondary" },
  accepte: { label: "Accepté", variant: "default" },
  refuse: { label: "Refusé", variant: "destructive" },
  expire: { label: "Expiré", variant: "outline" },
};

export default function QuotesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { quotes, loading, addQuote, updateQuote, deleteQuote } = useSupabaseQuotes();
  const { clients } = useSupabaseClients();
  const { companyInfo } = useSupabaseCompanyInfo();

  const filteredQuotes = quotes.filter(quote =>
    (quote.client?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    quote.quote_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveQuote = async (quoteData: Parameters<typeof addQuote>[0]) => {
    const result = await addQuote(quoteData);
    if (result) toast.success('Devis créé');
  };

  const handleViewQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (id: string, status: QuoteStatus) => {
    const success = await updateQuote(id, { status });
    if (success) toast.success('Statut mis à jour');
  };

  const handleDelete = async () => {
    if (deleteId) {
      const success = await deleteQuote(deleteId);
      if (success) toast.success('Devis supprimé');
      setDeleteId(null);
    }
  };

  if (loading) {
    return <Layout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Devis</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Créez et gérez vos propositions</p>
          </div>
          <Button className="gradient-primary" size="lg" onClick={() => setIsFormOpen(true)}>
            <Plus size={20} className="mr-2" />Nouveau devis
          </Button>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <Input placeholder="Rechercher..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-3">
          {filteredQuotes.length === 0 ? (
            <div className="bg-card rounded-2xl border p-8 text-center text-muted-foreground">Aucun devis</div>
          ) : (
            filteredQuotes.map((quote) => (
              <div key={quote.id} className="bg-card rounded-xl border p-4" onClick={() => handleViewQuote(quote)}>
                <div className="flex items-start justify-between mb-3">
                  <div><p className="font-semibold">{quote.quote_number}</p><p className="text-sm text-muted-foreground">{quote.client?.name}</p></div>
                  <Badge variant={statusConfig[quote.status].variant}>{statusConfig[quote.status].label}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">{Number(quote.total).toLocaleString('fr-FR')} €</p>
                  <p className="text-xs text-muted-foreground">{new Date(quote.valid_until).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop */}
        <div className="hidden md:block bg-card rounded-2xl border overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Numéro</th>
              <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Client</th>
              <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Date</th>
              <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Validité</th>
              <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Montant</th>
              <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Statut</th>
              <th className="text-right p-4 font-semibold text-muted-foreground text-sm">Actions</th>
            </tr></thead>
            <tbody>
              {filteredQuotes.length === 0 ? (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Aucun devis</td></tr>
              ) : (
                filteredQuotes.map((quote) => (
                  <tr key={quote.id} className="border-b last:border-0 hover:bg-muted/30 cursor-pointer" onClick={() => handleViewQuote(quote)}>
                    <td className="p-4 font-semibold">{quote.quote_number}</td>
                    <td className="p-4">{quote.client?.name}</td>
                    <td className="p-4 text-muted-foreground">{new Date(quote.issue_date).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 text-muted-foreground">{new Date(quote.valid_until).toLocaleDateString('fr-FR')}</td>
                    <td className="p-4 font-semibold">{Number(quote.total).toLocaleString('fr-FR')} €</td>
                    <td className="p-4"><Badge variant={statusConfig[quote.status].variant}>{statusConfig[quote.status].label}</Badge></td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => handleViewQuote(quote)}><Eye size={18} /></Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal size={18} /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'en_attente')}><Clock className="mr-2 h-4 w-4" />En attente</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'accepte')}><Check className="mr-2 h-4 w-4" />Accepté</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(quote.id, 'refuse')}><X className="mr-2 h-4 w-4" />Refusé</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(quote.id)}>Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <QuoteForm open={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={handleSaveQuote} clients={clients} companyInfo={companyInfo} />
      <QuoteDetailDialog quote={selectedQuote} open={isDetailOpen} onClose={() => setIsDetailOpen(false)} onStatusChange={handleStatusChange} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Supprimer le devis ?</AlertDialogTitle><AlertDialogDescription>Cette action est irréversible.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Supprimer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
