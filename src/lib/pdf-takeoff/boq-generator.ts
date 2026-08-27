import { BOQ, BOQItem, DrawingElement } from './types';

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
  unknown: {
    description: 'Miscellaneous construction work as per drawing',
    unit: 'LS',
    rate: 5000,
    isCode: 'As applicable',
  },
};

export function generateBOQFromElements(
  elements: DrawingElement[],
  projectName: string,
  drawingNumber: string
): BOQ {
  const items: BOQItem[] = elements.map((element, index) => {
    const rateCard = RATE_CARDS[element.type] ?? RATE_CARDS['unknown'];
    const quantity = element.quantity;
    const rate = rateCard.rate;
    const amount = Math.round(quantity * rate);

    return {
      slNo: index + 1,
      description: element.label || rateCard.description,
      unit: element.unit || rateCard.unit,
      quantity,
      rate,
      amount,
      isCode: rateCard.isCode,
      elementType: element.type,
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
      'Rates are indicative and based on prevailing market rates. Actual rates may vary based on site conditions, location, and specifications. All quantities are subject to verification.',
  };
}
