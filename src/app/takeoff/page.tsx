'use client';

import React, { useState } from 'react';
import PDFUploader from '@/components/pdf-takeoff/PDFUploader';
import BOQViewer from '@/components/pdf-takeoff/BOQViewer';
import { processPDFDrawing } from '@/lib/pdf-takeoff/pdf-parser';
import { generateBOQFromElements } from '@/lib/pdf-takeoff/boq-generator';
import { PDFProcessingResult } from '@/lib/pdf-takeoff/types';

type ViewType = 'upload' | 'processing' | 'results';

export default function TakeoffPage() {
  const [view, setView] = useState<ViewType>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PDFProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setView('processing');

    try {
      // Process PDF
      const processingResult = await processPDFDrawing(file);

      if (!processingResult.success) {
        setError(processingResult.errors?.join(', ') || 'Failed to process PDF');
        setView('upload');
        setIsLoading(false);
        return;
      }

      // Generate BOQ
      if (processingResult.metadata && processingResult.elements.length > 0) {
        const boq = generateBOQFromElements(
          processingResult.elements,
          processingResult.metadata.projectName,
          processingResult.metadata.drawingNumber
        );
        processingResult.boq = boq;
      }

      setResult(processingResult);
      setView('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setView('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setView('upload');
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">PDF Construction Takeoff</h1>
          <p className="mt-2 text-lg text-gray-600">
            Automated Bill of Quantities (BOQ) Generation as per Indian Standards
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {view === 'upload' && (
            <div className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
              <PDFUploader onFileSelected={handleFileSelected} isLoading={isLoading} />
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Automated Detection</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Automatically identifies construction elements from drawings
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">Indian Standards</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Generates BOQ following IS codes and standards
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Multiple Formats</h3>
                  <p className="text-sm text-purple-700 mt-1">
                    Export to PDF, Excel, or JSON formats
                  </p>
                </div>
              </div>
            </div>
          )}

          {view === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg text-gray-600">Processing your drawing...</p>
              <p className="text-sm text-gray-500 mt-2">Extracting dimensions and generating BOQ</p>
            </div>
          )}

          {view === 'results' && result && result.boq && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Generated BOQ</h2>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Upload Another File
                </button>
              </div>
              <BOQViewer boq={result.boq} />
              {result.warnings && result.warnings.length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-semibold">Warnings:</span> {result.warnings.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
