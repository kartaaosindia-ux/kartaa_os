import { DrawingElement, BOQ, BOQItem, IndianStandardRates } from './types';
import { STANDARD_MATERIAL_RATES, CONSTRUCTION_ELEMENTS } from './constants';

export class BOQGenerator {
  private elements: DrawingElement[];
  private rates: IndianStandardRates;
  private projectName: string;
  private drawingNumber: string;

  constructor(
    elements: DrawingElement[],
    projectName: string,
    drawingNumber: string,
    customRates?: IndianStandardRates
  ) {
    this.elements = elements;
    this.projectName = projectName;
    this.drawingNumber = drawingNumber;
    this.rates = customRates || (STANDARD_MATERIAL_RATES as any);
  }

  generateBOQ(): BOQ {
    const items: BOQItem[] = this.generateBOQItems();
    const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

    return {
      projectName: this.projectName,
      drawingNumber: this.drawingNumber,
      generatedDate: new Date().toISOString().split('T')[0],
      totalItems: items.length,
      items: items.map((item, index) => ({ ...item, slNo: index + 1 })),
      totalAmount,
      notes: 'Generated as per Indian Standard Codes'
    };
  }

  private generateBOQItems(): BOQItem[] {
    const groupedElements = this.groupElementsByType();
    const items: BOQItem[] = [];

    Object.entries(groupedElements).forEach(([type, elements]) => {
      const materialKey = this.getMaterialKey(type);
      const rateInfo = this.rates[materialKey];

      if (rateInfo) {
        const totalQuantity = this.calculateTotalQuantity(elements);
        items.push({
          slNo: 0, // Will be set during BOQ finalization
          description: rateInfo.description,
          unit: rateInfo.unit,
          quantity: totalQuantity,
          rate: rateInfo.rate,
          amount: totalQuantity * rateInfo.rate,
          isCode: rateInfo.isCode
        });
      }
    });

    return items;
  }

  private groupElementsByType(): Record<string, DrawingElement[]> {
    return this.elements.reduce(
      (grouped, element) => {
        const type = element.type;
        if (!grouped[type]) grouped[type] = [];
        grouped[type].push(element);
        return grouped;
      },
      {} as Record<string, DrawingElement[]>
    );
  }

  private calculateTotalQuantity(elements: DrawingElement[]): number {
    return elements.reduce((total, element) => {
      let quantity = element.quantity;

      // Calculate area-based quantities
      if (element.dimensions.area) {
        quantity = element.dimensions.area;
      } else if (element.dimensions.volume) {
        quantity = element.dimensions.volume;
      } else if (element.dimensions.length && element.dimensions.width) {
        quantity = element.dimensions.length * element.dimensions.width;
      }

      return total + quantity;
    }, 0);
  }

  private getMaterialKey(elementType: string): string {
    const typeToMaterialMap: Record<string, string> = {
      [CONSTRUCTION_ELEMENTS.WALL]: 'brick_masonry_9inch',
      [CONSTRUCTION_ELEMENTS.DOOR]: 'wooden_door',
      [CONSTRUCTION_ELEMENTS.WINDOW]: 'window_frame',
      [CONSTRUCTION_ELEMENTS.FLOOR]: 'tiles_flooring',
      [CONSTRUCTION_ELEMENTS.ROOF]: 'roofing_material',
      [CONSTRUCTION_ELEMENTS.COLUMN]: 'concrete_m30',
      [CONSTRUCTION_ELEMENTS.BEAM]: 'concrete_m30',
      [CONSTRUCTION_ELEMENTS.STAIRCASE]: 'concrete_m30'
    };

    return typeToMaterialMap[elementType] || 'other';
  }

  addCustomRate(key: string, description: string, unit: string, rate: number, isCode: string): void {
    this.rates[key] = { description, unit, rate, isCode };
  }

  updateRates(updatedRates: IndianStandardRates): void {
    this.rates = { ...this.rates, ...updatedRates };
  }
}

export function generateBOQFromElements(
  elements: DrawingElement[],
  projectName: string,
  drawingNumber: string
): BOQ {
  const generator = new BOQGenerator(elements, projectName, drawingNumber);
  return generator.generateBOQ();
}
