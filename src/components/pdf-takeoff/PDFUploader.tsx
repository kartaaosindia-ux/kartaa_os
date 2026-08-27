'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileX } from 'lucide-react';

interface PDFUploaderProps {
  onFileSelected: (file: File) => Promise<void>;
  isLoading?: boolean;
}

export default function PDFUploader({ onFileSelected, isLoading = false }: PDFUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]?.type === 'application/pdf') {
      handleFile(files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setSelectedFile(file);
    await onFileSelected(file);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf"
          onChange={handleChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="flex flex-col items-center justify-center gap-3">
          <Upload className="w-12 h-12 text-gray-400" />
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-700">
              {selectedFile ? 'File Selected' : 'Upload Construction Drawing'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {selectedFile
                ? selectedFile.name
                : 'Drag and drop your PDF or click to browse'}
            </p>
          </div>
          {!isLoading && (
            <button
              onClick={handleClick}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {selectedFile ? 'Choose Different File' : 'Select PDF'}
            </button>
          )}
          {isLoading && (
            <div className="mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
      </div>

      {selectedFile && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          <span className="text-sm text-green-800">
            {selectedFile.name} ready for processing
          </span>
        </div>
      )}
    </div>
  );
}
