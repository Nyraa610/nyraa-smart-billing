import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/hooks/useSupabaseInvoices';
import { Quote } from '@/hooks/useSupabaseQuotes';
import { CompanyInfo } from '@/hooks/useSupabaseCompanyInfo';

export function generateInvoicePDF(invoice: Invoice, company: CompanyInfo): void {
  const doc = new jsPDF();
  
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
    doc.text(`${company.address}${company.postal_code ? `, ${company.postal_code}` : ''}${company.city ? ` ${company.city}` : ''}`, 20, headerY);
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
  doc.text(`N° ${invoice.invoice_number}`, 140, 68);
  doc.text(`Date: ${new Date(invoice.issue_date).toLocaleDateString('fr-FR')}`, 140, 74);
  doc.text(`Échéance: ${new Date(invoice.due_date).toLocaleDateString('fr-FR')}`, 140, 80);
  
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
  if (company.postal_code || company.city) {
    doc.text(`${company.postal_code} ${company.city}`.trim(), 20, emitterY);
    emitterY += 5;
  }
  if (company.siret) {
    doc.text(`SIRET: ${company.siret}`, 20, emitterY);
    emitterY += 5;
  }
  if (company.tva_number) {
    doc.text(`N° TVA: ${company.tva_number}`, 20, emitterY);
    emitterY += 5;
  }
  
  // Client info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CLIENT', 20, emitterY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let clientY = emitterY + 15;
  
  const clientName = invoice.client?.name || 'Client';
  doc.text(clientName, 20, clientY);
  clientY += 5;
  
  if (invoice.client?.address) {
    doc.text(invoice.client.address, 20, clientY);
    clientY += 5;
  }
  if (invoice.client?.postal_code || invoice.client?.city) {
    doc.text(`${invoice.client?.postal_code || ''} ${invoice.client?.city || ''}`.trim(), 20, clientY);
    clientY += 5;
  }
  if (invoice.client?.siret) {
    doc.text(`SIRET: ${invoice.client.siret}`, 20, clientY);
    clientY += 5;
  }
  if (invoice.client?.tva_number) {
    doc.text(`N° TVA: ${invoice.client.tva_number}`, 20, clientY);
    clientY += 5;
  }
  if (invoice.client?.email) {
    doc.text(invoice.client.email, 20, clientY);
  }
  
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
  doc.text(`${Number(invoice.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY, { align: 'right' });
  
  doc.text(`TVA (${company.tax_rate || 20}%):`, 130, finalY + 7);
  doc.text(`${Number(invoice.tax).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 7, { align: 'right' });
  
  doc.setDrawColor(51, 101, 178);
  doc.setLineWidth(0.5);
  doc.line(130, finalY + 11, 190, finalY + 11);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 101, 178);
  doc.text('Total TTC:', 130, finalY + 18);
  doc.text(`${Number(invoice.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 18, { align: 'right' });
  
  // Conditions de paiement
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS DE PAIEMENT', 20, finalY + 35);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Paiement à ${company.payment_delay || 30} jours à compter de la date de facture.`, 20, finalY + 42);
  doc.text('En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée,', 20, finalY + 48);
  doc.text('ainsi qu\'une indemnité forfaitaire de 40€ pour frais de recouvrement (art. L441-10 Code de commerce).', 20, finalY + 54);
  
  // Coordonnées bancaires
  if (company.iban || company.bic) {
    doc.setFont('helvetica', 'bold');
    doc.text('COORDONNÉES BANCAIRES', 20, finalY + 65);
    doc.setFont('helvetica', 'normal');
    let bankY = finalY + 72;
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
  
  // Footer - Mentions légales obligatoires
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  
  let footerY = 270;
  const footerLines: string[] = [];
  
  if (company.name) footerLines.push(company.name);
  if (company.legal_form) footerLines[footerLines.length - 1] += ` - ${company.legal_form}`;
  if (company.capital) footerLines[footerLines.length - 1] += ` au capital de ${company.capital} €`;
  
  const legalLine = [];
  if (company.siret) legalLine.push(`SIRET: ${company.siret}`);
  if (company.rcs) legalLine.push(`RCS: ${company.rcs}`);
  if (company.ape_code) legalLine.push(`Code APE: ${company.ape_code}`);
  if (company.tva_number) legalLine.push(`N° TVA: ${company.tva_number}`);
  
  if (legalLine.length > 0) footerLines.push(legalLine.join(' - '));
  
  footerLines.push('TVA non applicable, art. 293 B du CGI');
  
  footerLines.forEach((line, i) => {
    doc.text(line, 105, footerY + (i * 4), { align: 'center' });
  });
  
  doc.save(`${invoice.invoice_number}.pdf`);
}

export function generateQuotePDF(quote: Quote, company: CompanyInfo): void {
  const doc = new jsPDF();
  
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
    doc.text(`${company.address}${company.postal_code ? `, ${company.postal_code}` : ''}${company.city ? ` ${company.city}` : ''}`, 20, headerY);
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
  doc.text(`N° ${quote.quote_number}`, 140, 68);
  doc.text(`Date: ${new Date(quote.issue_date).toLocaleDateString('fr-FR')}`, 140, 74);
  doc.text(`Valide jusqu'au: ${new Date(quote.valid_until).toLocaleDateString('fr-FR')}`, 140, 80);
  
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
  if (company.postal_code || company.city) {
    doc.text(`${company.postal_code} ${company.city}`.trim(), 20, emitterY);
    emitterY += 5;
  }
  if (company.siret) {
    doc.text(`SIRET: ${company.siret}`, 20, emitterY);
    emitterY += 5;
  }
  if (company.tva_number) {
    doc.text(`N° TVA: ${company.tva_number}`, 20, emitterY);
    emitterY += 5;
  }
  
  // Client info
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('CLIENT', 20, emitterY + 8);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  let clientY = emitterY + 15;
  
  const clientName = quote.client?.name || 'Client';
  doc.text(clientName, 20, clientY);
  clientY += 5;
  
  if (quote.client?.address) {
    doc.text(quote.client.address, 20, clientY);
    clientY += 5;
  }
  if (quote.client?.postal_code || quote.client?.city) {
    doc.text(`${quote.client?.postal_code || ''} ${quote.client?.city || ''}`.trim(), 20, clientY);
    clientY += 5;
  }
  if (quote.client?.siret) {
    doc.text(`SIRET: ${quote.client.siret}`, 20, clientY);
    clientY += 5;
  }
  if (quote.client?.tva_number) {
    doc.text(`N° TVA: ${quote.client.tva_number}`, 20, clientY);
    clientY += 5;
  }
  if (quote.client?.email) {
    doc.text(quote.client.email, 20, clientY);
  }
  
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
  doc.text(`${Number(quote.subtotal).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY, { align: 'right' });
  
  doc.text(`TVA (${company.tax_rate || 20}%):`, 130, finalY + 7);
  doc.text(`${Number(quote.tax).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 7, { align: 'right' });
  
  doc.setDrawColor(41, 171, 164);
  doc.setLineWidth(0.5);
  doc.line(130, finalY + 11, 190, finalY + 11);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 171, 164);
  doc.text('Total TTC:', 130, finalY + 18);
  doc.text(`${Number(quote.total).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`, 190, finalY + 18, { align: 'right' });
  
  // Conditions
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONDITIONS', 20, finalY + 35);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Ce devis est valable ${company.payment_delay || 30} jours à compter de sa date d'émission.`, 20, finalY + 42);
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
  if (company.legal_form) footerLines[footerLines.length - 1] += ` - ${company.legal_form}`;
  if (company.capital) footerLines[footerLines.length - 1] += ` au capital de ${company.capital} €`;
  
  const legalLine = [];
  if (company.siret) legalLine.push(`SIRET: ${company.siret}`);
  if (company.rcs) legalLine.push(`RCS: ${company.rcs}`);
  if (company.ape_code) legalLine.push(`Code APE: ${company.ape_code}`);
  if (company.tva_number) legalLine.push(`N° TVA: ${company.tva_number}`);
  
  if (legalLine.length > 0) footerLines.push(legalLine.join(' - '));
  
  footerLines.forEach((line, i) => {
    doc.text(line, 105, footerY + (i * 4), { align: 'center' });
  });
  
  doc.save(`${quote.quote_number}.pdf`);
}
