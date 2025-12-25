export interface Client {
  id: string;
  name: string;
  email: string;
  address: string;
  phone?: string;
  siret?: string;
  tvaNumber?: string;
  postalCode?: string;
  city?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Invoice {
  id: string;
  number: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  createdAt: Date;
  dueDate: Date;
}

export interface Quote {
  id: string;
  number: string;
  client: Client;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
  createdAt: Date;
  validUntil: Date;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: Date;
  invoiceId?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  pendingInvoices: number;
  paidInvoices: number;
  totalQuotes: number;
  revenueChange: number;
}

export interface CompanyInfo {
  name: string;
  siret: string;
  tvaNumber: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  website: string;
  legalForm: string;
  capital: string;
  rcs: string;
  apeCode: string;
  invoicePrefix: string;
  quotePrefix: string;
  taxRate: number;
  paymentDelay: number;
  bankName: string;
  iban: string;
  bic: string;
}

export interface SiretCompanyData {
  siret: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  tvaNumber: string;
}
