import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Download, Eye, MoreHorizontal, Search, Loader2, CheckCircle, Clock, AlertCircle, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { exportInvoicesToCSV } from "@/utils/csvExport";
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
import { PaymentMethodDialog } from "@/components/invoices/PaymentMethodDialog";
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
  const [editInvoice, setEditInvoice] = useState<Invoice | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [paymentDialogInvoice, setPaymentDialogInvoice] = useState<{ id: string; fromDetail: boolean } | null>(null);
  
  const { invoices, loading, addInvoice, updateInvoice, deleteInvoice } = useSupabaseInvoices();
  const { clients } = useSupabaseClients();
  const { companyInfo } = useSupabaseCompanyInfo();

  const filteredInvoices = invoices.filter(invoice =>
    (invoice.client?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (invoice.title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleSaveInvoice = async (invoiceData: Parameters<typeof addInvoice>[0]) => {
    const result = await addInvoice(invoiceData);
    if (result) {
      toast.success('Facture créée avec succès');
    }
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setEditInvoice(invoice);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditInvoice(null);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailOpen(true);
  };

  const handleStatusChange = async (id: string, status: InvoiceStatus, paymentMethod?: string, fromDetail: boolean = false) => {
    if (status === 'reglee' && !paymentMethod) {
      setPaymentDialogInvoice({ id, fromDetail });
      return;
    }

    const success = await updateInvoice(id, { status }, paymentMethod);
    if (success) {
      toast.success(status === 'reglee' ? 'Facture marquée comme payée - Recette ajoutée au livre' : 'Statut mis à jour');
      if (fromDetail) {
        setIsDetailOpen(false);
      }
    }
  };

  const handlePaymentConfirm = async (method: string) => {
    if (paymentDialogInvoice) {
      const success = await updateInvoice(paymentDialogInvoice.id, { status: 'reglee' }, method);
      if (success) {
        toast.success('Facture marquée comme payée - Recette ajoutée au livre');
        if (paymentDialogInvoice.fromDetail) {
          setIsDetailOpen(false);
        }
      }
      setPaymentDialogInvoice(null);
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
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Gérez vos factures</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={() => {
                if (invoices.length === 0) {
                  toast.error('Aucune facture à exporter');
                  return;
                }
                exportInvoicesToCSV(invoices);
                toast.success('Export CSV téléchargé');
              }}
            >
              <Download size={18} />
              <span className="hidden sm:inline">Exporter</span>
            </Button>
            <Button className="gradient-primary" size="lg" onClick={() => setIsFormOpen(true)}>
              <Plus size={20} className="mr-2" />
              Nouvelle facture
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Rechercher..."
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
              <p className="text-muted-foreground">Aucune facture</p>
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
                    <p className="text-sm text-muted-foreground">{invoice.client?.name || 'Client'}</p>
                  </div>
                  <Badge variant={statusConfig[invoice.status].variant} className="text-xs">
                    {statusConfig[invoice.status].label}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">{Number(invoice.total).toLocaleString('fr-FR')} €</p>
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <p className="text-xs text-muted-foreground">{new Date(invoice.due_date).toLocaleDateString('fr-FR')}</p>
                    <Button variant="ghost" size="icon" onClick={() => handleEditInvoice(invoice)}><Pencil size={16} /></Button>
                  </div>
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
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">Aucune facture</td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr 
                      key={invoice.id} 
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleViewInvoice(invoice)}
                    >
                      <td className="p-4 font-semibold">{invoice.invoice_number}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold text-xs">
                              {invoice.client?.name?.charAt(0) || '?'}
                            </span>
                          </div>
                          <p className="font-medium">{invoice.client?.name || 'Client'}</p>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{new Date(invoice.issue_date).toLocaleDateString('fr-FR')}</td>
                      <td className="p-4 text-muted-foreground">{new Date(invoice.due_date).toLocaleDateString('fr-FR')}</td>
                      <td className="p-4 font-semibold">{Number(invoice.total).toLocaleString('fr-FR')} €</td>
                      <td className="p-4">
                        <Badge variant={statusConfig[invoice.status].variant}>{statusConfig[invoice.status].label}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" title="Voir" onClick={() => handleViewInvoice(invoice)}>
                            <Eye size={18} />
                          </Button>
                          <Button variant="ghost" size="icon" title="Modifier" onClick={() => handleEditInvoice(invoice)}>
                            <Pencil size={18} />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal size={18} /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'non_reglee')}>
                                <AlertCircle className="mr-2 h-4 w-4" />Non réglée
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'reglement_en_cours')}>
                                <Clock className="mr-2 h-4 w-4" />En cours
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(invoice.id, 'reglee')}>
                                <CheckCircle className="mr-2 h-4 w-4" />Payée
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
        onClose={handleCloseForm} 
        onSave={handleSaveInvoice}
        onUpdate={updateInvoice}
        clients={clients}
        companyInfo={companyInfo}
        editInvoice={editInvoice}
      />

      <InvoiceDetailDialog
        invoice={selectedInvoice}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onStatusChange={(id, status) => handleStatusChange(id, status, undefined, true)}
        companyInfo={companyInfo}
      />

      <PaymentMethodDialog
        open={!!paymentDialogInvoice}
        onClose={() => setPaymentDialogInvoice(null)}
        onConfirm={handlePaymentConfirm}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la facture ?</AlertDialogTitle>
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
