import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Quote, CompanyInfo } from '@/types';

const getCompanyInfo = (): CompanyInfo => {
  try {
    const stored = localStorage.getItem('nyraa-company-info');
    if (stored) return JSON.parse(stored);
  } catch {}
  return {
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
};

export function generateInvoicePDF(invoice: Invoice): void {
  const doc = new jsPDF();
  const company = getCompanyInfo();
  
  // Header
  doc.setFillColor(51, 101, 178);
  doc.rect(0, 0, 220, 45, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name.toUpperCase(), 20, 20);
  
  // Company info in header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  let headerY = 27;
  if (company.address) {
    doc.text(`${company.address}${company.postalCode ? `, ${company.postalCode}` : ''}${company.city ? ` ${company.city}` : ''}`, 20, headerY);
    headerY += 5;
  }
  if (company.phone) {
    doc.text(`Tél: ${company.phone}`, 20, headerY);
    headerY += 5;
  }
  if (company.email) {
    doc.text(`Email: ${company.email}`, 20, headerY);
  }
  
  // Invoice title + number
  doc.setTextColor(51, 101, 178);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 140, 60);
  
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoice.number}`, 140, 68);
  doc.text(`Date: ${invoice.createdAt.toLocaleDateString('fr-FR')}`, 140, 74);
  doc.text(`Échéance: ${invoice.dueDate.toLocaleDateString('fr-FR')}`, 140, 80);
  
  // Émetteur (Company info)
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR', 20, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let emitterY = 62;
  doc.text(company.name, 20, emitterY);
  emitterY += 5;
  if (company.address) {
    doc.text(company.address, 20, emitterY);
    emitterY += 5;
  }
  if (company.postalCode || company.city) {
    doc.text(`${company.postalCode} ${company.city}`.trim(), 20, emitterY);
    emitterY += 5;
  }
  if (company.siret) {
    doc.text(`SIRET: ${company.siret}`, 20, emitterY);
    emitterY += 5;
  }
  if (company.tvaNumber) {
    doc.text(`N° TVA: ${company.tvaNumber}`, 20, emitterY);
    emitterY += 5;
  }
  
  // Client info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CLIENT', 20, emitterY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let clientY = emitterY + 15;
  doc.text(invoice.client.name, 20, clientY);
  clientY += 5;
  if (invoice.client.address) {
    doc.text(invoice.client.address, 20, clientY);
    clientY += 5;
  }
  if (invoice.client.postalCode || invoice.client.city) {
    doc.text(`${invoice.client.postalCode || ''} ${invoice.client.city || ''}`.trim(), 20, clientY);
    clientY += 5;
  }
  if (invoice.client.siret) {
    doc.text(`SIRET: ${invoice.client.siret}`, 20, clientY);
    clientY += 5;
  }
  if (invoice.client.tvaNumber) {
    doc.text(`N° TVA: ${invoice.client.tvaNumber}`, 20, clientY);
    clientY += 5;
  }
  doc.text(invoice.client.email, 20, clientY);
  
  // Items table
  const tableStartY = Math.max(clientY + 15, 120);
  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`,
    `${item.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`
  ]);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Description', 'Qté', 'Prix unitaire HT', 'Total HT']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [51, 101, 178],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 9,
      cellPadding: 6,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.text('Total HT:', 130, finalY);
  doc.text(`${invoice.subtotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY, { align: 'right' });
  
  doc.text(`TVA (${company.taxRate || 20}%):`, 130, finalY + 7);
  doc.text(`${invoice.tax.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 7, { align: 'right' });
  
  doc.setDrawColor(51, 101, 178);
  doc.setLineWidth(0.5);
  doc.line(130, finalY + 11, 190, finalY + 11);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 101, 178);
  doc.text('Total TTC:', 130, finalY + 18);
  doc.text(`${invoice.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 18, { align: 'right' });
  
  // Conditions de paiement
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS DE PAIEMENT', 20, finalY + 35);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Paiement à ${company.paymentDelay || 30} jours à compter de la date de facture.`, 20, finalY + 42);
  doc.text('En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée,', 20, finalY + 48);
  doc.text('ainsi qu\'une indemnité forfaitaire de 40€ pour frais de recouvrement (art. L441-10 Code de commerce).', 20, finalY + 54);
  
  // Coordonnées bancaires
  if (company.iban || company.bic) {
    doc.setFont('helvetica', 'bold');
    doc.text('COORDONNÉES BANCAIRES', 20, finalY + 65);
    doc.setFont('helvetica', 'normal');
    let bankY = finalY + 72;
    if (company.bankName) {
      doc.text(`Banque: ${company.bankName}`, 20, bankY);
      bankY += 5;
    }
    if (company.iban) {
      doc.text(`IBAN: ${company.iban}`, 20, bankY);
      bankY += 5;
    }
    if (company.bic) {
      doc.text(`BIC: ${company.bic}`, 20, bankY);
    }
  }
  
  // Footer - Mentions légales obligatoires
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  let footerY = 270;
  const footerLines: string[] = [];
  
  if (company.name) footerLines.push(company.name);
  if (company.legalForm) footerLines[footerLines.length - 1] += ` - ${company.legalForm}`;
  if (company.capital) footerLines[footerLines.length - 1] += ` au capital de ${company.capital} €`;
  
  const legalLine = [];
  if (company.siret) legalLine.push(`SIRET: ${company.siret}`);
  if (company.rcs) legalLine.push(`RCS: ${company.rcs}`);
  if (company.apeCode) legalLine.push(`Code APE: ${company.apeCode}`);
  if (company.tvaNumber) legalLine.push(`N° TVA: ${company.tvaNumber}`);
  
  if (legalLine.length > 0) footerLines.push(legalLine.join(' - '));
  
  footerLines.push('TVA non applicable, art. 293 B du CGI'); // À modifier si assujetti à la TVA
  
  footerLines.forEach((line, i) => {
    doc.text(line, 105, footerY + (i * 4), { align: 'center' });
  });
  
  doc.save(`${invoice.number}.pdf`);
}

