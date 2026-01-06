import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/hooks/useSupabaseInvoices';
import { Quote } from '@/hooks/useSupabaseQuotes';
import { CompanyInfo } from '@/hooks/useSupabaseCompanyInfo';

// Couleurs du template
const COLORS = {
  blue: { r: 41, g: 128, b: 185 },         // Bleu pour titres
  orange: { r: 230, g: 126, b: 34 },       // Orange pour valeurs importantes
  text: { r: 50, g: 50, b: 50 },           // Texte principal
  muted: { r: 120, g: 120, b: 120 },       // Texte secondaire
  lightGray: { r: 240, g: 240, b: 240 },   // Lignes et fonds
};

export function generateInvoicePDF(invoice: Invoice, company: CompanyInfo): void {
  const doc = new jsPDF();
  const pageWidth = 210;
  const margin = 20;
  
  // === EN-TÊTE ENTREPRISE (haut droite) ===
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  
  let companyY = 20;
  if (company.legal_form) {
    doc.text(company.legal_form, pageWidth - margin, companyY, { align: 'right' });
    companyY += 5;
  }
  doc.setFont('helvetica', 'bold');
  doc.text(company.name.toUpperCase(), pageWidth - margin, companyY, { align: 'right' });
  companyY += 5;
  doc.setFont('helvetica', 'normal');
  
  if (company.address) {
    doc.text(company.address.toUpperCase(), pageWidth - margin, companyY, { align: 'right' });
    companyY += 5;
  }
  if (company.postal_code || company.city) {
    doc.text(`${company.postal_code || ''} ${company.city || ''} - FRANCE`.toUpperCase().trim(), pageWidth - margin, companyY, { align: 'right' });
  }
  
  // === DESTINATAIRE (gauche) ===
  let destY = 55;
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DESTINATAIRE', margin, destY);
  destY += 8;
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(10);
  
  const clientName = invoice.client?.name || 'Client';
  doc.setFont('helvetica', 'bold');
  doc.text(clientName, margin, destY);
  destY += 5;
  doc.setFont('helvetica', 'normal');
  
  if (invoice.client?.address) {
    doc.text(invoice.client.address, margin, destY);
    destY += 5;
  }
  if (invoice.client?.postal_code || invoice.client?.city) {
    doc.text(`${invoice.client?.postal_code || ''} ${invoice.client?.city || ''} - FRA`.trim(), margin, destY);
    destY += 5;
  }
  if ((invoice.client as any)?.phone) {
    doc.text(`Tél.: ${(invoice.client as any).phone}`, margin, destY);
    destY += 5;
  }
  if (invoice.client?.email) {
    doc.text(`Mail : ${invoice.client.email}`, margin, destY);
    destY += 6;
  }
  if (invoice.client?.siret) {
    doc.text(`Siren : ${invoice.client.siret.substring(0, 9)}`, margin, destY);
    destY += 5;
  }
  if (invoice.client?.tva_number) {
    doc.text(`N° TVA intra.: ${invoice.client.tva_number}`, margin, destY);
  }
  
  // === FACTURE (droite) ===
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', pageWidth - margin, 55, { align: 'right' });
  
  doc.setTextColor(COLORS.orange.r, COLORS.orange.g, COLORS.orange.b);
  doc.setFontSize(11);
  doc.text(`N°${invoice.invoice_number}`, pageWidth - margin, 63, { align: 'right' });
  
  // Titre facture (si notes)
  if (invoice.notes) {
    doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.notes.toUpperCase(), pageWidth - margin, 72, { align: 'right' });
  }
  
  // === DATES ===
  const datesY = 105;
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("Date d'émission", margin, datesY);
  doc.setTextColor(COLORS.orange.r, COLORS.orange.g, COLORS.orange.b);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoice.issue_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), margin, datesY + 5);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFont('helvetica', 'bold');
  doc.text("Date d'échéance", margin + 55, datesY);
  doc.setTextColor(COLORS.orange.r, COLORS.orange.g, COLORS.orange.b);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(invoice.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), margin + 55, datesY + 5);
  
  // === TABLEAU DES PRESTATIONS ===
  const tableStartY = 125;
  
  // En-tête du tableau
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.setLineWidth(0.5);
  doc.line(margin, tableStartY, pageWidth - margin, tableStartY);
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Qté', 130, tableStartY + 5);
  doc.text('Prix unit. HT', 148, tableStartY + 5);
  doc.text('Total HT', pageWidth - margin, tableStartY + 5, { align: 'right' });
  
  doc.line(margin, tableStartY + 8, pageWidth - margin, tableStartY + 8);
  
  // Lignes du tableau
  let tableY = tableStartY + 18;
  invoice.items.forEach((item, index) => {
    // Ligne de séparation
    if (index > 0) {
      doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.line(margin, tableY - 5, pageWidth - margin, tableY - 5);
    }
    
    // Description
    doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(item.description, margin, tableY);
    
    // Sous-description (si disponible dans notes ou autre)
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    // doc.text('description détaillée', margin, tableY + 5);
    
    // Valeurs
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(item.quantity.toString(), 135, tableY, { align: 'center' });
    doc.text(`${item.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 165, tableY, { align: 'right' });
    
    doc.setTextColor(COLORS.orange.r, COLORS.orange.g, COLORS.orange.b);
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, pageWidth - margin, tableY, { align: 'right' });
    
    tableY += 18;
  });
  
  // Ligne de fin de tableau
  doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.line(margin, tableY - 5, pageWidth - margin, tableY - 5);
  
  // === TOTAUX ===
  const totalsY = tableY + 5;
  
  // Total HT
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total HT', 140, totalsY);
  doc.setTextColor(COLORS.orange.r, COLORS.orange.g, COLORS.orange.b);
  doc.text(`${Number(invoice.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, pageWidth - margin, totalsY, { align: 'right' });
  
  // Ligne de séparation
  doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.line(130, totalsY + 5, pageWidth - margin, totalsY + 5);
  
  // TOTAL
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 140, totalsY + 15);
  doc.setTextColor(COLORS.orange.r, COLORS.orange.g, COLORS.orange.b);
  doc.setFontSize(14);
  doc.text(`${Number(invoice.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, pageWidth - margin, totalsY + 15, { align: 'right' });
  
  // === CONDITIONS ===
  const conditionsY = totalsY + 35;
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS', margin, conditionsY);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const conditionsText = `Aucun escompte consenti pour règlement anticipé.En cas de retard de paiement, une pénalité de 3 fois le taux d'intérêt légal sera appliquée, à laquelle s'ajoutera une indemnité forfaitaire pour frais de recouvrement de 40€.`;
  const conditionsLines = doc.splitTextToSize(conditionsText, pageWidth - 2 * margin);
  doc.text(conditionsLines, margin, conditionsY + 7);
  
  doc.setFontSize(9);
  doc.text('TVA non applicable, art. 293 B du CGI', margin, conditionsY + 20);
  
  // === PIED DE PAGE ===
  const footerY = 285;
  doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  let footerText = '';
  if (company.siret) footerText += `SIRET ${company.siret}`;
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  
  if (company.tva_number) {
    doc.text(`TVA intracommunautaire : ${company.tva_number}`, pageWidth / 2, footerY + 4, { align: 'center' });
  }
  
  // Numéro de page
  doc.text('Page 1/1', pageWidth - margin, footerY, { align: 'right' });
  
  doc.save(`${invoice.invoice_number}.pdf`);
}

export function generateQuotePDF(quote: Quote, company: CompanyInfo): void {
  const doc = new jsPDF();
  const pageWidth = 210;
  const margin = 20;
  
  // === EN-TÊTE ENTREPRISE (haut droite) ===
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  
  let companyY = 20;
  if (company.legal_form) {
    doc.text(company.legal_form, pageWidth - margin, companyY, { align: 'right' });
    companyY += 5;
  }
  doc.setFont('helvetica', 'bold');
  doc.text(company.name.toUpperCase(), pageWidth - margin, companyY, { align: 'right' });
  companyY += 5;
  doc.setFont('helvetica', 'normal');
  
  if (company.address) {
    doc.text(company.address.toUpperCase(), pageWidth - margin, companyY, { align: 'right' });
    companyY += 5;
  }
  if (company.postal_code || company.city) {
    doc.text(`${company.postal_code || ''} ${company.city || ''} - FRANCE`.toUpperCase().trim(), pageWidth - margin, companyY, { align: 'right' });
  }
  
  // === DESTINATAIRE (gauche) ===
  let destY = 55;
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DESTINATAIRE', margin, destY);
  destY += 8;
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(10);
  
  const clientName = quote.client?.name || 'Client';
  doc.setFont('helvetica', 'bold');
  doc.text(clientName, margin, destY);
  destY += 5;
  doc.setFont('helvetica', 'normal');
  
  if (quote.client?.address) {
    doc.text(quote.client.address, margin, destY);
    destY += 5;
  }
  if (quote.client?.postal_code || quote.client?.city) {
    doc.text(`${quote.client?.postal_code || ''} ${quote.client?.city || ''} - FRA`.trim(), margin, destY);
    destY += 5;
  }
  if ((quote.client as any)?.phone) {
    doc.text(`Tél.: ${(quote.client as any).phone}`, margin, destY);
    destY += 5;
  }
  if (quote.client?.email) {
    doc.text(`Mail : ${quote.client.email}`, margin, destY);
    destY += 6;
  }
  if (quote.client?.siret) {
    doc.text(`Siren : ${quote.client.siret.substring(0, 9)}`, margin, destY);
    destY += 5;
  }
  if (quote.client?.tva_number) {
    doc.text(`N° TVA intra.: ${quote.client.tva_number}`, margin, destY);
  }
  
  // === DEVIS (droite) ===
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', pageWidth - margin, 55, { align: 'right' });
  
  doc.setTextColor(COLORS.orange.r, COLORS.orange.g, COLORS.orange.b);
  doc.setFontSize(11);
  doc.text(`N°${quote.quote_number}`, pageWidth - margin, 63, { align: 'right' });
  
  // Titre devis (si notes)
  if (quote.notes) {
    doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(quote.notes.toUpperCase(), pageWidth - margin, 72, { align: 'right' });
  }
  
  // === DATES ===
  const datesY = 105;
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text("Date d'émission", margin, datesY);
  doc.setTextColor(COLORS.orange.r, COLORS.orange.g, COLORS.orange.b);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(quote.issue_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), margin, datesY + 5);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFont('helvetica', 'bold');
  doc.text("Date de validité", margin + 55, datesY);
  doc.setTextColor(COLORS.orange.r, COLORS.orange.g, COLORS.orange.b);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(quote.valid_until).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }), margin + 55, datesY + 5);
  
  // === TABLEAU DES PRESTATIONS ===
  const tableStartY = 125;
  
  // En-tête du tableau
  doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.setLineWidth(0.5);
  doc.line(margin, tableStartY, pageWidth - margin, tableStartY);
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Qté', 130, tableStartY + 5);
  doc.text('Prix unit. HT', 148, tableStartY + 5);
  doc.text('Total HT', pageWidth - margin, tableStartY + 5, { align: 'right' });
  
  doc.line(margin, tableStartY + 8, pageWidth - margin, tableStartY + 8);
  
  // Lignes du tableau
  let tableY = tableStartY + 18;
  quote.items.forEach((item, index) => {
    if (index > 0) {
      doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
      doc.line(margin, tableY - 5, pageWidth - margin, tableY - 5);
    }
    
    doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(item.description, margin, tableY);
    
    doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(item.quantity.toString(), 135, tableY, { align: 'center' });
    doc.text(`${item.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 165, tableY, { align: 'right' });
    
    doc.setTextColor(COLORS.orange.r, COLORS.orange.g, COLORS.orange.b);
    doc.setFont('helvetica', 'bold');
    doc.text(`${item.total.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, pageWidth - margin, tableY, { align: 'right' });
    
    tableY += 18;
  });
  
  doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.line(margin, tableY - 5, pageWidth - margin, tableY - 5);
  
  // === TOTAUX ===
  const totalsY = tableY + 5;
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Total HT', 140, totalsY);
  doc.setTextColor(COLORS.orange.r, COLORS.orange.g, COLORS.orange.b);
  doc.text(`${Number(quote.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, pageWidth - margin, totalsY, { align: 'right' });
  
  doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.line(130, totalsY + 5, pageWidth - margin, totalsY + 5);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', 140, totalsY + 15);
  doc.setTextColor(COLORS.orange.r, COLORS.orange.g, COLORS.orange.b);
  doc.setFontSize(14);
  doc.text(`${Number(quote.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, pageWidth - margin, totalsY + 15, { align: 'right' });
  
  // === CONDITIONS ===
  const conditionsY = totalsY + 35;
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS', margin, conditionsY);
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Ce devis est valable ${company.payment_delay || 30} jours à compter de sa date d'émission.`, margin, conditionsY + 7);
  doc.text('Pour acceptation, retournez ce devis signé avec la mention "Bon pour accord".', margin, conditionsY + 13);
  
  doc.setFontSize(9);
  doc.text('TVA non applicable, art. 293 B du CGI', margin, conditionsY + 22);
  
  // Zone signature
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFont('helvetica', 'bold');
  doc.text('Signature (précédée de "Bon pour accord"):', margin, conditionsY + 35);
  
  doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.setLineWidth(0.5);
  doc.rect(margin, conditionsY + 40, 80, 25);
  
  doc.setFont('helvetica', 'normal');
  doc.text('Date:', margin + 90, conditionsY + 55);
  doc.line(margin + 105, conditionsY + 55, margin + 160, conditionsY + 55);
  
  // === PIED DE PAGE ===
  const footerY = 285;
  doc.setDrawColor(COLORS.lightGray.r, COLORS.lightGray.g, COLORS.lightGray.b);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  let footerText = '';
  if (company.siret) footerText += `SIRET ${company.siret}`;
  doc.text(footerText, pageWidth / 2, footerY, { align: 'center' });
  
  if (company.tva_number) {
    doc.text(`TVA intracommunautaire : ${company.tva_number}`, pageWidth / 2, footerY + 4, { align: 'center' });
  }
  
  doc.text('Page 1/1', pageWidth - margin, footerY, { align: 'right' });
  
  doc.save(`${quote.quote_number}.pdf`);
}
