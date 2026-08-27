// Indian Standard Rates and Codes

export const INDIAN_STANDARD_CODES = {
  // Civil Works
  EXCAVATION: 'IS 1200:2004',
  CONCRETE: 'IS 456:2000',
  BRICK_MASONRY: 'IS 1905:1987',
  PLASTERING: 'IS 4014:1984',
  FLOORING: 'IS 1237:2012',
  ROOFING: 'IS 1514:1990',
  PAINTING: 'IS 5',
  DOORS_WINDOWS: 'IS 1286:1993',
  GLAZING: 'IS 2175:2005'
};

// Standard Construction Material Rates (Example - Should be updated regularly)
export const STANDARD_MATERIAL_RATES: Record<string, any> = {
  // Excavation
  'excavation_pit': {
    description: 'Excavation for foundation',
    unit: 'cum',
    rate: 200,
    isCode: INDIAN_STANDARD_CODES.EXCAVATION
  },
  // Concrete
  'concrete_m20': {
    description: 'PCC M20 Grade Concrete',
    unit: 'cum',
    rate: 6500,
    isCode: INDIAN_STANDARD_CODES.CONCRETE
  },
  'concrete_m30': {
    description: 'RCC M30 Grade Concrete',
    unit: 'cum',
    rate: 8500,
    isCode: INDIAN_STANDARD_CODES.CONCRETE
  },
  // Brick Masonry
  'brick_masonry_9inch': {
    description: 'Brick Masonry 9" (230mm) in CM 1:6',
    unit: 'sqm',
    rate: 450,
    isCode: INDIAN_STANDARD_CODES.BRICK_MASONRY
  },
  'brick_masonry_4.5inch': {
    description: 'Brick Masonry 4.5" (115mm) in CM 1:6',
    unit: 'sqm',
    rate: 280,
    isCode: INDIAN_STANDARD_CODES.BRICK_MASONRY
  },
  // Plastering
  'plastering_12mm': {
    description: 'Plastering 12mm Thickness with CM 1:6',
    unit: 'sqm',
    rate: 120,
    isCode: INDIAN_STANDARD_CODES.PLASTERING
  },
  // Flooring
  'tiles_flooring': {
    description: 'Ceramic Tiles Flooring',
    unit: 'sqm',
    rate: 350,
    isCode: INDIAN_STANDARD_CODES.FLOORING
  },
  // Doors & Windows
  'wooden_door': {
    description: 'Wooden Door Frame and Shutter',
    unit: 'nos',
    rate: 2500,
    isCode: INDIAN_STANDARD_CODES.DOORS_WINDOWS
  },
  'window_frame': {
    description: 'Aluminum/MS Window Frame',
    unit: 'sqm',
    rate: 600,
    isCode: INDIAN_STANDARD_CODES.DOORS_WINDOWS
  }
};

export const CONSTRUCTION_ELEMENTS = {
  WALL: 'wall',
  DOOR: 'door',
  WINDOW: 'window',
  FLOOR: 'floor',
  ROOF: 'roof',
  COLUMN: 'column',
  BEAM: 'beam',
  STAIRCASE: 'staircase'
};

export const MEASUREMENT_UNITS = {
  SQUARE_METER: 'sqm',
  CUBIC_METER: 'cum',
  LINEAR_METER: 'lm',
  NUMBER: 'nos',
  KILOGRAM: 'kg',
  LITER: 'ltr'
};
