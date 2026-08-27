import * as pdfjsLib from 'pdfjs-dist';
import { DrawingMetadata, DrawingElement, PDFProcessingResult } from './types';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class PDFParser {
  private pdf: pdfjsLib.PDFDocument | null = null;
  private pageCount: number = 0;

  async loadPDF(file: File | Blob): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    this.pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    this.pageCount = this.pdf.numPages;
  }

  async extractMetadata(): Promise<DrawingMetadata> {
    if (!this.pdf) throw new Error('PDF not loaded');

    const metadata = await this.pdf.getMetadata();
    const firstPage = await this.pdf.getPage(1);
    const textContent = await firstPage.getTextContent();

    return {
      title: metadata.info?.Title || 'Untitled Drawing',
      projectName: this.extractProjectName(textContent) || 'Unknown Project',
      scale: this.extractScale(textContent) || '1:100',
      unit: 'm',
      date: new Date().toISOString().split('T')[0],
      drawingNumber: this.extractDrawingNumber(textContent) || 'N/A'
    };
  }

  async extractPages(): Promise<string[]> {
    if (!this.pdf) throw new Error('PDF not loaded');

    const pages: string[] = [];
    for (let i = 1; i <= this.pageCount; i++) {
      const page = await this.pdf.getPage(i);
      const textContent = await page.getTextContent();
      pages.push(this.extractTextFromPage(textContent));
    }
    return pages;
  }

  private extractTextFromPage(textContent: any): string {
    return textContent.items
      .map((item: any) => item.str)
      .join(' ');
  }

  private extractProjectName(textContent: any): string | null {
    const text = this.extractTextFromPage(textContent);
    const projectMatch = text.match(/project\s*(?:name)?[:\s]+([^\n]+)/i);
    return projectMatch ? projectMatch[1].trim() : null;
  }

  private extractScale(textContent: any): string | null {
    const text = this.extractTextFromPage(textContent);
    const scaleMatch = text.match(/scale[:\s]+([0-9:]+)/i);
    return scaleMatch ? scaleMatch[1].trim() : null;
  }

  private extractDrawingNumber(textContent: any): string | null {
    const text = this.extractTextFromPage(textContent);
    const drawingMatch = text.match(/(?:drawing|dwg)\s*(?:no\.?|number)[:\s]+([^\n\s]+)/i);
    return drawingMatch ? drawingMatch[1].trim() : null;
  }

  async extractDimensions(): Promise<DrawingElement[]> {
    if (!this.pdf) throw new Error('PDF not loaded');

    const elements: DrawingElement[] = [];
    const pages = await this.extractPages();

    pages.forEach((pageText, pageIndex) => {
      const dimensionPattern = /(\d+(?:\.\d+)?)\s*(?:mm|cm|m)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(?:mm|cm|m)/gi;
      let match;

      while ((match = dimensionPattern.exec(pageText)) !== null) {
        elements.push({
          id: `elem-${pageIndex}-${elements.length}`,
          type: 'other',
          dimensions: {
            length: parseFloat(match[1]),
            width: parseFloat(match[2])
          },
          quantity: 1,
          unit: 'nos'
        });
      }
    });

    return elements;
  }
}

export async function processPDFDrawing(file: File | Blob): Promise<PDFProcessingResult> {
  try {
    const parser = new PDFParser();
    await parser.loadPDF(file);

    const metadata = await parser.extractMetadata();
    const elements = await parser.extractDimensions();

    return {
      success: true,
      metadata,
      elements,
      boq: null,
      warnings: elements.length === 0 ? ['No dimensions detected in PDF'] : []
    };
  } catch (error) {
    return {
      success: false,
      metadata: null,
      elements: [],
      boq: null,
      errors: [error instanceof Error ? error.message : 'Unknown error occurred']
    };
  }
}
