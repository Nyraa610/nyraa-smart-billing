import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/hooks/useSupabaseInvoices';
import { Quote } from '@/hooks/useSupabaseQuotes';
import { CompanyInfo } from '@/hooks/useSupabaseCompanyInfo';

// Couleurs Nyraa Digital - Style Premium
const COLORS = {
  primary: { r: 139, g: 92, b: 246 },      // Violet Nyraa
  secondary: { r: 168, g: 85, b: 247 },    // Violet clair
  accent: { r: 236, g: 72, b: 153 },       // Rose/Magenta
  dark: { r: 15, g: 15, b: 20 },           // Fond très sombre
  text: { r: 30, g: 30, b: 35 },           // Texte principal
  muted: { r: 100, g: 100, b: 110 },       // Texte secondaire
  light: { r: 250, g: 250, b: 252 },       // Fond clair
  white: { r: 255, g: 255, b: 255 },
};

function drawRoundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, color: {r: number, g: number, b: number}) {
  doc.setFillColor(color.r, color.g, color.b);
  doc.roundedRect(x, y, w, h, r, r, 'F');
}

function addNyraaHeader(doc: jsPDF, company: CompanyInfo, documentType: 'FACTURE' | 'DEVIS') {
  // Fond dégradé premium
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(0, 0, 210, 55, 'F');
  
  // Bande accent en bas du header
  doc.setFillColor(COLORS.accent.r, COLORS.accent.g, COLORS.accent.b);
  doc.rect(0, 52, 210, 3, 'F');
  
  // Nom de l'entreprise - Grand et bold
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name.toUpperCase(), 20, 25);
  
  // Infos entreprise sous le nom
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const headerLines = [];
  if (company.address) headerLines.push(company.address);
  if (company.postal_code || company.city) headerLines.push(`${company.postal_code || ''} ${company.city || ''}`.trim());
  headerLines.forEach((line, i) => {
    doc.text(line, 20, 34 + (i * 6));
  });
  
  // Contact
  if (company.phone || company.email) {
    const contactInfo = [];
    if (company.phone) contactInfo.push(company.phone);
    if (company.email) contactInfo.push(company.email);
    doc.text(contactInfo.join(' • '), 20, 48);
  }
  
  // Badge du type de document
  const badgeColor = documentType === 'FACTURE' ? COLORS.white : { r: 240, g: 240, b: 245 };
  drawRoundedRect(doc, 145, 15, 50, 25, 4, badgeColor);
  
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(documentType, 170, 31, { align: 'center' });
}

