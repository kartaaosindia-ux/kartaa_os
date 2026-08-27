export interface BOQItem {
  slNo: number;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  isCode?: string;
  elementType?: string;
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
}

export interface PDFProcessingResult {
  success: boolean;
  elements: DrawingElement[];
  metadata?: DrawingMetadata;
  boq?: BOQ;
  warnings?: string[];
  errors?: string[];
  pageCount?: number;
}
