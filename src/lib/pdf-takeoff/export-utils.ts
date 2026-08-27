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
  link.download = boq.projectName.replace(/\s+/g, '_') + '_BOQ_' + boq.generatedDate + '.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export BOQ to CSV format
 */
export function exportBOQAsCSV(boq: BOQ): string {
  const headers = ['Sl. No.', 'Description', 'Unit', 'Quantity', 'Rate (Rs)', 'Amount (Rs)', 'IS Code'];
  const rows = boq.items.map((item: BOQItem) => [
    item.slNo,
    item.description,
    item.unit,
    item.quantity.toFixed(2),
    item.rate.toLocaleString('en-IN'),
    item.amount.toLocaleString('en-IN'),
    item.isCode || '',
  ]);

  const csvContent = [
    'Project Name,' + boq.projectName,
    'Drawing Number,' + boq.drawingNumber,
    'Generated Date,' + boq.generatedDate,
    'Total Items,' + boq.totalItems,
    '',
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
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
  link.download = boq.projectName.replace(/\s+/g, '_') + '_BOQ_' + boq.generatedDate + '.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export BOQ to PDF format
 */
export function downloadBOQPDF(boq: BOQ): void {
  const lines: string[] = [
    'BILL OF QUANTITIES',
    '',
    'Project: ' + boq.projectName,
    'Drawing: ' + boq.drawingNumber,
    'Date: ' + boq.generatedDate,
    '',
    'SL | DESCRIPTION | UNIT | QTY | RATE | AMOUNT | IS CODE',
    '-------------------------------------------------------------------',
  ];

  boq.items.forEach((item: BOQItem) => {
    lines.push(
      item.slNo +
        ' | ' +
        item.description +
        ' | ' +
        item.unit +
        ' | ' +
        item.quantity.toFixed(2) +
        ' | Rs.' +
        item.rate +
        '| Rs.' + item.amount.toLocaleString('en-IN') +
        ' | '+ (item.isCode ||'')
    );
  });

  lines.push('-------------------------------------------------------------------');
  lines.push('TOTAL AMOUNT: Rs.' + boq.totalAmount.toLocaleString('en-IN'));

  const text = lines.join('\n');
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = boq.projectName.replace(/\s+/g, '_') + '_BOQ_' + boq.generatedDate + '.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy BOQ to clipboard as formatted text
 */
export function copyBOQToClipboard(boq: BOQ): Promise<void> {
  const text = [
    'PROJECT: ' + boq.projectName,
    'DRAWING: ' + boq.drawingNumber,
    'DATE: ' + boq.generatedDate,
    '',
    'SL. NO. | DESCRIPTION | UNIT | QUANTITY | RATE | AMOUNT | IS CODE',
    '---'.repeat(20),
    ...boq.items.map(
      (item: BOQItem) =>
        item.slNo +
        ' | ' +
        item.description +
        ' | ' +
        item.unit +
        ' | ' +
        item.quantity.toFixed(2) +
        ' | Rs.' +
        item.rate +
        '| Rs.' + item.amount.toLocaleString('en-IN') +
        ' | '+ (item.isCode ||'')
    ),
    '---'.repeat(20),
    'TOTAL AMOUNT: Rs.' + boq.totalAmount.toLocaleString('en-IN'),
  ].join('\n');

  return navigator.clipboard.writeText(text);
}
