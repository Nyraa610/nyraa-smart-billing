import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Eye, MoreHorizontal, Search, Loader2, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSupabaseInvoices, Invoice, InvoiceStatus } from "@/hooks/useSupabaseInvoices";
import { useSupabaseClients } from "@/hooks/useSupabaseClients";
import { useSupabaseCompanyInfo } from "@/hooks/useSupabaseCompanyInfo";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { InvoiceDetailDialog } from "@/components/invoices/InvoiceDetailDialog";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
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

const statusConfig: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
  non_reglee: { label: "Non réglée", variant: "destructive", icon: AlertCircle },
  reglement_en_cours: { label: "En cours", variant: "secondary", icon: Clock },
  reglee: { label: "Payée", variant: "default", icon: CheckCircle },
};

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  
  const { invoices, loading, addInvoice, updateInvoice, deleteInvoice, refetch } = useSupabaseInvoices();
  const { clients } = useSupabaseClients();
  const { companyInfo } = useSupabaseCompanyInfo();

  const filteredInvoices = invoices.filter(invoice =>
    (invoice.client?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveInvoice = async (invoiceData: Omit<Invoice, 'id' | 'created_at' | 'client'>) => {
    const result = await addInvoice(invoiceData);
    if (result) {
      toast.success('Facture créée avec succès');
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (id: string, status: InvoiceStatus) => {
    const success = await updateInvoice(id, { status });
    if (success) {
      toast.success(status === 'reglee' ? 'Facture marquée comme payée - Recette ajoutée au livre' : 'Statut mis à jour');
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      const success = await deleteInvoice(deleteId);
      if (success) {
        toast.success('Facture supprimée');
      }
      setDeleteId(null);
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    const pdfInvoice = {
      id: invoice.id,
      number: invoice.invoice_number,
      client: {
        id: invoice.client_id || '',
        name: invoice.client?.name || '',
        email: invoice.client?.email || '',
        phone: '',
        address: invoice.client?.address || '',
        siret: invoice.client?.siret || '',
        tvaNumber: invoice.client?.tva_number || '',
        postalCode: invoice.client?.postal_code || '',
        city: invoice.client?.city || '',
      },
      items: invoice.items,
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
      total: Number(invoice.total),
      status: invoice.status === 'reglee' ? 'paid' as const : invoice.status === 'reglement_en_cours' ? 'sent' as const : 'draft' as const,
      createdAt: new Date(invoice.issue_date),
      dueDate: new Date(invoice.due_date),
    };
    generateInvoicePDF(pdfInvoice, companyInfo);
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
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Factures</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Gérez vos factures et générez des PDF</p>
          </div>
          <Button className="gradient-primary" size="lg" onClick={() => setIsFormOpen(true)}>
            <Plus size={20} className="mr-2" />
            Nouvelle facture
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Rechercher une facture..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {filteredInvoices.length === 0 ? (
            <div className="bg-card rounded-2xl border shadow-sm p-8 text-center">
              <p className="text-muted-foreground">Aucune facture. Créez votre première facture !</p>
            </div>
          ) : (
            filteredInvoices.map((invoice) => (
              <div 
                key={invoice.id}
                className="bg-card rounded-xl border shadow-sm p-4 animate-slide-up"
                onClick={() => handleViewInvoice(invoice)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{invoice.invoice_number}</p>
                    <p className="text-sm text-muted-foreground">{invoice.client?.name || 'Client inconnu'}</p>
                  </div>
                  <Badge variant={statusConfig[invoice.status].variant} className="text-xs">
                    {statusConfig[invoice.status].label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-foreground">
                    {Number(invoice.total).toLocaleString('fr-FR')} €
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block bg-card rounded-2xl border shadow-sm overflow-hidden animate-slide-up">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Numéro</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Client</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Date</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Échéance</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Montant</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Statut</th>
                  <th className="text-right p-4 font-semibold text-muted-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Aucune facture. Créez votre première facture !
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr 
                      key={invoice.id} 
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <td className="p-4">
                        <span className="font-semibold text-foreground">{invoice.invoice_number}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold text-xs">
                              {invoice.client?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <p className="font-medium text-foreground">{invoice.client?.name || 'Client inconnu'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(invoice.issue_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-foreground">
                          {Number(invoice.total).toLocaleString('fr-FR')} €
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant={statusConfig[invoice.status].variant}>
                          {statusConfig[invoice.status].label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDownloadPDF(invoice)}
                            title="Télécharger PDF"
                          >
                            <Download size={18} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            title="Voir"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <Eye size={18} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'non_reglee')}>
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Marquer non réglée
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'reglement_en_cours')}>
                                <Clock className="mr-2 h-4 w-4" />
                                Règlement en cours
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'reglee')}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marquer payée
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(invoice.id)}>
                                Supprimer
                              </DropdownMenuItem>
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
      </div>

      <InvoiceForm 
        open={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveInvoice}
        clients={clients}
        companyInfo={companyInfo}
      />

      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onStatusChange={handleStatusChange}
        companyInfo={companyInfo}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la facture ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. La facture sera définitivement supprimée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
