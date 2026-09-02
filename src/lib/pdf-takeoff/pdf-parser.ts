import type { PDFAnalysisResult, PDFProcessingResult, DrawingMetadata } from './types';

// ─── Construction drawing indicators ─────────────────────────────────────────
// These keywords are searched in the extracted text (case-insensitive).
// Each match contributes to the confidence score.

const STRONG_INDICATORS = [
  // Drawing type labels
  'floor plan', 'ground floor', 'first floor', 'second floor', 'basement plan',
  'site plan', 'layout plan', 'key plan', 'roof plan',
  'section', 'elevation', 'detail', 'cross section',
  'structural drawing', 'architectural drawing', 'foundation plan',
  // Structural elements
  'footing', 'pile cap', 'raft foundation', 'retaining wall',
  'shear wall', 'core wall', 'transfer slab',
  'beam schedule', 'column schedule', 'slab schedule',
  // Drawing metadata
  'drawing no', 'drawing number', 'drg no', 'dwg no',
  'revision', 'rev no', 'sheet no', 'sheet number',
  'scale 1:', 'scale:', 'nts', 'not to scale',
  'north arrow', 'north',
  // Engineering annotations
  'rcc', 'rbc', 'reinforced cement concrete', 'reinforced concrete',
  'structural steel', 'ms plate', 'hss', 'hollow section',
  'concrete grade', 'm20', 'm25', 'm30', 'm35', 'm40',
  'steel grade', 'fe415', 'fe500', 'fy415', 'fy500',
  'cover to reinforcement', 'clear cover',
  'bbs', 'bar bending schedule',
  // Dimensions and units typical in drawings
  'mm', 'thk', 'thick', 'dia', 'ø', '∅',
  // IS codes
  'is 456', 'is 800', 'is 1786', 'is 2062', 'is 875',
  // Professionals
  'structural engineer', 'architect', 'civil engineer',
  'checked by', 'drawn by', 'approved by', 'designed by',
];

const MODERATE_INDICATORS = [
  'wall', 'column', 'beam', 'slab', 'staircase', 'stair',
  'door', 'window', 'opening', 'lintel', 'parapet',
  'plinth', 'plinth level', 'ffl', 'finished floor level',
  'gl', 'ground level', 'rl', 'reduced level',
  'dimension', 'grid', 'grid line', 'axis',
  'hatch', 'hatching', 'legend', 'symbol',
  'concrete', 'masonry', 'brick', 'block', 'mortar',
  'steel', 'rebar', 'reinforcement', 'stirrup', 'tie',
  'load', 'dead load', 'live load', 'wind load',
  'span', 'cantilever', 'overhang',
  'waterproofing', 'damp proof', 'dpc',
  'excavation', 'backfill', 'compaction',
  'plumbing', 'drainage', 'sanitary',
  'electrical', 'conduit', 'cable tray',
  'hvac', 'duct', 'ahu',
];

// Keywords that strongly suggest this is NOT a construction drawing
const NEGATIVE_INDICATORS = [
  'invoice', 'bill to', 'ship to', 'payment due', 'total amount due',
  'purchase order', 'po number', 'vendor', 'supplier',
  'tax invoice', 'gst invoice', 'vat invoice',
  'receipt', 'payment receipt',
  'resume', 'curriculum vitae', 'cv', 'work experience', 'education',
  'contract agreement', 'terms and conditions', 'whereas',
  'letter of intent', 'memorandum',
  'bank statement', 'account number', 'ifsc',
  'passport', 'aadhaar', 'pan card',
];

const CONFIDENCE_THRESHOLD = 30; // minimum score to be considered a construction drawing

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Processes an uploaded PDF using pdfjs-dist.
 * Extracts real text, page count, metadata and page dimensions.
 * Determines whether the document is a construction drawing via content analysis.
 * Never fabricates construction quantities.
 */
