import { BOQ, BOQItem, UserMeasurement } from './types';

interface RateCard {
  description: string;
  unit: string;
  rate: number;
  isCode: string;
}

const RATE_CARDS: Record<string, RateCard> = {
  footing: {
    description: 'Providing and laying in situ M25 grade RCC for isolated footings including formwork',
    unit: 'm³',
    rate: 8500,
    isCode: 'IS 456:2000',
  },
  column: {
    description: 'Providing and laying in situ M25 grade RCC for columns including formwork and reinforcement',
    unit: 'm³',
    rate: 12000,
    isCode: 'IS 456:2000',
  },
  beam: {
    description: 'Providing and laying in situ M25 grade RCC for beams including formwork and reinforcement',
    unit: 'm³',
    rate: 11500,
    isCode: 'IS 456:2000',
  },
  slab: {
    description: 'Providing and laying in situ M20 grade RCC for slabs including formwork and reinforcement',
    unit: 'm³',
    rate: 10500,
    isCode: 'IS 456:2000',
  },
  wall: {
    description: 'Providing and laying 230mm thick brick masonry in CM 1:6 including scaffolding',
    unit: 'm³',
    rate: 4200,
    isCode: 'IS 2212:1991',
  },
  door: {
    description: 'Providing and fixing flush door shutter including frame, fittings and hardware',
    unit: 'Nos',
    rate: 8500,
    isCode: 'IS 4020:1998',
  },
  window: {
    description: 'Providing and fixing aluminium sliding window with glass panes and fittings',
    unit: 'Nos',
    rate: 6500,
    isCode: 'IS 1948:1961',
  },
  staircase: {
    description: 'Providing and laying in situ M20 grade RCC for staircase including formwork',
    unit: 'm³',
    rate: 13000,
    isCode: 'IS 456:2000',
  },
  linear: {
    description: 'Linear measurement as marked on drawing',
    unit: 'm',
    rate: 0,
    isCode: 'As applicable',
  },
  area: {
    description: 'Area measurement as marked on drawing',
    unit: 'm²',
    rate: 0,
    isCode: 'As applicable',
  },
  count: {
    description: 'Count / pin as marked on drawing',
    unit: 'Nos',
    rate: 0,
    isCode: 'As applicable',
  },
};

/**
 * Generates a BOQ exclusively from user-drawn measurements.
 * Never fabricates quantities. Every item is traceable to a specific
 * user action: page number, measurement type, scale, and dimensions.
 */
export function generateBOQFromMeasurements(
  measurements: UserMeasurement[],
  projectName: string,
  drawingNumber: string
): BOQ {
  if (measurements.length === 0) {
    return {
      projectName,
      drawingNumber,
      generatedDate: new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      totalItems: 0,
      totalAmount: 0,
      items: [],
      notes: 'No measurements have been drawn. Use the Linear, Area, and Count tools on the PDF canvas to mark elements, then generate the BOQ.',
    };
  }

  const items: BOQItem[] = measurements.map((m, index) => {
    const elementType = m.elementType || m.type;
    const rateCard = RATE_CARDS[elementType] ?? RATE_CARDS[m.type] ?? {
      description: m.label,
      unit: m.unit,
      rate: 0,
      isCode: 'As applicable',
    };

    const quantity = m.value;
    const rate = rateCard.rate;
    const amount = Math.round(quantity * rate);

    return {
      slNo: index + 1,
      description: m.description || rateCard.description,
      unit: m.unit || rateCard.unit,
      quantity,
      rate,
      amount,
      isCode: rateCard.isCode,
      elementType,
      // Traceability
      sourcePage: m.sourcePage,
      measurementType: m.type,
      scaleFactor: m.scaleDescription,
      dimensions: `${m.value.toFixed(3)} ${m.unit}`,
    };
  });

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return {
    projectName,
    drawingNumber,
    generatedDate: new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    totalItems: items.length,
    totalAmount,
    items,
    notes:
      'All quantities are derived exclusively from measurements drawn by the user on the PDF canvas. ' + 'Rates are indicative and based on prevailing market rates. '+ 'Actual rates may vary based on site conditions, location, and specifications. '+ 'All quantities are subject to field verification.',
  };
}

/**
 * Legacy function kept for backward compatibility with PDFTakeoffModal.
 * Returns an empty BOQ — auto-generation from elements is no longer supported.
 */
export function generateBOQFromElements(
  _elements: unknown[],
  projectName: string,
  drawingNumber: string
): BOQ {
  return {
    projectName,
    drawingNumber,
    generatedDate: new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }),
    totalItems: 0,
    totalAmount: 0,
    items: [],
    notes:
      'Automatic BOQ generation from PDF elements is no longer supported. ' + 'Open the PDF Takeoff tool, calibrate the drawing scale, draw your measurements, and then export the BOQ.',
  };
}
