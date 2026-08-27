// PDF Takeoff System Types and Interfaces

export interface DrawingElement {
  id: string;
  type: 'wall' | 'door' | 'window' | 'floor' | 'roof' | 'column' | 'beam' | 'staircase' | 'other';
  dimensions: Dimensions;
  material?: string;
  quantity: number;
  unit: string;
  location?: string;
  notes?: string;
}

export interface Dimensions {
  length?: number;
  width?: number;
  height?: number;
  depth?: number;
  area?: number;
  perimeter?: number;
  volume?: number;
}

export interface DrawingMetadata {
  title: string;
  projectName: string;
  scale: string;
  unit: 'mm' | 'cm' | 'm' | 'ft';
  date: string;
  architect?: string;
  drawingNumber?: string;
}

export interface BOQItem {
  slNo: number;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  amount: number;
  isCode?: string; // IS Code reference
}

export interface BOQ {
  projectName: string;
  drawingNumber: string;
  generatedDate: string;
  totalItems: number;
  items: BOQItem[];
  totalAmount: number;
  notes?: string;
}

export interface PDFProcessingResult {
  success: boolean;
  metadata: DrawingMetadata | null;
  elements: DrawingElement[];
  boq: BOQ | null;
  errors?: string[];
  warnings?: string[];
}

export interface IndianStandardRates {
  [key: string]: {
    description: string;
    unit: string;
    rate: number;
    isCode: string;
  };
}
