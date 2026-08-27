# PDF Construction Takeoff System

Automated Bill of Quantities (BOQ) generation for construction drawings with Indian Standard compliance.

## Features

- **PDF Parsing**: Extract text and metadata from construction drawing PDFs
- **Dimension Extraction**: Automatically detect dimensions from drawing annotations
- **Element Recognition**: Identify construction elements (walls, doors, windows, etc.)
- **BOQ Generation**: Create detailed Bill of Quantities following Indian Standards
- **Material Costing**: Built-in database of standard rates as per IS codes
- **Multiple Export**: Export to PDF, Excel, or JSON formats

## Architecture

### Core Modules

1. **types.ts** - TypeScript interfaces and types for all PDF takeoff operations
2. **constants.ts** - Indian Standard codes and material rates database
3. **pdf-parser.ts** - PDF extraction and dimension detection logic
4. **boq-generator.ts** - BOQ calculation and generation engine

### React Components

1. **PDFUploader** - File upload interface with drag-and-drop support
2. **BOQViewer** - Professional BOQ display with export functionality

### Pages

1. **takeoff/page.tsx** - Main application page orchestrating the takeoff workflow

## Usage

### Basic Usage

```typescript
import { processPDFDrawing } from '@/lib/pdf-takeoff/pdf-parser';
import { generateBOQFromElements } from '@/lib/pdf-takeoff/boq-generator';

// Process PDF
const result = await processPDFDrawing(pdfFile);

// Generate BOQ
if (result.success && result.metadata) {
  const boq = generateBOQFromElements(
    result.elements,
    result.metadata.projectName,
    result.metadata.drawingNumber
  );
}
```

## Indian Standards Compliance

The system follows these key Indian Standards:

- **IS 1200:2004** - Excavation and Earthwork
- **IS 456:2000** - Plain and Reinforced Concrete Code of Practice
- **IS 1905:1987** - Code of Practice for Structural Use of Unreinforced Masonry
- **IS 4014:1984** - Code of Practice for Plaster and Plastering
- **IS 1237:2012** - Code of Practice for Concrete Flooring
- **IS 1514:1990** - Code of Practice for Asbestos Cement Flat Sheets and Shingles
- **IS 5** - Code of Practice for Painting of Steel Structures
- **IS 1286:1993** - Code of Practice for the Installation of Door and Window Frames
- **IS 2175:2005** - Glazing for Buildings

## Material Rates Database

The system includes a comprehensive database of standard construction material rates. Rates can be:
- Updated periodically to reflect market changes
- Customized per project
- Adjusted by location/region

## Future Enhancements

- [ ] AI-based shape and element recognition
- [ ] OCR for text extraction from handwritten notes
- [ ] Real-time rate updates from market databases
- [ ] Multi-drawing project consolidation
- [ ] Integration with BIM models
- [ ] Batch processing for multiple drawings
- [ ] Advanced export with professional formatting
- [ ] Rate templates for different regions

## Configuration

Customize material rates by importing and extending the `STANDARD_MATERIAL_RATES` constant:

```typescript
import { STANDARD_MATERIAL_RATES } from '@/lib/pdf-takeoff/constants';

const customRates = {
  ...STANDARD_MATERIAL_RATES,
  'my_custom_material': {
    description: 'Custom Material',
    unit: 'sqm',
    rate: 500,
    isCode: 'IS XXXX:YYYY'
  }
};
```

## Dependencies

- `pdfjs-dist` - PDF parsing and extraction
- `react-hook-form` - Form handling
- `tailwindcss` - UI styling
- `lucide-react` - Icons

## Performance Considerations

- Large PDFs may take longer to process
- Dimension detection accuracy depends on PDF quality
- Material rate updates may require manual intervention for custom rates

## Support

For issues or feature requests, please create an issue in the repository.
