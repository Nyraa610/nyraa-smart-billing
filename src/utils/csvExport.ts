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

interface CompanyInfoForExport {
  name: string;
  siret: string;
  address: string;
  postal_code: string;
  city: string;
}

export type ExportPeriod = 'all' | 'month' | 'quarter' | 'year';

function escapeCSVField(field: string | number | null | undefined): string {
  if (field === null || field === undefined) return '';
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes(';')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function downloadCSV(content: string, filename: string) {
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

function formatAmount(amount: number): string {
  return Number(amount).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

function getMonthLabel(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: ExportPeriod,
  referenceDate: Date = new Date()
): Transaction[] {
  if (period === 'all') return transactions;

  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();

  return transactions.filter(t => {
    const d = new Date(t.date);
    if (period === 'year') {
      return d.getFullYear() === year;
    }
    if (period === 'month') {
      return d.getFullYear() === year && d.getMonth() === month;
    }
    if (period === 'quarter') {
      const quarter = Math.floor(month / 3);
      const tQuarter = Math.floor(d.getMonth() / 3);
      return d.getFullYear() === year && tQuarter === quarter;
    }
    return true;
  });
}

function getPeriodLabel(period: ExportPeriod, referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = referenceDate.getMonth();
  
  switch (period) {
    case 'month':
      return referenceDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    case 'quarter': {
      const q = Math.floor(month / 3) + 1;
      return `T${q} ${year}`;
    }
    case 'year':
      return `Année ${year}`;
    default:
      return 'Toutes les périodes';
  }
}

export function exportTransactionsToCSV(
  transactions: Transaction[],
  companyInfo?: CompanyInfoForExport,
  period: ExportPeriod = 'all',
  referenceDate: Date = new Date()
) {
  const filtered = filterTransactionsByPeriod(transactions, period, referenceDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const lines: string[] = [];

  // === En-tête entreprise ===
  lines.push('LIVRE DE RECETTES - ENTREPRISE INDIVIDUELLE');
  lines.push(`Période : ${getPeriodLabel(period, referenceDate)}`);
  if (companyInfo) {
    lines.push(`Entreprise : ${escapeCSVField(companyInfo.name)}`);
    if (companyInfo.siret) lines.push(`SIRET : ${companyInfo.siret}`);
    if (companyInfo.address) {
      lines.push(`Adresse : ${companyInfo.address}${companyInfo.postal_code ? ` ${companyInfo.postal_code}` : ''}${companyInfo.city ? ` ${companyInfo.city}` : ''}`);
    }
  }
  lines.push(`Date d'export : ${new Date().toLocaleDateString('fr-FR')}`);
  lines.push(''); // ligne vide

  // === Colonnes conformes URSSAF ===
  const headers = [
    'N°',
    'Date',
    'Référence facture',
    'Client',
    'Nature de la recette',
    'Montant (€)',
    'Mode de règlement',
    'Cumul (€)'
  ];
  lines.push(headers.join(';'));

  // === Données avec cumul progressif et sous-totaux par mois ===
  let cumul = 0;
  let currentMonth = '';
  let monthTotal = 0;

  filtered.forEach((t, index) => {
    const monthLabel = getMonthLabel(t.date);

    // Sous-total du mois précédent
    if (currentMonth && monthLabel !== currentMonth) {
      lines.push(['', '', '', '', `Sous-total ${currentMonth}`, formatAmount(monthTotal), '', ''].join(';'));
      lines.push(''); // séparateur
      monthTotal = 0;
    }
    currentMonth = monthLabel;

    const amount = Number(t.amount);
    cumul += amount;
    monthTotal += amount;

    const row = [
      index + 1,
      formatDate(t.date),
      escapeCSVField(t.invoice_number),
      escapeCSVField(t.client_name),
      escapeCSVField(t.description),
      formatAmount(amount),
      escapeCSVField(t.payment_method || 'Non précisé'),
      formatAmount(cumul)
    ];
    lines.push(row.join(';'));
  });

  // Dernier sous-total mensuel
  if (currentMonth && filtered.length > 0) {
    lines.push(['', '', '', '', `Sous-total ${currentMonth}`, formatAmount(monthTotal), '', ''].join(';'));
  }

  // === Ligne total général ===
  lines.push('');
  lines.push(['', '', '', '', 'TOTAL GÉNÉRAL', formatAmount(cumul), '', ''].join(';'));
  lines.push('');
  lines.push(`Nombre de recettes : ${filtered.length}`);

  const csvContent = lines.join('\n');
  const date = new Date().toISOString().split('T')[0];
  const periodSuffix = period !== 'all' ? `-${getPeriodLabel(period, referenceDate).replace(/\s/g, '-').toLowerCase()}` : '';
  downloadCSV(csvContent, `livre-recettes${periodSuffix}-${date}.csv`);
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
