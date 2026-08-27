'use client';

import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

interface PDFUploaderProps {
  onFileSelected: (file: File) => void;
  isLoading?: boolean;
}

export default function PDFUploader({ onFileSelected, isLoading = false }: PDFUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setFileError(null);
      if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
        setFileError('Only PDF files are supported. Please upload a .pdf file.');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setFileError('File size exceeds 50 MB. Please upload a smaller file.');
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSelect(file);
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center w-full min-h-64 border-2 border-dashed rounded-xl transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}
          ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleInputChange}
          disabled={isLoading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Upload PDF drawing"
        />
        <div className="flex flex-col items-center gap-4 p-8 text-center pointer-events-none">
          <div
            className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-gray-100'}`}
          >
            <UploadCloud
              className={`w-10 h-10 ${isDragging ? 'text-blue-600' : 'text-gray-400'}`}
            />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-700">
              {isDragging ? 'Drop your PDF here' : 'Drag & drop your PDF drawing'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or <span className="text-blue-600 font-medium">browse to upload</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <FileText className="w-4 h-4" />
            <span>Supports PDF construction drawings up to 50 MB</span>
          </div>
        </div>
      </div>

      {fileError && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-700">{fileError}</p>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400 text-center">
        Upload architectural or structural PDF drawings to auto-generate a Bill of Quantities (BOQ) as per Indian Standards.
      </p>
    </div>
  );
}
