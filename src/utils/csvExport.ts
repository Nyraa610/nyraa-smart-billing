import { Invoice } from '@/hooks/useSupabaseInvoices';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  client_name?: string | null;
  payment_method?: string | null;
  invoice_number?: string | null;
}

function escapeCSVField(field: string | number | null | undefined): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(content: string, filename: string) {
  // Add BOM for Excel to recognize UTF-8
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTransactionsToCSV(transactions: Transaction[]) {
  const headers = [
    'Date',
    'Description',
    'Client',
    'N° Facture',
    'Mode de paiement',
    'Montant (€)'
  ];
  
  const rows = transactions.map(t => [
    new Date(t.date).toLocaleDateString('fr-FR'),
    escapeCSVField(t.description),
    escapeCSVField(t.client_name),
    escapeCSVField(t.invoice_number),
    escapeCSVField(t.payment_method),
    Number(t.amount).toLocaleString('fr-FR', { minimumFractionDigits: 2 })
  ]);
  
  // Add total row
  const total = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  rows.push([
    '',
    '',
    '',
    '',
    'TOTAL',
    total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })
  ]);
  
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');
  
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `livre-recettes-${date}.csv`);
}

export function exportInvoicesToCSV(invoices: Invoice[]) {
  const statusLabels: Record<string, string> = {
    non_reglee: 'Non réglée',
    reglement_en_cours: 'En cours',
    reglee: 'Payée'
  };
  
  const headers = [
    'N° Facture',
    'Client',
    'Date émission',
    'Date échéance',
    'Total HT (€)',
    'TVA (€)',
    'Total TTC (€)',
    'Statut'
  ];
  
  const rows = invoices.map(inv => [
    escapeCSVField(inv.invoice_number),
    escapeCSVField(inv.client?.name),
    new Date(inv.issue_date).toLocaleDateString('fr-FR'),
    new Date(inv.due_date).toLocaleDateString('fr-FR'),
    Number(inv.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
    Number(inv.tax).toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
    Number(inv.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
    statusLabels[inv.status] || inv.status
  ]);
  
  // Add totals row
  const totalHT = invoices.reduce((sum, inv) => sum + Number(inv.subtotal), 0);
  const totalTVA = invoices.reduce((sum, inv) => sum + Number(inv.tax), 0);
  const totalTTC = invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
  
  rows.push([
    '',
    '',
    '',
    'TOTAUX',
    totalHT.toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
    totalTVA.toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
    totalTTC.toLocaleString('fr-FR', { minimumFractionDigits: 2 }),
    ''
  ]);
  
  const csvContent = [
    headers.join(';'),
    ...rows.map(row => row.join(';'))
  ].join('\n');
  
  const date = new Date().toISOString().split('T')[0];
  downloadCSV(csvContent, `factures-${date}.csv`);
}
