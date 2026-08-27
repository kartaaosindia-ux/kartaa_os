import { DrawingElement, DrawingMetadata, PDFProcessingResult } from './types';

/**
 * Simulates PDF parsing by extracting mock construction elements.
 * In a production environment, this would use pdfjs-dist or a backend service
 * to extract actual dimensions and elements from the drawing.
 */
export async function processPDFDrawing(file: File): Promise<PDFProcessingResult> {
  return new Promise((resolve) => {
    // Simulate async processing delay
    setTimeout(() => {
      try {
        const fileName = file.name.replace(/\.pdf$/i, '');
        const drawingNumber = extractDrawingNumber(fileName);

        const metadata: DrawingMetadata = {
          projectName: deriveProjectName(fileName),
          drawingNumber,
          drawingTitle: 'Structural Drawing',
          scale: '1:100',
          revision: 'R0',
          date: new Date().toLocaleDateString('en-IN'),
          preparedBy: 'Auto-Generated',
        };

        const elements: DrawingElement[] = generateMockElements(fileName);

        resolve({
          success: true,
          elements,
          metadata,
          pageCount: 1,
          warnings:
            elements.length === 0
              ? ['No recognizable construction elements found in the drawing.']
              : [],
        });
      } catch (err) {
        resolve({
          success: false,
          elements: [],
          errors: [err instanceof Error ? err.message : 'Failed to process PDF'],
        });
      }
    }, 1500);
  });
}

function extractDrawingNumber(fileName: string): string {
  const match = fileName.match(/([A-Z]{2,4}-\d{3,6})/i);
  if (match) return match[1].toUpperCase();
  const parts = fileName.split(/[-_\s]/);
  if (parts.length >= 2) return `DWG-${parts[0].toUpperCase()}`;
  return `DWG-${Date.now().toString().slice(-6)}`;
}

function deriveProjectName(fileName: string): string {
  const cleaned = fileName
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\.(pdf|dwg|dxf)$/i, '');
  return cleaned.length > 3 ? cleaned : 'Construction Project';
}

function generateMockElements(fileName: string): DrawingElement[] {
  const lower = fileName.toLowerCase();
  const isStructural = lower.includes('str') || lower.includes('struct') || lower.includes('foundation');
  const isArchitectural = lower.includes('arch') || lower.includes('floor') || lower.includes('plan');

  const elements: DrawingElement[] = [];

  if (isStructural) {
    elements.push(
      {
        id: 'e1',
        type: 'footing',
        dimensions: { length: 1.5, width: 1.5, height: 0.45 },
        quantity: 12,
        unit: 'm³',
        label: 'Isolated Footing F1',
      },
      {
        id: 'e2',
        type: 'column',
        dimensions: { length: 0.45, width: 0.45, height: 3.0 },
        quantity: 12,
        unit: 'm³',
        label: 'RCC Column C1 (450x450)',
      },
      {
        id: 'e3',
        type: 'beam',
        dimensions: { length: 5.0, width: 0.3, height: 0.45 },
        quantity: 18,
        unit: 'm³',
        label: 'RCC Beam B1 (300x450)',
      },
      {
        id: 'e4',
        type: 'slab',
        dimensions: { area: 180, thickness: 0.125 },
        quantity: 22.5,
        unit: 'm³',
        label: 'RCC Slab (125mm thick)',
      }
    );
  } else if (isArchitectural) {
    elements.push(
      {
        id: 'e1',
        type: 'wall',
        dimensions: { length: 45.0, height: 3.0, thickness: 0.23 },
        quantity: 31.05,
        unit: 'm³',
        label: 'Brick Masonry Wall (230mm)',
      },
      {
        id: 'e2',
        type: 'door',
        dimensions: { length: 1.0, height: 2.1 },
        quantity: 8,
        unit: 'Nos',
        label: 'Flush Door D1 (1000x2100)',
      },
      {
        id: 'e3',
        type: 'window',
        dimensions: { length: 1.2, height: 1.2 },
        quantity: 14,
        unit: 'Nos',
        label: 'Aluminium Window W1 (1200x1200)',
      },
      {
        id: 'e4',
        type: 'slab',
        dimensions: { area: 200, thickness: 0.125 },
        quantity: 25.0,
        unit: 'm³',
        label: 'RCC Slab (125mm thick)',
      }
    );
  } else {
    // Generic building drawing
    elements.push(
      {
        id: 'e1',
        type: 'wall',
        dimensions: { length: 60.0, height: 3.0, thickness: 0.23 },
        quantity: 41.4,
        unit: 'm³',
        label: 'Brick Masonry Wall (230mm)',
      },
      {
        id: 'e2',
        type: 'column',
        dimensions: { length: 0.3, width: 0.3, height: 3.0 },
        quantity: 8,
        unit: 'm³',
        label: 'RCC Column (300x300)',
      },
      {
        id: 'e3',
        type: 'slab',
        dimensions: { area: 150, thickness: 0.125 },
        quantity: 18.75,
        unit: 'm³',
        label: 'RCC Slab (125mm thick)',
      },
      {
        id: 'e4',
        type: 'door',
        dimensions: { length: 0.9, height: 2.1 },
        quantity: 6,
        unit: 'Nos',
        label: 'Flush Door (900x2100)',
      },
      {
        id: 'e5',
        type: 'window',
        dimensions: { length: 1.2, height: 1.2 },
        quantity: 10,
        unit: 'Nos',
        label: 'Aluminium Window (1200x1200)',
      }
    );
  }

  return elements;
}
