import { BOQ, BOQItem } from './types';

/**
 * Export BOQ to JSON format
 */
export function exportBOQAsJSON(boq: BOQ): string {
  return JSON.stringify(boq, null, 2);
}

/**
 * Download BOQ as JSON file
 */
export function downloadBOQJSON(boq: BOQ): void {
  const jsonString = exportBOQAsJSON(boq);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${boq.projectName.replace(/\s+/g, '_')}_BOQ_${boq.generatedDate}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export BOQ to CSV format
 */
export function exportBOQAsCSV(boq: BOQ): string {
  const headers = ['Sl. No.', 'Description', 'Unit', 'Quantity', 'Rate (₹)', 'Amount (₹)', 'IS Code'];
  const rows = boq.items.map(item => [
    item.slNo,
    item.description,
    item.unit,
    item.quantity.toFixed(2),
    item.rate.toLocaleString('en-IN'),
    item.amount.toLocaleString('en-IN'),
    item.isCode || ''
  ]);

  const csvContent = [
    `Project Name,${boq.projectName}`,
    `Drawing Number,${boq.drawingNumber}`,
    `Generated Date,${boq.generatedDate}`,
    `Total Items,${boq.totalItems}`,
    '',
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download BOQ as Excel file (CSV format)
 */
export function downloadBOQExcel(boq: BOQ): void {
  const csvString = exportBOQAsCSV(boq);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${boq.projectName.replace(/\s+/g, '_')}_BOQ_${boq.generatedDate}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export BOQ to PDF format
 */
export function downloadBOQPDF(boq: BOQ): void {
  let pdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>\nendobj\n4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n5 0 obj\n<< /Length 1000 >>\nstream\nBT\n/F1 12 Tf\n50 750 Td\n(BILL OF QUANTITIES - ${boq.projectName}) Tj\n0 -30 Td\n(Project: ${boq.projectName}) Tj\n0 -15 Td\n(Drawing: ${boq.drawingNumber}) Tj\n0 -15 Td\n(Date: ${boq.generatedDate}) Tj\n0 -30 Td\n`;\n\n  boq.items.forEach((item) => {\n    pdfContent += `(${item.slNo}. ${item.description} - ${item.quantity} ${item.unit} @ ₹${item.rate} = ₹${item.amount}) Tj\n0 -15 Td\n`;\n  });\n\n  pdfContent += `0 -30 Td\n(TOTAL: ₹${boq.totalAmount.toLocaleString('en-IN')}) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000229 00000 n \n0000000308 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${pdfContent.length + 400}\n%%EOF`;\n\n  const blob = new Blob([pdfContent], { type: 'application/pdf' });\n  const url = URL.createObjectURL(blob);\n  const link = document.createElement('a');\n  link.href = url;\n  link.download = `${boq.projectName.replace(/\s+/g, '_')}_BOQ_${boq.generatedDate}.pdf`;\n  document.body.appendChild(link);\n  link.click();\n  document.body.removeChild(link);\n  URL.revokeObjectURL(url);\n}\n\n/**\n * Copy BOQ to clipboard as formatted text\n */\nexport function copyBOQToClipboard(boq: BOQ): Promise<void> {\n  const text = [\n    `PROJECT: ${boq.projectName}`,\n    `DRAWING: ${boq.drawingNumber}`,\n    `DATE: ${boq.generatedDate}`,\n    '',\n    'SL. NO. | DESCRIPTION | UNIT | QUANTITY | RATE | AMOUNT | IS CODE',\n    '---'.repeat(20),\n    ...boq.items.map(item =>\n      `${item.slNo} | ${item.description} | ${item.unit} | ${item.quantity.toFixed(2)} | ₹${item.rate} | ₹${item.amount.toLocaleString('en-IN')} | ${item.isCode || ''}`\n    ),\n    '---'.repeat(20),\n    `TOTAL AMOUNT: ₹${boq.totalAmount.toLocaleString('en-IN')}`\n  ].join('\\n');\n\n  return navigator.clipboard.writeText(text);\n}
