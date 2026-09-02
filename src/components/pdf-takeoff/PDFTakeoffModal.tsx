'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, AlertTriangle, CheckCircle2, Info, RefreshCw, Scan } from 'lucide-react';
import PDFUploader from './PDFUploader';
import { processPDFDrawing } from '@/lib/pdf-takeoff/pdf-parser';
import { PDFProcessingResult } from '@/lib/pdf-takeoff/types';

type ViewType = 'upload' | 'processing' | 'results' | 'rejected';

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
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  const handleFileSelected = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setCurrentFile(file);
    setView('processing');

    try {
      const processingResult = await processPDFDrawing(file);
      setResult(processingResult);

      if (processingResult.isScannedPDF) {
        setView('rejected');
        return;
      }

      if (!processingResult.isConstructionDrawing || !processingResult.success) {
        setView('rejected');
        return;
      }

      setView('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setView('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (currentFile) {
      handleFileSelected(currentFile);
    } else {
      handleReset();
    }
  };

  const handleReplacePDF = () => {
    setView('upload');
    setResult(null);
    setError(null);
    setCurrentFile(null);
  };

  const handleReset = () => {
    setView('upload');
    setResult(null);
    setError(null);
    setCurrentFile(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  const confidence = result?.analysis?.constructionConfidence ?? 0;
  const indicators = result?.analysis?.foundIndicators ?? [];
  const meta = result?.metadata;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">PDF Construction Takeoff</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* ── Upload view ── */}
            {view === 'upload' && (
              <div className="space-y-6">
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload a construction drawing PDF. The tool will analyse the content to verify it is a genuine construction drawing before allowing takeoff.
                  </p>
                  <PDFUploader onFileSelected={handleFileSelected} isLoading={isLoading} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-900">Content Verification</p>
                    <p className="text-xs text-blue-700 mt-1">Analyses actual PDF text — no filename guessing</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-semibold text-green-900">Measurement-Based BOQ</p>
                    <p className="text-xs text-green-700 mt-1">BOQ generated only from your drawn measurements</p>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs font-semibold text-amber-900">Scale Calibration Required</p>
                    <p className="text-xs text-amber-700 mt-1">Set scale before measurements convert to real units</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs font-semibold text-purple-900">Non-Construction Rejection</p>
                    <p className="text-xs text-purple-700 mt-1">Invoices, text docs and blank PDFs are rejected</p>
                  </div>
                </div>
              </div>
            )}

            {/* ── Processing view ── */}
            {view === 'processing' && (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <div className="text-center">
                  <p className="text-gray-700 font-medium">Analysing PDF content…</p>
                  <p className="text-gray-500 text-sm mt-1">Extracting text, page dimensions and construction indicators</p>
                </div>
                <button
                  onClick={handleReset}
                  className="mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            )}

            {/* ── Rejected view ── */}
            {view === 'rejected' && result && (
              <div className="space-y-5">
                {/* Rejection banner */}
                <div className={`p-4 rounded-lg border flex items-start gap-3 ${
                  result.isScannedPDF
                    ? 'bg-purple-50 border-purple-200' :'bg-red-50 border-red-200'
                }`}>
                  {result.isScannedPDF
                    ? <Scan className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    : <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  }
                  <div>
                    <p className={`font-semibold text-sm ${result.isScannedPDF ? 'text-purple-900' : 'text-red-900'}`}>
                      {result.isScannedPDF ? 'Scanned / Image-Only PDF' : 'Not a Construction Drawing'}
                    </p>
                    <p className={`text-sm mt-1 ${result.isScannedPDF ? 'text-purple-800' : 'text-red-800'}`}>
                      {result.rejectionReason}
                    </p>
                  </div>
                </div>

                {/* Analysis details */}
                {result.analysis && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Analysis Details</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Pages:</span>{' '}
                        <span className="font-medium">{result.analysis.pageCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Text extracted:</span>{' '}
                        <span className="font-medium">{result.analysis.hasExtractableText ? 'Yes' : 'No'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Construction confidence:</span>{' '}
                        <span className={`font-medium ${confidence >= 30 ? 'text-green-600' : 'text-red-600'}`}>
                          {confidence}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Indicators found:</span>{' '}
                        <span className="font-medium">{result.analysis.foundIndicators.length}</span>
                      </div>
                    </div>
                    {result.analysis.foundIndicators.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Matched keywords:</p>
                        <div className="flex flex-wrap gap-1">
                          {result.analysis.foundIndicators.slice(0, 10).map(kw => (
                            <span key={kw} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{kw}</span>
                          ))}
                          {result.analysis.foundIndicators.length > 10 && (
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              +{result.analysis.foundIndicators.length - 10} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={handleReplacePDF}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" /> Replace PDF
                  </button>
                  <button
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4" /> Retry
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ── Results view (accepted construction drawing) ── */}
            {view === 'results' && result && (
              <div className="space-y-5">
                {/* Success banner */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm text-green-900">Construction Drawing Verified</p>
                    <p className="text-sm text-green-800 mt-0.5">
                      Confidence: <strong>{confidence}%</strong> — {result.pageCount} page{result.pageCount !== 1 ? 's' : ''} extracted.
                      Open the full PDF Takeoff tool to draw measurements and generate your BOQ.
                    </p>
                  </div>
                </div>

                {/* Detected metadata */}
                {meta && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Detected Metadata</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {meta.drawingNumber && (
                        <>
                          <span className="text-gray-500">Drawing No:</span>
                          <span className="font-medium">{meta.drawingNumber}</span>
                        </>
                      )}
                      {meta.drawingTitle && (
                        <>
                          <span className="text-gray-500">Title:</span>
                          <span className="font-medium">{meta.drawingTitle}</span>
                        </>
                      )}
                      {meta.scale && (
                        <>
                          <span className="text-gray-500">Scale:</span>
                          <span className="font-medium">{meta.scale}</span>
                        </>
                      )}
                      {meta.revision && (
                        <>
                          <span className="text-gray-500">Revision:</span>
                          <span className="font-medium">{meta.revision}</span>
                        </>
                      )}
                      {meta.date && (
                        <>
                          <span className="text-gray-500">Date:</span>
                          <span className="font-medium">{meta.date}</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {result.warnings && result.warnings.length > 0 && (
                  <div className="space-y-2">
                    {result.warnings.map((w, i) => (
                      <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                        <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-800">{w}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Matched indicators */}
                {indicators.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Construction keywords found ({indicators.length}):</p>
                    <div className="flex flex-wrap gap-1">
                      {indicators.slice(0, 15).map(kw => (
                        <span key={kw} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{kw}</span>
                      ))}
                      {indicators.length > 15 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                          +{indicators.length - 15} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 flex-wrap pt-2 border-t border-gray-200">
                  <button
                    onClick={handleReplacePDF}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Upload className="w-4 h-4" /> Replace PDF
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <X className="w-4 h-4" /> Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