export function generateQuotePDF(quote: Quote): void {
  const doc = new jsPDF();
  const company = getCompanyInfo();
  
  // Header
  doc.setFillColor(41, 171, 164);
  doc.rect(0, 0, 220, 45, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name.toUpperCase(), 20, 20);
  
  // Company info in header
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  let headerY = 27;
  if (company.address) {
    doc.text(`${company.address}${company.postalCode ? `, ${company.postalCode}` : ''}${company.city ? ` ${company.city}` : ''}`, 20, headerY);
    headerY += 5;
  }
  if (company.phone) {
    doc.text(`Tél: ${company.phone}`, 20, headerY);
    headerY += 5;
  }
  if (company.email) {
    doc.text(`Email: ${company.email}`, 20, headerY);
  }
  
  // Quote title + number
  doc.setTextColor(41, 171, 164);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', 150, 60);
  
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${quote.number}`, 140, 68);
  doc.text(`Date: ${quote.createdAt.toLocaleDateString('fr-FR')}`, 140, 74);
  doc.text(`Valide jusqu'au: ${quote.validUntil.toLocaleDateString('fr-FR')}`, 140, 80);
  
  // Émetteur (Company info)
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR', 20, 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let emitterY = 62;
  doc.text(company.name, 20, emitterY);
  emitterY += 5;
  if (company.address) {
    doc.text(company.address, 20, emitterY);
    emitterY += 5;
  }
  if (company.postalCode || company.city) {
    doc.text(`${company.postalCode} ${company.city}`.trim(), 20, emitterY);
    emitterY += 5;
  }
  if (company.siret) {
    doc.text(`SIRET: ${company.siret}`, 20, emitterY);
    emitterY += 5;
  }
  if (company.tvaNumber) {
    doc.text(`N° TVA: ${company.tvaNumber}`, 20, emitterY);
    emitterY += 5;
  }
  
  // Client info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CLIENT', 20, emitterY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let clientY = emitterY + 15;
  doc.text(quote.client.name, 20, clientY);
  clientY += 5;
  if (quote.client.address) {
    doc.text(quote.client.address, 20, clientY);
    clientY += 5;
  }
  if (quote.client.postalCode || quote.client.city) {
    doc.text(`${quote.client.postalCode || ''} ${quote.client.city || ''}`.trim(), 20, clientY);
    clientY += 5;
  }
  if (quote.client.siret) {
    doc.text(`SIRET: ${quote.client.siret}`, 20, clientY);
    clientY += 5;
  }
  if (quote.client.tvaNumber) {
    doc.text(`N° TVA: ${quote.client.tvaNumber}`, 20, clientY);
    clientY += 5;
  }
  doc.text(quote.client.email, 20, clientY);
  
  // Items table
  const tableStartY = Math.max(clientY + 15, 120);
  const tableData = quote.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`,
    `${item.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`
  ]);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Description', 'Qté', 'Prix unitaire HT', 'Total HT']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 171, 164],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: {
      fontSize: 9,
      cellPadding: 6,
    },
    alternateRowStyles: {
      fillColor: [240, 250, 249],
    },
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.text('Total HT:', 130, finalY);
  doc.text(`${quote.subtotal.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY, { align: 'right' });
  
  doc.text(`TVA (${company.taxRate || 20}%):`, 130, finalY + 7);
  doc.text(`${quote.tax.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 7, { align: 'right' });
  
  doc.setDrawColor(41, 171, 164);
  doc.setLineWidth(0.5);
  doc.line(130, finalY + 11, 190, finalY + 11);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 171, 164);
  doc.text('Total TTC:', 130, finalY + 18);
  doc.text(`${quote.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 18, { align: 'right' });
  
  // Conditions
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS', 20, finalY + 35);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Ce devis est valable ${company.paymentDelay || 30} jours à compter de sa date d'émission.`, 20, finalY + 42);
  doc.text('Pour acceptation, veuillez retourner ce devis signé avec la mention "Bon pour accord".', 20, finalY + 48);
  
  // Signature zone
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Signature client (précédée de "Bon pour accord"):', 20, finalY + 60);
  doc.rect(20, finalY + 65, 80, 30);
  doc.text('Date:', 110, finalY + 68);
  doc.line(125, finalY + 68, 180, finalY + 68);
  
  // Footer - Mentions légales
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  let footerY = 270;
  const footerLines: string[] = [];
  
  if (company.name) footerLines.push(company.name);
  if (company.legalForm) footerLines[footerLines.length - 1] += ` - ${company.legalForm}`;
  if (company.capital) footerLines[footerLines.length - 1] += ` au capital de ${company.capital} €`;
  
  const legalLine = [];
  if (company.siret) legalLine.push(`SIRET: ${company.siret}`);
  if (company.rcs) legalLine.push(`RCS: ${company.rcs}`);
  if (company.apeCode) legalLine.push(`Code APE: ${company.apeCode}`);
  if (company.tvaNumber) legalLine.push(`N° TVA: ${company.tvaNumber}`);
  
  if (legalLine.length > 0) footerLines.push(legalLine.join(' - '));
  
  footerLines.forEach((line, i) => {
    doc.text(line, 105, footerY + (i * 4), { align: 'center' });
  });
  
  doc.save(`${quote.number}.pdf`);
}
