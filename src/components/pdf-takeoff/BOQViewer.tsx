'use client';

import React from 'react';
import { BOQ, BOQItem } from '@/lib/pdf-takeoff/types';
import { Download, Printer, Copy, FileJson, FileSpreadsheet, File } from 'lucide-react';
import {
  downloadBOQPDF,
  downloadBOQExcel,
  downloadBOQJSON,
  copyBOQToClipboard
} from '@/lib/pdf-takeoff/export-utils';

interface BOQViewerProps {
  boq: BOQ;
}

export default function BOQViewer({ boq }: BOQViewerProps) {
  const [copied, setCopied] = React.useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleCopy = async () => {
    try {
      await copyBOQToClipboard(boq);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800">{boq.projectName}</h1>
        <div className="mt-2 grid grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <span className="font-semibold">Drawing No:</span> {boq.drawingNumber}
          </div>
          <div>
            <span className="font-semibold">Generated:</span> {boq.generatedDate}
          </div>
          <div>
            <span className="font-semibold">Total Items:</span> {boq.totalItems}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Sl. No.</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">Description</th>
              <th className="border border-gray-300 px-4 py-2 text-center text-sm font-semibold">Unit</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Quantity</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Rate (₹)</th>
              <th className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">Amount (₹)</th>
              <th className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold">IS Code</th>
            </tr>
          </thead>
          <tbody>
            {boq.items.map((item: BOQItem) => (
              <tr key={item.slNo} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2 text-sm">{item.slNo}</td>
                <td className="border border-gray-300 px-4 py-2 text-sm">{item.description}</td>
                <td className="border border-gray-300 px-4 py-2 text-center text-sm">{item.unit}</td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm">
                  {item.quantity.toFixed(2)}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm">
                  {item.rate.toLocaleString('en-IN')}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-right text-sm font-semibold">
                  {item.amount.toLocaleString('en-IN')}
                </td>
                <td className="border border-gray-300 px-4 py-2 text-sm">{item.isCode}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Total */}
      <div className="flex justify-end mb-6">
        <div className="w-1/3">
          <div className="border-t-2 border-gray-800 pt-2 mb-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total Amount:</span>
              <span>₹ {boq.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {boq.notes && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Notes:</span> {boq.notes}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-end border-t pt-6">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Print BOQ"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Copy to clipboard"
        >
          <Copy className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={() => downloadBOQJSON(boq)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          title="Export as JSON"
        >
          <FileJson className="w-4 h-4" />
          JSON
        </button>
        <button
          onClick={() => downloadBOQExcel(boq)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          title="Export as Excel"
        >
          <FileSpreadsheet className="w-4 h-4" />
          Excel
        </button>
        <button
          onClick={() => downloadBOQPDF(boq)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          title="Export as PDF"
        >
          <File className="w-4 h-4" />
          PDF
        </button>
      </div>
    </div>
  );
}
