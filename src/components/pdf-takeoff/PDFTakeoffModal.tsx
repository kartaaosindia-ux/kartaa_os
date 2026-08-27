'use client';

import React, { useState } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import PDFUploader from './PDFUploader';
import BOQViewer from './BOQViewer';
import { processPDFDrawing } from '@/lib/pdf-takeoff/pdf-parser';
import { generateBOQFromElements } from '@/lib/pdf-takeoff/boq-generator';
import { PDFProcessingResult } from '@/lib/pdf-takeoff/types';

type ViewType = 'upload' | 'processing' | 'results';

interface PDFTakeoffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBOQGenerated?: (boq: any) => void;
}

export default function PDFTakeoffModal({ isOpen, onClose, onBOQGenerated }: PDFTakeoffModalProps) {
  const [view, setView] = useState<ViewType>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PDFProcessingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setView('processing');

    try {
      const processingResult = await processPDFDrawing(file);

      if (!processingResult.success) {
        setError(processingResult.errors?.join(', ') || 'Failed to process PDF');
        setView('upload');
        setIsLoading(false);
        return;
      }

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

      // Callback when BOQ is generated
      if (processingResult.boq && onBOQGenerated) {
        onBOQGenerated(processingResult.boq);
      }
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

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">PDF Construction Takeoff</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {view === 'upload' && (
              <div className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a construction drawing PDF to automatically generate a Bill of Quantities (BOQ) as per Indian Standards.
                  </p>
                  <PDFUploader onFileSelected={handleFileSelected} isLoading={isLoading} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900">Auto Detection</p>
                    <p className="text-xs text-blue-700 mt-1">Identifies walls, doors, windows & materials</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-semibold text-green-900">IS Compliant</p>
                    <p className="text-xs text-green-700 mt-1">Follows Indian Standard codes</p>
                  </div>
                </div>
              </div>
            )}

            {view === 'processing' && (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600 text-sm">Processing drawing...</p>
              </div>
            )}

            {view === 'results' && result && result.boq && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Generated BOQ</h3>
                  <button
                    onClick={handleReset}
                    className="text-sm px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    Upload Another
                  </button>
                </div>
                <BOQViewer boq={result.boq} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
