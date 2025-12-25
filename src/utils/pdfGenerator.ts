import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/hooks/useSupabaseInvoices';
import { Quote } from '@/hooks/useSupabaseQuotes';
import { CompanyInfo } from '@/hooks/useSupabaseCompanyInfo';

// Couleurs du thème
const COLORS = {
  primary: { r: 139, g: 92, b: 246 },      // Violet
  secondary: { r: 236, g: 72, b: 153 },    // Rose/Magenta
  dark: { r: 24, g: 24, b: 27 },           // Fond sombre
  text: { r: 63, g: 63, b: 70 },           // Texte principal
  muted: { r: 113, g: 113, b: 122 },       // Texte secondaire
  light: { r: 250, g: 250, b: 250 },       // Fond clair
  accent: { r: 41, g: 171, b: 164 },       // Teal pour les devis
};

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, color: {r: number, g: number, b: number}) {
  doc.setFillColor(color.r, color.g, color.b);
  doc.roundedRect(x, y, w, h, r, r, 'F');
}

function addGradientHeader(doc: jsPDF, title: string, isPrimary: boolean = true) {
  const color = isPrimary ? COLORS.primary : COLORS.accent;
  
  // Header background
  doc.setFillColor(color.r, color.g, color.b);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Subtle gradient overlay effect
  doc.setFillColor(color.r - 20, color.g - 20, color.b - 20);
  doc.rect(0, 45, 210, 5, 'F');
  
  return color;
}

