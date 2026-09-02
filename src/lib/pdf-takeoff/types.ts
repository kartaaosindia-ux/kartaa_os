export interface BOQItem {
  slNo: number;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  isCode?: string;
  elementType?: string;
  // New: traceability fields
  sourcePage?: number;
  measurementType?: 'linear' | 'area' | 'count';
  scaleFactor?: string;
  dimensions?: string;
}

export interface BOQ {
  projectName: string;
  drawingNumber: string;
  generatedDate: string;
  totalItems: number;
  totalAmount: number;
  items: BOQItem[];
  notes?: string;
}

export interface DrawingElement {
  id: string;
  type: 'wall' | 'column' | 'beam' | 'slab' | 'door' | 'window' | 'staircase' | 'footing' | 'unknown';
  dimensions: {
    length?: number;
    width?: number;
    height?: number;
    thickness?: number;
    diameter?: number;
    area?: number;
    volume?: number;
  };
  quantity: number;
  unit: string;
  label?: string;
}

export interface DrawingMetadata {
  projectName: string;
  drawingNumber: string;
  drawingTitle?: string;
  scale?: string;
  revision?: string;
  date?: string;
  preparedBy?: string;
  pageCount?: number;
  pageDimensions?: Array<{ width: number; height: number; unit: string }>;
}

/** Result of real PDF content analysis */
export interface PDFAnalysisResult {
  /** Raw text extracted per page */
  pageTexts: string[];
  /** Total pages */
  pageCount: number;
  /** Page dimensions in points */
  pageDimensions: Array<{ width: number; height: number }>;
  /** Whether any text was found (false = scanned/image-only PDF) */
  hasExtractableText: boolean;
  /** 0–100 confidence that this is a construction drawing */
  constructionConfidence: number;
  /** Keywords found that indicate a construction drawing */
  foundIndicators: string[];
  /** Detected metadata from text */
  detectedMetadata: Partial<DrawingMetadata>;
}

export interface PDFProcessingResult {
  success: boolean;
  elements: DrawingElement[];
  metadata?: DrawingMetadata;
  boq?: BOQ;
  warnings?: string[];
  errors?: string[];
  pageCount?: number;
  /** Full analysis result for display */
  analysis?: PDFAnalysisResult;
  /** Whether the PDF is a construction drawing */
  isConstructionDrawing?: boolean;
  /** Whether the PDF is scanned/image-only */
  isScannedPDF?: boolean;
  /** Human-readable rejection reason */
  rejectionReason?: string;
}

/** A user-drawn measurement to be converted into a BOQ item */
export interface UserMeasurement {
  id: string;
  type: 'linear' | 'area' | 'count';
  label: string;
  value: number;
  unit: string;
  sourcePage: number;
  scaleDescription: string;
  /** Optional user-assigned element type */
  elementType?: string;
  /** Optional user-assigned description */
  description?: string;
}
