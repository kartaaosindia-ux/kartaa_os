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
  const headers = ['Sl. No.', 'Description', 'Unit', 'Quantity', 'Rate (Rs)', 'Amount (Rs)', 'IS Code'];
  const rows = boq.items.map((item: BOQItem) => [
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
    ...rows.map((row: (string | number)[]) => row.map((cell) => `"${cell}"`).join(','))
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
 * Export BOQ to PDF format (downloads as HTML-based printable file)
 */
export function downloadBOQPDF(boq: BOQ): void {
  const rows = boq.items
    .map(
      (item: BOQItem) =>
        `<tr>
          <td style="border:1px solid #ccc;padding:6px;">${item.slNo}</td>
          <td style="border:1px solid #ccc;padding:6px;">${item.description}</td>
          <td style="border:1px solid #ccc;padding:6px;">${item.unit}</td>
          <td style="border:1px solid #ccc;padding:6px;">${item.quantity.toFixed(2)}</td>
          <td style="border:1px solid #ccc;padding:6px;">${item.rate.toLocaleString('en-IN')}</td>
          <td style="border:1px solid #ccc;padding:6px;">${item.amount.toLocaleString('en-IN')}</td>
          <td style="border:1px solid #ccc;padding:6px;">${item.isCode || ''}</td>
        </tr>`
    )
    .join('');

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>BOQ - ${boq.projectName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { font-size: 18px; }
    table { border-collapse: collapse; width: 100%; margin-top: 20px; }
    th { background: #1e3a5f; color: white; padding: 8px; border: 1px solid #ccc; }
    td { padding: 6px; border: 1px solid #ccc; }
    .total { font-weight: bold; text-align: right; margin-top: 16px; font-size: 16px; }
  </style>
</head>
<body>
  <h1>BILL OF QUANTITIES</h1>
  <p><strong>Project:</strong> ${boq.projectName}</p>
  <p><strong>Drawing:</strong> ${boq.drawingNumber}</p>
  <p><strong>Date:</strong> ${boq.generatedDate}</p>
  <table>
    <thead>
      <tr>
        <th>Sl. No.</th>
        <th>Description</th>
        <th>Unit</th>
        <th>Quantity</th>
        <th>Rate (Rs)</th>
        <th>Amount (Rs)</th>
        <th>IS Code</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <p class="total">TOTAL AMOUNT: Rs ${boq.totalAmount.toLocaleString('en-IN')}</p>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${boq.projectName.replace(/\s+/g, '_')}_BOQ_${boq.generatedDate}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copy BOQ to clipboard as formatted text
 */
export function copyBOQToClipboard(boq: BOQ): Promise<void> {
  const separator = '---'.repeat(20);
  const text = [
    `PROJECT: ${boq.projectName}`,
    `DRAWING: ${boq.drawingNumber}`,
    `DATE: ${boq.generatedDate}`,
    '',
    'SL. NO. | DESCRIPTION | UNIT | QUANTITY | RATE | AMOUNT | IS CODE',
    separator,
    ...boq.items.map(
      (item: BOQItem) =>
        `${item.slNo} | ${item.description} | ${item.unit} | ${item.quantity.toFixed(2)} | Rs${item.rate} | Rs${item.amount.toLocaleString('en-IN')} | ${item.isCode || ''}`
    ),
    separator,
    `TOTAL AMOUNT: Rs${boq.totalAmount.toLocaleString('en-IN')}`
  ].join('\n');

  return navigator.clipboard.writeText(text);
}
