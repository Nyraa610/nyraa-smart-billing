import { Client, Invoice, Quote, Transaction } from "@/types";

export const mockClients: Client[] = [
  {
    id: "1",
    name: "Tech Solutions SARL",
    email: "contact@techsolutions.fr",
    address: "123 Rue de l'Innovation, 75001 Paris",
    phone: "+33 1 23 45 67 89"
  },
  {
    id: "2",
    name: "Digital Agency Pro",
    email: "info@digitalagencypro.com",
    address: "456 Avenue du Digital, 69002 Lyon",
    phone: "+33 4 56 78 90 12"
  },
  {
    id: "3",
    name: "StartUp Innovante",
    email: "hello@startupinnovante.fr",
    address: "789 Boulevard des Startups, 33000 Bordeaux",
    phone: "+33 5 67 89 01 23"
  },
  {
    id: "4",
    name: "E-Commerce Plus",
    email: "contact@ecommerceplus.fr",
    address: "321 Rue du Commerce, 31000 Toulouse",
    phone: "+33 5 12 34 56 78"
  }
];

export const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "FAC-2024-001",
    client: mockClients[0],
    items: [
      { id: "1", description: "Développement site web", quantity: 1, unitPrice: 3500, total: 3500 },
      { id: "2", description: "Maintenance mensuelle", quantity: 3, unitPrice: 500, total: 1500 }
    ],
    subtotal: 5000,
    tax: 1000,
    total: 6000,
    status: "paid",
    createdAt: new Date("2024-01-15"),
    dueDate: new Date("2024-02-15")
  },
  {
    id: "2",
    number: "FAC-2024-002",
    client: mockClients[1],
    items: [
      { id: "1", description: "Campagne marketing digital", quantity: 1, unitPrice: 2500, total: 2500 }
    ],
    subtotal: 2500,
    tax: 500,
    total: 3000,
    status: "sent",
    createdAt: new Date("2024-01-20"),
    dueDate: new Date("2024-02-20")
  },
  {
    id: "3",
    number: "FAC-2024-003",
    client: mockClients[2],
    items: [
      { id: "1", description: "Application mobile", quantity: 1, unitPrice: 8000, total: 8000 },
      { id: "2", description: "Design UI/UX", quantity: 1, unitPrice: 2000, total: 2000 }
    ],
    subtotal: 10000,
    tax: 2000,
    total: 12000,
    status: "overdue",
    createdAt: new Date("2023-12-01"),
    dueDate: new Date("2024-01-01")
  },
  {
    id: "4",
    number: "FAC-2024-004",
    client: mockClients[3],
    items: [
      { id: "1", description: "Refonte e-commerce", quantity: 1, unitPrice: 5500, total: 5500 }
    ],
    subtotal: 5500,
    tax: 1100,
    total: 6600,
    status: "draft",
    createdAt: new Date("2024-01-25"),
    dueDate: new Date("2024-02-25")
  }
];

export const mockQuotes: Quote[] = [
  {
    id: "1",
    number: "DEV-2024-001",
    client: mockClients[0],
    items: [
      { id: "1", description: "Refonte complète du site", quantity: 1, unitPrice: 7500, total: 7500 },
      { id: "2", description: "SEO & Optimisation", quantity: 1, unitPrice: 1500, total: 1500 }
    ],
    subtotal: 9000,
    tax: 1800,
    total: 10800,
    status: "accepted",
    createdAt: new Date("2024-01-10"),
    validUntil: new Date("2024-02-10")
  },
  {
    id: "2",
    number: "DEV-2024-002",
    client: mockClients[1],
    items: [
      { id: "1", description: "Stratégie social media", quantity: 6, unitPrice: 800, total: 4800 }
    ],
    subtotal: 4800,
    tax: 960,
    total: 5760,
    status: "sent",
    createdAt: new Date("2024-01-22"),
    validUntil: new Date("2024-02-22")
  },
  {
    id: "3",
    number: "DEV-2024-003",
    client: mockClients[2],
    items: [
      { id: "1", description: "Formation équipe", quantity: 5, unitPrice: 400, total: 2000 }
    ],
    subtotal: 2000,
    tax: 400,
    total: 2400,
    status: "draft",
    createdAt: new Date("2024-01-28"),
    validUntil: new Date("2024-02-28")
  }
];

export const mockTransactions: Transaction[] = [
  { id: "1", type: "income", category: "Facturation", description: "Paiement FAC-2024-001", amount: 6000, date: new Date("2024-01-30"), invoiceId: "1" },
  { id: "2", type: "expense", category: "Logiciels", description: "Abonnement Adobe Creative Cloud", amount: 59.99, date: new Date("2024-01-15") },
  { id: "3", type: "expense", category: "Marketing", description: "Publicité Google Ads", amount: 350, date: new Date("2024-01-20") },
  { id: "4", type: "income", category: "Consulting", description: "Consultation stratégique", amount: 1500, date: new Date("2024-01-25") },
  { id: "5", type: "expense", category: "Bureautique", description: "Fournitures de bureau", amount: 125.50, date: new Date("2024-01-28") },
];