export function generateInvoicePDF(invoice: Invoice, company: CompanyInfo): void {
  const doc = new jsPDF();
  const primaryColor = COLORS.primary;
  
  // Header with gradient effect
  addGradientHeader(doc, 'FACTURE', true);
  
  // Company name in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name.toUpperCase(), 20, 22);
  
  // Company tagline/info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const headerInfo = [];
  if (company.address) headerInfo.push(company.address);
  if (company.city) headerInfo.push(company.city);
  doc.text(headerInfo.join(' • '), 20, 32);
  
  if (company.phone || company.email) {
    const contactInfo = [];
    if (company.phone) contactInfo.push(company.phone);
    if (company.email) contactInfo.push(company.email);
    doc.text(contactInfo.join(' • '), 20, 40);
  }
  
  // Invoice badge
  drawRoundedRect(doc, 140, 55, 55, 25, 3, primaryColor);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 167.5, 70, { align: 'center' });
  
  // Invoice details card
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`N° ${invoice.invoice_number}`, 140, 90);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(`Émise le ${new Date(invoice.issue_date).toLocaleDateString('fr-FR')}`, 140, 97);
  doc.text(`Échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}`, 140, 104);
  
  // Émetteur section with icon-like decoration
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.rect(20, 58, 3, 12, 'F');
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR', 27, 65);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  let emitterY = 73;
  doc.text(company.name, 27, emitterY);
  emitterY += 5;
  if (company.address) {
    doc.text(company.address, 27, emitterY);
    emitterY += 5;
  }
  if (company.postal_code || company.city) {
    doc.text(`${company.postal_code || ''} ${company.city || ''}`.trim(), 27, emitterY);
    emitterY += 5;
  }
  if (company.siret) {
    doc.text(`SIRET: ${company.siret}`, 27, emitterY);
    emitterY += 5;
  }
  if (company.tva_number) {
    doc.text(`TVA: ${company.tva_number}`, 27, emitterY);
    emitterY += 5;
  }
  
  // Client section with decoration
  doc.setFillColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.rect(20, emitterY + 5, 3, 12, 'F');
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 27, emitterY + 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  let clientY = emitterY + 20;
  
  const clientName = invoice.client?.name || 'Client';
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFont('helvetica', 'bold');
  doc.text(clientName, 27, clientY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  clientY += 5;
  
  if (invoice.client?.address) {
    doc.text(invoice.client.address, 27, clientY);
    clientY += 5;
  }
  if (invoice.client?.postal_code || invoice.client?.city) {
    doc.text(`${invoice.client?.postal_code || ''} ${invoice.client?.city || ''}`.trim(), 27, clientY);
    clientY += 5;
  }
  if (invoice.client?.email) {
    doc.text(invoice.client.email, 27, clientY);
    clientY += 5;
  }
  if (invoice.client?.siret) {
    doc.text(`SIRET: ${invoice.client.siret}`, 27, clientY);
    clientY += 5;
  }
  
  // Items table with modern styling
  const tableStartY = Math.max(clientY + 15, 145);
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
    theme: 'plain',
    headStyles: {
      fillColor: [primaryColor.r, primaryColor.g, primaryColor.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 8,
    },
    styles: {
      fontSize: 9,
      cellPadding: 8,
      lineColor: [230, 230, 230],
      lineWidth: 0.1,
    },
    bodyStyles: {
      textColor: [COLORS.text.r, COLORS.text.g, COLORS.text.b],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
  });
  
  // Totals section with modern card
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Totals background
  drawRoundedRect(doc, 120, finalY - 5, 75, 45, 4, { r: 248, g: 250, b: 252 });
  
  doc.setFontSize(10);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text('Total HT', 125, finalY + 5);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`${Number(invoice.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 5, { align: 'right' });
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(`TVA (${company.tax_rate || 20}%)`, 125, finalY + 14);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`${Number(invoice.tax).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 14, { align: 'right' });
  
  // Separator line
  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.setLineWidth(0.8);
  doc.line(125, finalY + 20, 190, finalY + 20);
  
  // Total TTC
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
  doc.text('Total TTC', 125, finalY + 32);
  doc.text(`${Number(invoice.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 32, { align: 'right' });
  
  // Payment conditions
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS DE PAIEMENT', 20, finalY + 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(`Paiement à ${company.payment_delay || 30} jours à compter de la date de facture.`, 20, finalY + 62);
  doc.text('En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée,', 20, finalY + 68);
  doc.text('ainsi qu\'une indemnité forfaitaire de 40€ pour frais de recouvrement.', 20, finalY + 74);
  
  // Bank details
  if (company.iban || company.bic) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.text('COORDONNÉES BANCAIRES', 20, finalY + 85);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    let bankY = finalY + 92;
    if (company.bank_name) {
      doc.text(`Banque: ${company.bank_name}`, 20, bankY);
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
  
  // Footer
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 272, 210, 25, 'F');
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  let footerY = 278;
  const footerLines: string[] = [];
  
  let companyLine = company.name;
  if (company.legal_form) companyLine += ` - ${company.legal_form}`;
  if (company.capital) companyLine += ` au capital de ${company.capital} €`;
  footerLines.push(companyLine);
  
  const legalLine = [];
  if (company.siret) legalLine.push(`SIRET: ${company.siret}`);
  if (company.rcs) legalLine.push(`RCS: ${company.rcs}`);
  if (company.ape_code) legalLine.push(`Code APE: ${company.ape_code}`);
  if (company.tva_number) legalLine.push(`N° TVA: ${company.tva_number}`);
  
  if (legalLine.length > 0) footerLines.push(legalLine.join(' • '));
  footerLines.push('TVA non applicable, art. 293 B du CGI');
  
  footerLines.forEach((line, i) => {
    doc.text(line, 105, footerY + (i * 4), { align: 'center' });
  });
  
  doc.save(`${invoice.invoice_number}.pdf`);
}

export function generateQuotePDF(quote: Quote, company: CompanyInfo): void {
  const doc = new jsPDF();
  const accentColor = COLORS.accent;
  
  // Header
  addGradientHeader(doc, 'DEVIS', false);
  
  // Company name in header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name.toUpperCase(), 20, 22);
  
  // Company tagline/info
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const headerInfo = [];
  if (company.address) headerInfo.push(company.address);
  if (company.city) headerInfo.push(company.city);
  doc.text(headerInfo.join(' • '), 20, 32);
  
  if (company.phone || company.email) {
    const contactInfo = [];
    if (company.phone) contactInfo.push(company.phone);
    if (company.email) contactInfo.push(company.email);
    doc.text(contactInfo.join(' • '), 20, 40);
  }
  
  // Quote badge
  drawRoundedRect(doc, 150, 55, 45, 25, 3, accentColor);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', 172.5, 70, { align: 'center' });
  
  // Quote details
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`N° ${quote.quote_number}`, 140, 90);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(`Émis le ${new Date(quote.issue_date).toLocaleDateString('fr-FR')}`, 140, 97);
  doc.text(`Valide jusqu'au: ${new Date(quote.valid_until).toLocaleDateString('fr-FR')}`, 140, 104);
  
  // Émetteur section
  doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
  doc.rect(20, 58, 3, 12, 'F');
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR', 27, 65);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  let emitterY = 73;
  doc.text(company.name, 27, emitterY);
  emitterY += 5;
  if (company.address) {
    doc.text(company.address, 27, emitterY);
    emitterY += 5;
  }
  if (company.postal_code || company.city) {
    doc.text(`${company.postal_code || ''} ${company.city || ''}`.trim(), 27, emitterY);
    emitterY += 5;
  }
  if (company.siret) {
    doc.text(`SIRET: ${company.siret}`, 27, emitterY);
    emitterY += 5;
  }
  if (company.tva_number) {
    doc.text(`TVA: ${company.tva_number}`, 27, emitterY);
    emitterY += 5;
  }
  
  // Client section
  doc.setFillColor(COLORS.secondary.r, COLORS.secondary.g, COLORS.secondary.b);
  doc.rect(20, emitterY + 5, 3, 12, 'F');
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 27, emitterY + 12);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  let clientY = emitterY + 20;
  
  const clientName = quote.client?.name || 'Client';
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFont('helvetica', 'bold');
  doc.text(clientName, 27, clientY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  clientY += 5;
  
  if (quote.client?.address) {
    doc.text(quote.client.address, 27, clientY);
    clientY += 5;
  }
  if (quote.client?.postal_code || quote.client?.city) {
    doc.text(`${quote.client?.postal_code || ''} ${quote.client?.city || ''}`.trim(), 27, clientY);
    clientY += 5;
  }
  if (quote.client?.email) {
    doc.text(quote.client.email, 27, clientY);
    clientY += 5;
  }
  if (quote.client?.siret) {
    doc.text(`SIRET: ${quote.client.siret}`, 27, clientY);
    clientY += 5;
  }
  
  // Items table
  const tableStartY = Math.max(clientY + 15, 145);
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
    theme: 'plain',
    headStyles: {
      fillColor: [accentColor.r, accentColor.g, accentColor.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 8,
    },
    styles: {
      fontSize: 9,
      cellPadding: 8,
      lineColor: [230, 230, 230],
      lineWidth: 0.1,
    },
    bodyStyles: {
      textColor: [COLORS.text.r, COLORS.text.g, COLORS.text.b],
    },
    alternateRowStyles: {
      fillColor: [240, 253, 250],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  drawRoundedRect(doc, 120, finalY - 5, 75, 45, 4, { r: 240, g: 253, b: 250 });
  
  doc.setFontSize(10);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text('Total HT', 125, finalY + 5);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`${Number(quote.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 5, { align: 'right' });
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(`TVA (${company.tax_rate || 20}%)`, 125, finalY + 14);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`${Number(quote.tax).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 14, { align: 'right' });
  
  doc.setDrawColor(accentColor.r, accentColor.g, accentColor.b);
  doc.setLineWidth(0.8);
  doc.line(125, finalY + 20, 190, finalY + 20);
  
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentColor.r, accentColor.g, accentColor.b);
  doc.text('Total TTC', 125, finalY + 32);
  doc.text(`${Number(quote.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 32, { align: 'right' });
  
  // Conditions
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS', 20, finalY + 55);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(`Ce devis est valable ${company.payment_delay || 30} jours à compter de sa date d'émission.`, 20, finalY + 62);
  doc.text('Pour acceptation, retournez ce devis signé avec la mention "Bon pour accord".', 20, finalY + 68);
  
  // Signature zone
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text('Signature client (précédée de "Bon pour accord"):', 20, finalY + 80);
  
  doc.setDrawColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, finalY + 85, 80, 25, 2, 2);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Date:', 110, finalY + 95);
  doc.line(125, finalY + 95, 180, finalY + 95);
  
  // Footer
  doc.setFillColor(240, 253, 250);
  doc.rect(0, 272, 210, 25, 'F');
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  let footerY = 278;
  const footerLines: string[] = [];
  
  let companyLine = company.name;
  if (company.legal_form) companyLine += ` - ${company.legal_form}`;
  if (company.capital) companyLine += ` au capital de ${company.capital} €`;
  footerLines.push(companyLine);
  
  const legalLine = [];
  if (company.siret) legalLine.push(`SIRET: ${company.siret}`);
  if (company.rcs) legalLine.push(`RCS: ${company.rcs}`);
  if (company.ape_code) legalLine.push(`Code APE: ${company.ape_code}`);
  if (company.tva_number) legalLine.push(`N° TVA: ${company.tva_number}`);
  
  if (legalLine.length > 0) footerLines.push(legalLine.join(' • '));
  
  footerLines.forEach((line, i) => {
    doc.text(line, 105, footerY + (i * 4), { align: 'center' });
  });
  
  doc.save(`${quote.quote_number}.pdf`);
}