export async function processPDFDrawing(file: File): Promise<PDFProcessingResult> {
  try {
    // Dynamically import pdfjs-dist to avoid SSR issues
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;

    const pageCount = pdfDoc.numPages;
    const pageTexts: string[] = [];
    const pageDimensions: Array<{ width: number; height: number }> = [];
    let totalTextLength = 0;

    // Extract text and dimensions from every page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.0 });
      pageDimensions.push({ width: viewport.width, height: viewport.height });

      try {
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ('str' in item ? item.str : ''))
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        pageTexts.push(pageText);
        totalTextLength += pageText.length;
      } catch {
        pageTexts.push('');
      }
    }

    const hasExtractableText = totalTextLength > 20;
    const allText = pageTexts.join(' ').toLowerCase();

    // ── Scanned / image-only PDF ──────────────────────────────────────────────
    if (!hasExtractableText) {
      return {
        success: false,
        elements: [],
        pageCount,
        isScannedPDF: true,
        isConstructionDrawing: false,
        rejectionReason:
          'This PDF appears to be a scanned or image-only document. ' +
          'No text could be extracted. OCR or AI vision analysis is required '+ 'to process this file. No takeoff was generated.',
        errors: [
          'Scanned PDF detected: text extraction returned no content. ' +
          'Please use an OCR tool to convert this PDF to a text-searchable PDF before uploading.',
        ],
        analysis: {
          pageTexts,
          pageCount,
          pageDimensions,
          hasExtractableText: false,
          constructionConfidence: 0,
          foundIndicators: [],
          detectedMetadata: {},
        },
      };
    }

    // ── Confidence scoring ────────────────────────────────────────────────────
    const foundStrong: string[] = [];
    const foundModerate: string[] = [];
    const foundNegative: string[] = [];

    for (const kw of STRONG_INDICATORS) {
      if (allText.includes(kw.toLowerCase())) foundStrong.push(kw);
    }
    for (const kw of MODERATE_INDICATORS) {
      if (allText.includes(kw.toLowerCase())) foundModerate.push(kw);
    }
    for (const kw of NEGATIVE_INDICATORS) {
      if (allText.includes(kw.toLowerCase())) foundNegative.push(kw);
    }

    // Score: strong = 5 pts each (max 60), moderate = 2 pts each (max 30)
    // Negative indicators reduce score significantly
    const strongScore = Math.min(foundStrong.length * 5, 60);
    const moderateScore = Math.min(foundModerate.length * 2, 30);
    const negativeScore = foundNegative.length * 15;
    const rawScore = strongScore + moderateScore - negativeScore;
    const constructionConfidence = Math.max(0, Math.min(100, rawScore));

    const foundIndicators = [...foundStrong, ...foundModerate];

    // ── Metadata extraction ───────────────────────────────────────────────────
    const detectedMetadata = extractMetadataFromText(allText, file.name);

    const analysis: PDFAnalysisResult = {
      pageTexts,
      pageCount,
      pageDimensions,
      hasExtractableText,
      constructionConfidence,
      foundIndicators,
      detectedMetadata,
    };

    // ── Rejection: non-construction PDF ──────────────────────────────────────
    if (constructionConfidence < CONFIDENCE_THRESHOLD) {
      let reason =
        'This PDF does not appear to be a construction drawing. No takeoff was generated.';

      if (foundNegative.length > 0) {
        const examples = foundNegative.slice(0, 3).join(', ');
        reason = `This PDF appears to be a non-construction document (detected: ${examples}). No takeoff was generated.`;
      } else if (constructionConfidence === 0 && foundIndicators.length === 0) {
        reason =
          'This PDF does not contain any recognisable construction drawing content. ' +
          'No takeoff was generated.';
      }

      return {
        success: false,
        elements: [],
        pageCount,
        isConstructionDrawing: false,
        rejectionReason: reason,
        warnings: [reason],
        analysis,
      };
    }

    // ── Accepted as construction drawing ─────────────────────────────────────
    const metadata: DrawingMetadata = {
      projectName: detectedMetadata.projectName || sanitizeFileName(file.name),
      drawingNumber: detectedMetadata.drawingNumber || '',
      drawingTitle: detectedMetadata.drawingTitle || '',
      scale: detectedMetadata.scale || 'Not detected — calibrate manually',
      revision: detectedMetadata.revision || '',
      date: detectedMetadata.date || '',
      preparedBy: detectedMetadata.preparedBy || '',
      pageCount,
      pageDimensions: pageDimensions.map(d => ({
        width: d.width,
        height: d.height,
        unit: 'pt',
      })),
    };

    return {
      success: true,
      elements: [], // No auto-generated elements — user must draw measurements
      metadata,
      pageCount,
      isConstructionDrawing: true,
      isScannedPDF: false,
      warnings: buildWarnings(detectedMetadata, constructionConfidence),
      analysis,
    };
  } catch (err) {
    return {
      success: false,
      elements: [],
      errors: [
        err instanceof Error
          ? `PDF processing error: ${err.message}`
          : 'An unexpected error occurred while reading the PDF.',
      ],
    };
  }
}

