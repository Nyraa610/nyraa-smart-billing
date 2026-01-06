import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/hooks/useSupabaseInvoices';
import { Quote } from '@/hooks/useSupabaseQuotes';
import { CompanyInfo } from '@/hooks/useSupabaseCompanyInfo';

// Couleurs du template
const COLORS = {
  blue: { r: 0, g: 112, b: 192 },           // Bleu principal
  lightBlue: { r: 221, g: 235, b: 247 },    // Bleu clair pour fond
  text: { r: 0, g: 0, b: 0 },               // Texte noir
  muted: { r: 100, g: 100, b: 100 },        // Texte gris
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
}

export function generateInvoicePDF(invoice: Invoice, company: CompanyInfo): void {
  const doc = new jsPDF();
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  
  // === EN-TÊTE ENTREPRISE (gauche) ===
  let yPos = 20;
  
  // Nom entreprise en bleu gras
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name.toUpperCase(), margin, yPos);
  yPos += 7;
  
  // Infos entreprise en bleu normal
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (company.legal_form) {
    doc.text(company.legal_form, margin, yPos);
    yPos += 5;
  }
  
  if (company.address) {
    doc.text(company.address, margin, yPos);
    yPos += 5;
  }
  
  if (company.postal_code || company.city) {
    doc.text(`${company.postal_code || ''} ${company.city || ''}`.trim(), margin, yPos);
    yPos += 5;
  }
  
  if (company.siret) {
    doc.text(`SIRET : ${company.siret}`, margin, yPos);
    yPos += 5;
  }
  
  // === FACTURE (droite) ===
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth - margin, 20, { align: 'right' });
  
  // Infos facture à droite
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`N° : ${invoice.invoice_number}`, pageWidth - margin, 30, { align: 'right' });
  doc.text(`Date : ${formatDate(invoice.issue_date)}`, pageWidth - margin, 36, { align: 'right' });
  doc.text(`Échéance : ${formatDate(invoice.due_date)}`, pageWidth - margin, 42, { align: 'right' });
  
  // === ENCADRÉ CLIENT ===
  const clientBoxY = 60;
  const clientBoxHeight = 35;
  
  // Bordure bleue gauche
  doc.setDrawColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setLineWidth(3);
  doc.line(margin, clientBoxY, margin, clientBoxY + clientBoxHeight);
  
  // Bordures fines
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, clientBoxY, pageWidth - margin, clientBoxY); // haut
  doc.line(margin, clientBoxY + clientBoxHeight, pageWidth - margin, clientBoxY + clientBoxHeight); // bas
  doc.line(pageWidth - margin, clientBoxY, pageWidth - margin, clientBoxY + clientBoxHeight); // droite
  
  // Contenu client
  let clientY = clientBoxY + 8;
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Facturer à :', margin + 5, clientY);
  clientY += 7;
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFont('helvetica', 'bold');
  const clientName = invoice.client?.name || 'Client';
  doc.text(clientName, margin + 5, clientY);
  clientY += 5;
  
  doc.setFont('helvetica', 'normal');
  if (invoice.client?.address) {
    doc.text(invoice.client.address, margin + 5, clientY);
    clientY += 5;
  }
  if (invoice.client?.postal_code || invoice.client?.city) {
    doc.text(`${invoice.client?.postal_code || ''} ${invoice.client?.city || ''}`.trim(), margin + 5, clientY);
  }
  
  // === TABLEAU DES PRESTATIONS ===
  const tableStartY = clientBoxY + clientBoxHeight + 15;
  
  // Préparer les données du tableau
  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.total)
  ]);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Désignation', 'Quantité', 'Prix unitaire HT', 'Total HT']],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: [COLORS.text.r, COLORS.text.g, COLORS.text.b],
    },
    headStyles: {
      fillColor: [COLORS.blue.r, COLORS.blue.g, COLORS.blue.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: margin, right: margin },
  });
  
  // @ts-ignore - autoTable ajoute cette propriété
  let finalY = doc.lastAutoTable.finalY + 10;
  
  // === TOTAUX ===
  const totalsX = 130;
  
  // Total HT
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Total HT :', totalsX, finalY);
  doc.text(formatCurrency(Number(invoice.subtotal)), pageWidth - margin, finalY, { align: 'right' });
  finalY += 8;
  
  // Mention TVA
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text('TVA non applicable, art. 293 B du CGI', totalsX, finalY);
  finalY += 10;
  
  // Total TTC
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total TTC :', totalsX, finalY);
  doc.text(formatCurrency(Number(invoice.total)), pageWidth - margin, finalY, { align: 'right' });
  finalY += 20;
  
  // === ENCADRÉ INFORMATIONS DE PAIEMENT ===
  const paymentBoxY = finalY;
  const paymentBoxHeight = 50;
  
  // Fond bleu clair
  doc.setFillColor(COLORS.lightBlue.r, COLORS.lightBlue.g, COLORS.lightBlue.b);
  doc.rect(margin, paymentBoxY, contentWidth, paymentBoxHeight, 'F');
  
  // Bordure bleue gauche
  doc.setDrawColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setLineWidth(3);
  doc.line(margin, paymentBoxY, margin, paymentBoxY + paymentBoxHeight);
  
  // Contenu
  let paymentY = paymentBoxY + 10;
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Informations de paiement', margin + 5, paymentY);
  paymentY += 8;
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  doc.setFont('helvetica', 'bold');
  doc.text('Conditions de paiement : ', margin + 5, paymentY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${company.payment_delay || 30} jours à réception`, margin + 55, paymentY);
  paymentY += 5;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Mode de paiement : ', margin + 5, paymentY);
  doc.setFont('helvetica', 'normal');
  doc.text('Virement bancaire', margin + 45, paymentY);
  paymentY += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('Coordonnées bancaires :', margin + 5, paymentY);
  paymentY += 5;
  
  doc.setFont('helvetica', 'normal');
  if (company.iban) {
    doc.text(`IBAN : ${company.iban}`, margin + 5, paymentY);
    paymentY += 4;
  }
  if (company.bic) {
    doc.text(`BIC : ${company.bic}`, margin + 5, paymentY);
    paymentY += 4;
  }
  if (company.bank_name) {
    doc.text(`Banque : ${company.bank_name}`, margin + 5, paymentY);
  }
  
  doc.save(`${invoice.invoice_number}.pdf`);
}

export function generateQuotePDF(quote: Quote, company: CompanyInfo): void {
  const doc = new jsPDF();
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  
  // === EN-TÊTE ENTREPRISE (gauche) ===
  let yPos = 20;
  
  // Nom entreprise en bleu gras
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(company.name.toUpperCase(), margin, yPos);
  yPos += 7;
  
  // Infos entreprise en bleu normal
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  if (company.legal_form) {
    doc.text(company.legal_form, margin, yPos);
    yPos += 5;
  }
  
  if (company.address) {
    doc.text(company.address, margin, yPos);
    yPos += 5;
  }
  
  if (company.postal_code || company.city) {
    doc.text(`${company.postal_code || ''} ${company.city || ''}`.trim(), margin, yPos);
    yPos += 5;
  }
  
  if (company.siret) {
    doc.text(`SIRET : ${company.siret}`, margin, yPos);
    yPos += 5;
  }
  
  // === DEVIS (droite) ===
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', pageWidth - margin, 20, { align: 'right' });
  
  // Infos devis à droite
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`N° : ${quote.quote_number}`, pageWidth - margin, 30, { align: 'right' });
  doc.text(`Date : ${formatDate(quote.issue_date)}`, pageWidth - margin, 36, { align: 'right' });
  doc.text(`Validité : ${formatDate(quote.valid_until)}`, pageWidth - margin, 42, { align: 'right' });
  
  // === ENCADRÉ CLIENT ===
  const clientBoxY = 60;
  const clientBoxHeight = 35;
  
  // Bordure bleue gauche
  doc.setDrawColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setLineWidth(3);
  doc.line(margin, clientBoxY, margin, clientBoxY + clientBoxHeight);
  
  // Bordures fines
  doc.setLineWidth(0.5);
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, clientBoxY, pageWidth - margin, clientBoxY);
  doc.line(margin, clientBoxY + clientBoxHeight, pageWidth - margin, clientBoxY + clientBoxHeight);
  doc.line(pageWidth - margin, clientBoxY, pageWidth - margin, clientBoxY + clientBoxHeight);
  
  // Contenu client
  let clientY = clientBoxY + 8;
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Destinataire :', margin + 5, clientY);
  clientY += 7;
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFont('helvetica', 'bold');
  const clientName = quote.client?.name || 'Client';
  doc.text(clientName, margin + 5, clientY);
  clientY += 5;
  
  doc.setFont('helvetica', 'normal');
  if (quote.client?.address) {
    doc.text(quote.client.address, margin + 5, clientY);
    clientY += 5;
  }
  if (quote.client?.postal_code || quote.client?.city) {
    doc.text(`${quote.client?.postal_code || ''} ${quote.client?.city || ''}`.trim(), margin + 5, clientY);
  }
  
  // === TABLEAU DES PRESTATIONS ===
  const tableStartY = clientBoxY + clientBoxHeight + 15;
  
  const tableData = quote.items.map(item => [
    item.description,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.total)
  ]);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['Désignation', 'Quantité', 'Prix unitaire HT', 'Total HT']],
    body: tableData,
    theme: 'plain',
    styles: {
      fontSize: 10,
      cellPadding: 5,
      textColor: [COLORS.text.r, COLORS.text.g, COLORS.text.b],
    },
    headStyles: {
      fillColor: [COLORS.blue.r, COLORS.blue.g, COLORS.blue.b],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    columnStyles: {
      0: { cellWidth: 80 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: margin, right: margin },
  });
  
  // @ts-ignore
  let finalY = doc.lastAutoTable.finalY + 10;
  
  // === TOTAUX ===
  const totalsX = 130;
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Total HT :', totalsX, finalY);
  doc.text(formatCurrency(Number(quote.subtotal)), pageWidth - margin, finalY, { align: 'right' });
  finalY += 8;
  
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text('TVA non applicable, art. 293 B du CGI', totalsX, finalY);
  finalY += 10;
  
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Total TTC :', totalsX, finalY);
  doc.text(formatCurrency(Number(quote.total)), pageWidth - margin, finalY, { align: 'right' });
  finalY += 20;
  
  // === CONDITIONS ===
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ce devis est valable ${company.payment_delay || 30} jours à compter de sa date d'émission.`, margin, finalY);
  finalY += 5;
  doc.text('Pour acceptation, retournez ce devis signé avec la mention "Bon pour accord".', margin, finalY);
  finalY += 15;
  
  // Zone signature
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFont('helvetica', 'bold');
  doc.text('Signature (précédée de "Bon pour accord") :', margin, finalY);
  finalY += 5;
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(margin, finalY, 80, 25);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Date :', margin + 90, finalY + 15);
  doc.line(margin + 105, finalY + 15, margin + 160, finalY + 15);
  
  doc.save(`${quote.quote_number}.pdf`);
}
