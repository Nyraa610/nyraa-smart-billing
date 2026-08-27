import jsPDF from 'jspdf';
import { layoutRichText } from './richText';
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

export interface PdfOptions {
  lang?: 'fr' | 'en';
  /** Taux de conversion EUR -> devise cible (1 si EUR) */
  rate?: number;
  currency?: 'EUR' | 'USD';
  rateDate?: string;
}

function isEn(o?: PdfOptions) {
  return o?.lang === 'en';
}

function formatDate(dateStr: string, o?: PdfOptions): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString(isEn(o) ? 'en-US' : 'fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(amount: number, o?: PdfOptions): string {
  const rate = o?.rate ?? 1;
  const currency = o?.currency ?? 'EUR';
  const value = amount * rate;
  if (currency === 'USD') {
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/\u202F/g, ' ') + ' €';
}

function T(o: PdfOptions | undefined, fr: string, en: string): string {
  return isEn(o) ? en : fr;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function generateInvoicePDF(invoice: Invoice, company: CompanyInfo, options: PdfOptions = {}): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = 210;
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  
  // === LOGO ENTREPRISE (si présent) ===
  let yPos = 20;
  let logoHeight = 0;
  
  if (company.logo_url) {
    try {
      const img = await loadImage(company.logo_url);
      const maxLogoWidth = 40;
      const maxLogoHeight = 25;
      const ratio = Math.min(maxLogoWidth / img.width, maxLogoHeight / img.height);
      const logoWidth = img.width * ratio;
      logoHeight = img.height * ratio;
      doc.addImage(img, 'PNG', margin, yPos - 5, logoWidth, logoHeight);
      yPos += logoHeight + 5;
    } catch (e) {
      console.error('Error loading logo:', e);
    }
  }
  
  // === EN-TÊTE ENTREPRISE (gauche) ===
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
    doc.text(`${T(options, 'SIRET', 'Company ID (SIRET)')} : ${company.siret}`, margin, yPos);
    yPos += 5;
  }
  
  // === FACTURE (droite) ===
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(T(options, 'FACTURE', 'INVOICE'), pageWidth - margin, 20, { align: 'right' });
  
  // Infos facture à droite
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`${T(options, 'N°', 'No.')} : ${invoice.invoice_number}`, pageWidth - margin, 30, { align: 'right' });
  doc.text(`${T(options, 'Date', 'Date')} : ${formatDate(invoice.issue_date, options)}`, pageWidth - margin, 36, { align: 'right' });
  doc.text(`${T(options, 'Échéance', 'Due date')} : ${formatDate(invoice.due_date, options)}`, pageWidth - margin, 42, { align: 'right' });
  
  // Titre/Objet de la facture
  if (invoice.title) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    doc.text(`${T(options, 'Objet', 'Subject')} : ${invoice.title}`, pageWidth - margin, 48, { align: 'right' });
  }
  
  // === ENCADRÉ CLIENT ===
  // Positionner le bloc client après les infos entreprise avec un minimum
  const clientBoxY = Math.max(yPos + 10, 70);
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
  doc.text(T(options, 'Facturer à :', 'Bill to:'), margin + 5, clientY);
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
    formatCurrency(item.unitPrice, options),
    formatCurrency(item.total, options)
  ]);
  
  autoTable(doc, {
    startY: tableStartY,
    head: [isEn(options) ? ['Description', 'Qty', 'Unit price', 'Amount'] : ['Désignation', 'Quantité', 'Prix unitaire HT', 'Total HT']],
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
  doc.text(T(options, 'Total HT :', 'Subtotal:'), totalsX, finalY);
  doc.text(formatCurrency(Number(invoice.subtotal), options), pageWidth - margin, finalY, { align: 'right' });
  finalY += 8;
  
  // Mention TVA
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(T(options, 'TVA non applicable, art. 293 B du CGI', 'VAT not applicable, art. 293 B of the French tax code'), totalsX, finalY);
  finalY += 10;
  
  // Total TTC
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(T(options, 'Total TTC :', 'Total due:'), totalsX, finalY);
  doc.text(formatCurrency(Number(invoice.total), options), pageWidth - margin, finalY, { align: 'right' });
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
  doc.text(T(options, 'Informations de paiement', 'Payment information'), margin + 5, paymentY);
  paymentY += 8;
  
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  doc.setFont('helvetica', 'bold');
  doc.text(T(options, 'Conditions de paiement : ', 'Payment terms: '), margin + 5, paymentY);
  doc.setFont('helvetica', 'normal');
  doc.text(isEn(options) ? `${company.payment_delay || 30} days from receipt` : `${company.payment_delay || 30} jours à réception`, margin + 55, paymentY);
  paymentY += 5;
  
  doc.setFont('helvetica', 'bold');
  doc.text(T(options, 'Mode de paiement : ', 'Payment method: '), margin + 5, paymentY);
  doc.setFont('helvetica', 'normal');
  doc.text(T(options, 'Virement bancaire', 'Bank transfer'), margin + 45, paymentY);
  paymentY += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text(T(options, 'Coordonnées bancaires :', 'Bank details:'), margin + 5, paymentY);
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
    doc.text(`${T(options, 'Banque', 'Bank')} : ${company.bank_name}`, margin + 5, paymentY);
  }
  
  // === MENTIONS LÉGALES ===
  finalY = paymentBoxY + paymentBoxHeight + 10;
  
  const pageHeight = 297; // A4 height in mm
  const footerSpace = 20; // Espace pour le message Nyraa
  const requiredSpace = 45; // Espace nécessaire pour les mentions légales
  
  // Vérifier si on a assez de place, sinon nouvelle page
  if (finalY + requiredSpace + footerSpace > pageHeight) {
    doc.addPage();
    finalY = 20;
  }
  
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(T(options, 'Mentions légales', 'Legal notices'), margin, finalY);
  finalY += 5;
  
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  
  // Pénalités de retard
  if (isEn(options)) {
    doc.text("• Late payment: late payment penalties apply at three times the legal interest rate, plus a fixed recovery", margin, finalY);
    finalY += 3;
    doc.text("  indemnity of EUR 40 (art. L441-6 and D441-5 of the French Commercial Code).", margin, finalY);
    finalY += 4;
    doc.text("• Early payment discount: no discount is granted for early payment.", margin, finalY);
    finalY += 4;
    doc.text("• Retention of title: goods remain the property of the seller until full payment of the price.", margin, finalY);
    finalY += 4;
    doc.text("• Sole proprietorship: exempt from registration with the trade and companies register.", margin, finalY);
  } else {
  doc.text("• Pénalités de retard : En cas de retard de paiement, des pénalités seront appliquées au taux de trois fois le taux d'intérêt légal, ainsi qu'une", margin, finalY);
  finalY += 3;
  doc.text("  indemnité forfaitaire de recouvrement de 40€ (art. L441-6 et D441-5 du Code de commerce).", margin, finalY);
  finalY += 4;
  
  // Escompte
  doc.text("• Escompte : Aucun escompte ne sera accordé en cas de paiement anticipé.", margin, finalY);
  finalY += 4;
  
  // Réserve de propriété
  doc.text("• Réserve de propriété : Les marchandises demeurent la propriété du vendeur jusqu'au paiement intégral du prix.", margin, finalY);
  finalY += 4;
  
  // Entreprise individuelle
  doc.text("• Entreprise individuelle : Dispensée d'immatriculation au RCS et au répertoire des métiers.", margin, finalY);
  }
  
  // === MESSAGE NYRAA BILLING (en bas de page fixe) ===
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'italic');
  doc.text(T(options, "Facture générée par l'application Nyraa Billing", "Invoice generated by the Nyraa Billing app"), pageWidth / 2, pageHeight - 8, { align: 'center' });
  
  if (options.currency === 'USD' && options.rate) {
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Amounts converted from EUR at the daily rate of ${options.rate.toFixed(4)} USD/EUR${options.rateDate ? ` (${options.rateDate})` : ''}.`,
      pageWidth / 2,
      pageHeight - 13,
      { align: 'center' }
    );
  }

  doc.save(`${invoice.invoice_number}${isEn(options) ? '-EN' : ''}.pdf`);
}

export function generateQuotePDF(quote: Quote, company: CompanyInfo, options: PdfOptions = {}): void {
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
    doc.text(`${T(options, 'SIRET', 'Company ID (SIRET)')} : ${company.siret}`, margin, yPos);
    yPos += 5;
  }
  
  // === DEVIS (droite) ===
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(T(options, 'DEVIS', 'QUOTE'), pageWidth - margin, 20, { align: 'right' });
  
  // Infos devis à droite
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.text(`${T(options, 'N°', 'No.')} : ${quote.quote_number}`, pageWidth - margin, 30, { align: 'right' });
  doc.text(`Date : ${formatDate(quote.issue_date, options)}`, pageWidth - margin, 36, { align: 'right' });
  doc.text(`${T(options, 'Validité', 'Valid until')} : ${formatDate(quote.valid_until, options)}`, pageWidth - margin, 42, { align: 'right' });
  
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
  doc.text(T(options, 'Destinataire :', 'Recipient:'), margin + 5, clientY);
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
  
  const tableData: string[][] = [];
  const detailRowIndexes: number[] = [];
  quote.items.forEach(item => {
    tableData.push([
      item.description,
      item.quantity.toString(),
      formatCurrency(item.unitPrice, options),
      formatCurrency(item.total, options)
    ]);
    if (item.details) {
      detailRowIndexes.push(tableData.length);
      tableData.push([item.details, '', '', '']);
    }
  });

  autoTable(doc, {
    startY: tableStartY,
    head: [isEn(options) ? ['Description', 'Qty', 'Unit price', 'Amount'] : ['Désignation', 'Quantité', 'Prix unitaire HT', 'Total HT']],
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
    didParseCell: (data) => {
      if (data.section === 'body' && detailRowIndexes.includes(data.row.index)) {
        data.cell.styles.fontSize = 8;
        data.cell.styles.fontStyle = 'italic';
        data.cell.styles.textColor = [COLORS.muted.r, COLORS.muted.g, COLORS.muted.b];
        data.cell.styles.cellPadding = { top: 0, right: 5, bottom: 5, left: 8 };
      }
    },
    margin: { left: margin, right: margin },
  });
  
  // @ts-ignore
  let finalY = doc.lastAutoTable.finalY + 10;

  // === TOTAUX ===
  const totalsX = 130;

  const showSubtotal = quote.show_subtotal !== false;

  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(10);

  if (showSubtotal) {
    doc.setFont('helvetica', 'bold');
    doc.text(T(options, 'Total HT :', 'Subtotal:'), totalsX, finalY);
    doc.text(formatCurrency(Number(quote.subtotal), options), pageWidth - margin, finalY, { align: 'right' });
    finalY += 8;
  }
  
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
  doc.text(T(options, 'TVA non applicable, art. 293 B du CGI', 'VAT not applicable, art. 293 B of the French tax code'), totalsX, finalY);
  finalY += 10;
  
  doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(T(options, 'Total TTC :', 'Total due:'), totalsX, finalY);
  doc.text(formatCurrency(Number(quote.total), options), pageWidth - margin, finalY, { align: 'right' });
  finalY += 20;

  // === CONDITIONS DU PROJET ===
  const projectTerms: { label: string; value?: string | null }[] = [
    { label: T(options, 'Timeline du projet', 'Project timeline'), value: quote.timeline },
    { label: T(options, 'Modalités de paiement', 'Payment terms'), value: quote.payment_terms },
    { label: T(options, 'Mises à jour incluses', 'Included updates'), value: quote.revisions },
    { label: T(options, 'Hébergement', 'Hosting'), value: quote.hosting },
    { label: T(options, 'Maintenance', 'Maintenance'), value: quote.maintenance },
    { label: T(options, 'Support technique', 'Technical support'), value: quote.support },
    { label: T(options, 'Fonctionnalités intégrées', 'Included features'), value: quote.features },
  ].filter(t => t.value && t.value.trim());

  if (projectTerms.length > 0) {
    const ensureSpace = (needed: number) => {
      if (finalY + needed > 275) {
        doc.addPage();
        finalY = 20;
      }
    };

    ensureSpace(15);
    doc.setTextColor(COLORS.blue.r, COLORS.blue.g, COLORS.blue.b);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(T(options, 'CONDITIONS DU PROJET', 'PROJECT TERMS'), margin, finalY);
    finalY += 6;

    projectTerms.forEach(term => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
      ensureSpace(10);
      doc.text(`${term.label} :`, margin, finalY);
      finalY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
      const richLines = layoutRichText(doc, String(term.value), contentWidth - 5);
      richLines.forEach(segs => {
        ensureSpace(6);
        segs.forEach(seg => {
          doc.setFont('helvetica', seg.bold && seg.italic ? 'bolditalic' : seg.bold ? 'bold' : seg.italic ? 'italic' : 'normal');
          if (seg.bold) doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
          else doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
          const sx = margin + 3 + seg.x;
          doc.text(seg.text, sx, finalY);
          if (seg.underline && seg.text.trim()) {
            doc.setLineWidth(0.3);
            doc.line(sx, finalY + 1, sx + seg.width, finalY + 1);
          }
        });
        doc.setFont('helvetica', 'normal');
        finalY += 4.5;
      });
      finalY += 2.5;
    });

    finalY += 5;
    if (finalY > 230) {
      doc.addPage();
      finalY = 20;
    }
  }


  
  // === CONDITIONS ===
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(isEn(options) ? `This quote is valid for ${company.payment_delay || 30} days from the issue date.` : `Ce devis est valable ${company.payment_delay || 30} jours à compter de sa date d'émission.`, margin, finalY);
  finalY += 5;
  doc.text(T(options, 'Pour acceptation, retournez ce devis signé avec la mention "Bon pour accord".', 'To accept, please return this quote signed with the wording "Agreed".'), margin, finalY);
  finalY += 15;
  
  // Zone signature
  doc.setTextColor(COLORS.text.r, COLORS.text.g, COLORS.text.b);
  doc.setFont('helvetica', 'bold');
  doc.text(T(options, 'Signature (précédée de "Bon pour accord") :', 'Signature (preceded by "Agreed"):'), margin, finalY);
  finalY += 5;
  
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(margin, finalY, 80, 25);
  
  doc.setFont('helvetica', 'normal');
  doc.text(T(options, 'Date :', 'Date:'), margin + 90, finalY + 15);
  doc.line(margin + 105, finalY + 15, margin + 160, finalY + 15);
  
  if (options.currency === 'USD' && options.rate) {
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b);
    doc.text(
      `Amounts converted from EUR at the daily rate of ${options.rate.toFixed(4)} USD/EUR${options.rateDate ? ` (${options.rateDate})` : ''}.`,
      margin,
      finalY + 35
    );
  }

  doc.save(`${quote.quote_number}${isEn(options) ? '-EN' : ''}.pdf`);
}