// ─── Metadata extraction helpers ─────────────────────────────────────────────

function extractMetadataFromText(
  text: string,
  fileName: string
): Partial<DrawingMetadata> {
  const meta: Partial<DrawingMetadata> = {};

  // Drawing number patterns: DWG-001, A-101, S-201, C-301, etc.
  const drgMatch = text.match(
    /(?:drawing\s*(?:no|number|#)\s*[:\-]?\s*)([a-z0-9]{1,4}[-\/][a-z0-9]{2,8}(?:[-\/][a-z0-9]{1,6})?)/i
  );
  if (drgMatch) meta.drawingNumber = drgMatch[1].toUpperCase();

  // Scale: "1:100", "1:50", "1:200", etc.
  const scaleMatch = text.match(/scale\s*[:\-]?\s*(1\s*[:/]\s*\d+)/i);
  if (scaleMatch) meta.scale = scaleMatch[1].replace(/\s/g, '');

  // Revision: "Rev A", "Rev 1", "R0", "R1"
  const revMatch = text.match(/(?:rev(?:ision)?\s*[:\-]?\s*)([a-z0-9]{1,3})/i);
  if (revMatch) meta.revision = revMatch[1].toUpperCase();

  // Date patterns
  const dateMatch = text.match(
    /(?:date\s*[:\-]?\s*)(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i
  );
  if (dateMatch) meta.date = dateMatch[1];

  // Prepared by / drawn by
  const prepMatch = text.match(
    /(?:drawn\s*by|prepared\s*by|designer)\s*[:\-]?\s*([a-z][a-z\s\.]{2,30}?)(?:\s{2,}|$)/i
  );
  if (prepMatch) meta.preparedBy = prepMatch[1].trim();

  // Drawing title — look for common title block patterns
  const titlePatterns = [
    /(?:title|drawing\s*title)\s*[:\-]?\s*([a-z][a-z\s\-\/&]{3,60}?)(?:\s{2,}|$)/i,
    /(floor\s*plan|site\s*plan|foundation\s*plan|roof\s*plan|elevation|section|detail)/i,
  ];
  for (const pat of titlePatterns) {
    const m = text.match(pat);
    if (m) { meta.drawingTitle = m[1].trim(); break; }
  }

  // Project name — try to get from filename if not found in text
  if (!meta.projectName) {
    meta.projectName = sanitizeFileName(fileName);
  }

  return meta;
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/\.pdf$/i, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .trim() || 'Construction Project';
}

function buildWarnings(
  meta: Partial<DrawingMetadata>,
  confidence: number
): string[] {
  const warnings: string[] = [];

  if (!meta.scale) {
    warnings.push(
      'No drawing scale was detected in the PDF text. ' + 'You must calibrate the scale manually using the Set Scale tool before measurements can be converted to real quantities.'
    );
  }

  if (!meta.drawingNumber) {
    warnings.push('Drawing number not detected in the document.');
  }

  if (confidence < 50) {
    warnings.push(
      `Construction confidence is low (${confidence}%). ` +
      'Verify this is a construction drawing before proceeding with takeoff.'
    );
  }

  warnings.push(
    'BOQ items are generated only from measurements you draw on the canvas. ' + 'Use the Linear, Area, and Count tools to mark elements, then export quantities.'
  );

  return warnings;
}
