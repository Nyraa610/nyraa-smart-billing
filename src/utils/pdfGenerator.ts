import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, Quote } from '@/types';

export function generateInvoicePDF(invoice: Invoice): void {
  const doc = new jsPDF();
  
  // Header gradient effect simulation
  doc.setFillColor(51, 101, 178);
  doc.rect(0, 0, 220, 45, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('NYRAA DIGITAL', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Gestion & Facturation', 20, 33);
  
  // Invoice title
  doc.setTextColor(51, 101, 178);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE', 140, 65);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${invoice.number}`, 140, 73);
  doc.text(`Date: ${invoice.createdAt.toLocaleDateString('fr-FR')}`, 140, 80);
  doc.text(`Échéance: ${invoice.dueDate.toLocaleDateString('fr-FR')}`, 140, 87);
  
  // Client info
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Facturé à:', 20, 65);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(invoice.client.name, 20, 73);
  doc.text(invoice.client.email, 20, 80);
  doc.text(invoice.client.address, 20, 87);
  
  // Items table
  const tableData = invoice.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unitPrice.toLocaleString('fr-FR')} €`,
    `${item.total.toLocaleString('fr-FR')} €`
  ]);
  
  autoTable(doc, {
    startY: 100,
    head: [['Description', 'Qté', 'Prix unitaire', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [51, 101, 178],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 8,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(11);
  doc.text('Sous-total HT:', 120, finalY);
  doc.text(`${invoice.subtotal.toLocaleString('fr-FR')} €`, 170, finalY, { align: 'right' });
  
  doc.text('TVA (20%):', 120, finalY + 8);
  doc.text(`${invoice.tax.toLocaleString('fr-FR')} €`, 170, finalY + 8, { align: 'right' });
  
  doc.setDrawColor(51, 101, 178);
  doc.line(120, finalY + 13, 190, finalY + 13);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 101, 178);
  doc.text('TOTAL TTC:', 120, finalY + 22);
  doc.text(`${invoice.total.toLocaleString('fr-FR')} €`, 170, finalY + 22, { align: 'right' });
  
  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Nyraa Digital - contact@nyraadigital.com', 105, 280, { align: 'center' });
  doc.text('Merci pour votre confiance!', 105, 286, { align: 'center' });
  
  doc.save(`${invoice.number}.pdf`);
}

export function generateQuotePDF(quote: Quote): void {
  const doc = new jsPDF();
  
  // Header
  doc.setFillColor(41, 171, 164);
  doc.rect(0, 0, 220, 45, 'F');
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('NYRAA DIGITAL', 20, 25);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Gestion & Facturation', 20, 33);
  
  // Quote title
  doc.setTextColor(41, 171, 164);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('DEVIS', 150, 65);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° ${quote.number}`, 140, 73);
  doc.text(`Date: ${quote.createdAt.toLocaleDateString('fr-FR')}`, 140, 80);
  doc.text(`Valide jusqu'au: ${quote.validUntil.toLocaleDateString('fr-FR')}`, 140, 87);
  
  // Client info
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Client:', 20, 65);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(quote.client.name, 20, 73);
  doc.text(quote.client.email, 20, 80);
  doc.text(quote.client.address, 20, 87);
  
  // Items table
  const tableData = quote.items.map(item => [
    item.description,
    item.quantity.toString(),
    `${item.unitPrice.toLocaleString('fr-FR')} €`,
    `${item.total.toLocaleString('fr-FR')} €`
  ]);
  
  autoTable(doc, {
    startY: 100,
    head: [['Description', 'Qté', 'Prix unitaire', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [41, 171, 164],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 8,
    },
    alternateRowStyles: {
      fillColor: [240, 250, 249],
    },
  });
  
  // Totals
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFontSize(11);
  doc.text('Sous-total HT:', 120, finalY);
  doc.text(`${quote.subtotal.toLocaleString('fr-FR')} €`, 170, finalY, { align: 'right' });
  
  doc.text('TVA (20%):', 120, finalY + 8);
  doc.text(`${quote.tax.toLocaleString('fr-FR')} €`, 170, finalY + 8, { align: 'right' });
  
  doc.setDrawColor(41, 171, 164);
  doc.line(120, finalY + 13, 190, finalY + 13);
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(41, 171, 164);
  doc.text('TOTAL TTC:', 120, finalY + 22);
  doc.text(`${quote.total.toLocaleString('fr-FR')} €`, 170, finalY + 22, { align: 'right' });
  
  // Footer
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ce devis est valide pendant 30 jours à compter de sa date d\'émission.', 105, 275, { align: 'center' });
  doc.text('Nyraa Digital - contact@nyraadigital.com', 105, 282, { align: 'center' });
  
  doc.save(`${quote.number}.pdf`);
}
