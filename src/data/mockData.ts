import { Client, Invoice, Quote, Transaction, CompanyInfo } from "@/types";

// Empty arrays - no mock data
export const mockClients: Client[] = [];
export const mockInvoices: Invoice[] = [];
export const mockQuotes: Quote[] = [];
export const mockTransactions: Transaction[] = [];

export const defaultCompanyInfo: CompanyInfo = {
  name: "Nyraa Digital",
  siret: "",
  tvaNumber: "",
  email: "",
  phone: "",
  address: "",
  postalCode: "",
  city: "",
  website: "",
  legalForm: "",
  capital: "",
  rcs: "",
  apeCode: "",
  invoicePrefix: "FAC-",
  quotePrefix: "DEV-",
  taxRate: 20,
  paymentDelay: 30,
  bankName: "",
  iban: "",
  bic: "",
};