export function generateInvoicePDF(invoice: Invoice, company: CompanyInfo): void {
  const doc = new jsPDF();
  
  // Header Nyraa
  addNyraaHeader(doc, company, 'FACTURE');
  
  // Numéro et dates - Card élégante
  drawRoundedRect(doc, 130, 60, 65, 35, 4, { r: 248, g: 248, b: 252 });
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(130, 60, 65, 35, 4, 4, 'S');
  
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`N° ${invoice.invoice_number}`, 162.5, 72, { align: 'center' });
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(invoice.issue_date).toLocaleDateString('fr-FR')}`, 162.5, 82, { align: 'center' });
  doc.text(`Échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}`, 162.5, 90, { align: 'center' });
  
  // Section Émetteur
  drawRoundedRect(doc, 20, 60, 4, 35, 2, COLORS.primary);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR', 28, 68);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  let y = 76;
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(company.name, 28, y); y += 5;
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  if (company.address) { doc.text(company.address, 28, y); y += 5; }
  if (company.postal_code || company.city) { doc.text(`${company.postal_code || ''} ${company.city || ''}`.trim(), 28, y); y += 5; }
  if (company.siret) { doc.text(`SIRET: ${company.siret}`, 28, y); y += 5; }
  if (company.tva_number) { doc.text(`TVA: ${company.tva_number}`, 28, y); }
  
  // Section Client
  const clientStartY = 105;
  drawRoundedRect(doc, 20, clientStartY, 4, 35, 2, COLORS.accent);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 28, clientStartY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let clientY = clientStartY + 16;
  const clientName = invoice.client?.name || 'Client';
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(clientName, 28, clientY); clientY += 5;
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  if (invoice.client?.address) { doc.text(invoice.client.address, 28, clientY); clientY += 5; }
  if (invoice.client?.postal_code || invoice.client?.city) { 
    doc.text(`${invoice.client?.postal_code || ''} ${invoice.client?.city || ''}`.trim(), 28, clientY); 
    clientY += 5; 
  }
  if (invoice.client?.email) { doc.text(invoice.client.email, 28, clientY); clientY += 5; }
  if (invoice.client?.siret) { doc.text(`SIRET: ${invoice.client.siret}`, 28, clientY); }
  
  // Tableau des prestations
  const tableStartY = 150;
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
      fillColor: [COLORS.primary.r, COLORS.primary.g, COLORS.primary.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 10,
      lineColor: [230, 230, 235],
      lineWidth: 0.3,
    },
    bodyStyles: {
      textColor: [COLORS.text.r, COLORS.text.g, COLORS.text.b],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
  });
  
  // Totaux - Card premium
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  drawRoundedRect(doc, 115, finalY - 5, 80, 55, 6, { r: 250, g: 250, b: 252 });
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(1);
  doc.roundedRect(115, finalY - 5, 80, 55, 6, 6, 'S');
  
  doc.setFontSize(10);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text('Total HT', 122, finalY + 8);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`${Number(invoice.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 188, finalY + 8, { align: 'right' });
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(`TVA (${company.tax_rate || 20}%)`, 122, finalY + 18);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`${Number(invoice.tax).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 188, finalY + 18, { align: 'right' });
  
  // Ligne de séparation gradient
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(1.5);
  doc.line(122, finalY + 25, 188, finalY + 25);
  
  // Total TTC - Grand et premium
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text('Total TTC', 122, finalY + 40);
  doc.text(`${Number(invoice.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 188, finalY + 40, { align: 'right' });
  
  // Conditions de paiement
  const conditionsY = finalY + 65;
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS DE PAIEMENT', 20, conditionsY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(`Paiement à ${company.payment_delay || 30} jours à compter de la date de facture.`, 20, conditionsY + 7);
  doc.text('En cas de retard, pénalités de 3x le taux d\'intérêt légal + indemnité forfaitaire de 40€.', 20, conditionsY + 13);
  
  // Coordonnées bancaires
  if (company.iban || company.bic) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.text('COORDONNÉES BANCAIRES', 20, conditionsY + 25);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    let bankY = conditionsY + 32;
    if (company.bank_name) { doc.text(`Banque: ${company.bank_name}`, 20, bankY); bankY += 5; }
    if (company.iban) { doc.text(`IBAN: ${company.iban}`, 20, bankY); bankY += 5; }
    if (company.bic) { doc.text(`BIC: ${company.bic}`, 20, bankY); }
  }
  
  // Footer premium
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(0, 280, 210, 17, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  let footerText = company.name;
  if (company.legal_form) footerText += ` • ${company.legal_form}`;
  if (company.capital) footerText += ` • Capital: ${company.capital} €`;
  if (company.siret) footerText += ` • SIRET: ${company.siret}`;
  
  doc.text(footerText, 105, 287, { align: 'center' });
  doc.text('TVA non applicable, art. 293 B du CGI', 105, 293, { align: 'center' });
  
  doc.save(`${invoice.invoice_number}.pdf`);
}

export function generateQuotePDF(quote: Quote, company: CompanyInfo): void {
  const doc = new jsPDF();
  
  // Header Nyraa
  addNyraaHeader(doc, company, 'DEVIS');
  
  // Numéro et dates - Card élégante
  drawRoundedRect(doc, 130, 60, 65, 35, 4, { r: 248, g: 248, b: 252 });
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(0.5);
  doc.roundedRect(130, 60, 65, 35, 4, 4, 'S');
  
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`N° ${quote.quote_number}`, 162.5, 72, { align: 'center' });
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${new Date(quote.issue_date).toLocaleDateString('fr-FR')}`, 162.5, 82, { align: 'center' });
  doc.text(`Valide: ${new Date(quote.valid_until).toLocaleDateString('fr-FR')}`, 162.5, 90, { align: 'center' });
  
  // Section Émetteur
  drawRoundedRect(doc, 20, 60, 4, 35, 2, COLORS.primary);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('ÉMETTEUR', 28, 68);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let y = 76;
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(company.name, 28, y); y += 5;
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  if (company.address) { doc.text(company.address, 28, y); y += 5; }
  if (company.postal_code || company.city) { doc.text(`${company.postal_code || ''} ${company.city || ''}`.trim(), 28, y); y += 5; }
  if (company.siret) { doc.text(`SIRET: ${company.siret}`, 28, y); y += 5; }
  if (company.tva_number) { doc.text(`TVA: ${company.tva_number}`, 28, y); }
  
  // Section Client
  const clientStartY = 105;
  drawRoundedRect(doc, 20, clientStartY, 4, 35, 2, COLORS.accent);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT', 28, clientStartY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let clientY = clientStartY + 16;
  const clientName = quote.client?.name || 'Client';
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(clientName, 28, clientY); clientY += 5;
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  if (quote.client?.address) { doc.text(quote.client.address, 28, clientY); clientY += 5; }
  if (quote.client?.postal_code || quote.client?.city) { 
    doc.text(`${quote.client?.postal_code || ''} ${quote.client?.city || ''}`.trim(), 28, clientY); 
    clientY += 5; 
  }
  if (quote.client?.email) { doc.text(quote.client.email, 28, clientY); clientY += 5; }
  if (quote.client?.siret) { doc.text(`SIRET: ${quote.client.siret}`, 28, clientY); }
  
  // Tableau des prestations
  const tableStartY = 150;
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
      fillColor: [COLORS.primary.r, COLORS.primary.g, COLORS.primary.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 10,
      lineColor: [230, 230, 235],
      lineWidth: 0.3,
    },
    bodyStyles: {
      textColor: [COLORS.text.r, COLORS.text.g, COLORS.text.b],
    },
    alternateRowStyles: {
      fillColor: [250, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 40, halign: 'right' },
    },
  });
  
  // Totaux - Card premium
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  drawRoundedRect(doc, 115, finalY - 5, 80, 55, 6, { r: 250, g: 250, b: 252 });
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(1);
  doc.roundedRect(115, finalY - 5, 80, 55, 6, 6, 'S');
  
  doc.setFontSize(10);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text('Total HT', 122, finalY + 8);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`${Number(quote.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 188, finalY + 8, { align: 'right' });
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(`TVA (${company.tax_rate || 20}%)`, 122, finalY + 18);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`${Number(quote.tax).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 188, finalY + 18, { align: 'right' });
  
  // Ligne de séparation gradient
  doc.setDrawColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.setLineWidth(1.5);
  doc.line(122, finalY + 25, 188, finalY + 25);
  
  // Total TTC - Grand et premium
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.text('Total TTC', 122, finalY + 40);
  doc.text(`${Number(quote.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 188, finalY + 40, { align: 'right' });
  
  // Conditions
  const conditionsY = finalY + 65;
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS', 20, conditionsY);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(`Ce devis est valable ${company.payment_delay || 30} jours à compter de sa date d'émission.`, 20, conditionsY + 7);
  doc.text('Pour acceptation, retournez ce devis signé avec la mention "Bon pour accord".', 20, conditionsY + 13);
  
  // Zone signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text('Signature client (précédée de "Bon pour accord"):', 20, conditionsY + 28);
  
  doc.setDrawColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setLineWidth(0.3);
  doc.roundedRect(20, conditionsY + 33, 80, 25, 2, 2);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Date:', 110, conditionsY + 45);
  doc.line(125, conditionsY + 45, 180, conditionsY + 45);
  
  // Footer premium
  doc.setFillColor(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b);
  doc.rect(0, 280, 210, 17, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  let footerText = company.name;
  if (company.legal_form) footerText += ` • ${company.legal_form}`;
  if (company.capital) footerText += ` • Capital: ${company.capital} €`;
  if (company.siret) footerText += ` • SIRET: ${company.siret}`;
  
  doc.text(footerText, 105, 287, { align: 'center' });
  doc.text('Devis non contractuel jusqu\'à signature', 105, 293, { align: 'center' });
  
  doc.save(`${quote.quote_number}.pdf`);
}
