# Project Structure

```
mosip_v2/
│
├── app.py                          # Main Flask application (API server)
├── config.yaml                     # Configuration file
├── requirements.txt                # Python dependencies
├── README.md                       # Quick start guide
├── PROJECT_STRUCTURE.md            # This file
├── .gitignore                      # Git ignore rules
│
├── docs/                           # Comprehensive documentation
│   ├── ARCHITECTURE.md             # System architecture and design
│   ├── API_SCHEMAS.md              # API request/response schemas
│   ├── DATA_FLOW.md                # End-to-end data flow
│   ├── CONFIDENCE_SCORING.md       # Confidence calculation logic
│   ├── MODEL_JUSTIFICATIONS.md     # Research-grade model choices
│   ├── DESIGN_DECISIONS.md         # Judge-friendly explanations
│   ├── INSTALLATION.md             # Setup and installation guide
│   └── SUMMARY.md                  # Platform overview
│
├── examples/                       # Example usage scripts
│   ├── test_ocr.py                 # OCR extraction example
│   └── test_verification.py        # Verification example
│
└── src/                            # Source code
    ├── __init__.py
    │
    ├── preprocessing/              # Image preprocessing modules
    │   ├── __init__.py
    │   └── preprocessor.py         # Deskewing, denoising, enhancement
    │
    ├── ocr/                        # OCR engine modules
    │   ├── __init__.py
    │   ├── ocr_ensemble.py         # Main orchestrator
    │   ├── tesseract_engine.py     # Tesseract wrapper
    │   ├── paddle_engine.py        # PaddleOCR wrapper
    │   ├── easyocr_engine.py      # EasyOCR wrapper
    │   ├── text_detector.py        # DL-based text detection
    │   ├── language_detector.py    # Language detection
    │   └── fusion.py                # Output fusion logic
    │
    ├── verification/               # Data verification modules
    │   ├── __init__.py
    │   └── verifier.py             # Field-level verification
    │
    └── utils/                      # Utility modules
        ├── __init__.py
        └── image_utils.py          # Image loading/conversion
```

## Module Descriptions

### Core Application
- **app.py**: Flask REST API server with two main endpoints:
  - `/api/ocr/extract`: OCR extraction
  - `/api/verify/check`: Data verification

### Configuration
- **config.yaml**: Centralized configuration for:
  - OCR engine settings
  - Preprocessing options
  - Verification thresholds
  - API settings

### Preprocessing (`src/preprocessing/`)
- **preprocessor.py**: Image enhancement pipeline:
  - Deskewing (rotation correction)
  - Denoising (bilateral filter, NLM)
  - Contrast enhancement (CLAHE)
  - Binarization (adaptive thresholding)

### OCR Engines (`src/ocr/`)
- **ocr_ensemble.py**: Orchestrates all OCR engines
- **tesseract_engine.py**: Tesseract OCR integration
- **paddle_engine.py**: PaddleOCR integration
- **easyocr_engine.py**: EasyOCR integration
- **text_detector.py**: Deep learning text detection (CRAFT/DBNet)
- **language_detector.py**: Automatic language detection
- **fusion.py**: Combines multiple OCR outputs

### Verification (`src/verification/`)
- **verifier.py**: Field-level data verification:
  - Similarity calculation (Levenshtein, FuzzyWuzzy)
  - Match status determination
  - Confidence scoring

### Utilities (`src/utils/`)
- **image_utils.py**: Image loading, PDF conversion, format handling

### Documentation (`docs/`)
Comprehensive documentation covering:
- Architecture and design
- API usage and schemas
- Data flow diagrams
- Confidence scoring logic
- Model justifications
- Design decisions
- Installation guide

### Examples (`examples/`)
- **test_ocr.py**: Example OCR extraction script
- **test_verification.py**: Example verification script

## Key Design Patterns

1. **Modular Architecture**: Each component is independently testable
2. **Configuration-Driven**: Behavior controlled via config.yaml
3. **Error Handling**: Comprehensive try-catch blocks with graceful degradation
4. **Logging**: Structured logging throughout
5. **Type Hints**: Python type hints for better code clarity

## Entry Points

1. **API Server**: `python app.py`
2. **OCR Extraction**: Use `/api/ocr/extract` endpoint
3. **Verification**: Use `/api/verify/check` endpoint
4. **Examples**: Run scripts in `examples/` folder

## Dependencies

See `requirements.txt` for complete list. Key dependencies:
- Flask (API server)
- OpenCV (image processing)
- Tesseract (via pytesseract)
- PaddleOCR (DL-based OCR)
- EasyOCR (multilingual OCR)
- PyTorch (deep learning backend)
- Various text processing libraries

## External Requirements

1. **Tesseract OCR**: Must be installed separately
2. **Poppler**: Required for PDF processing
3. **CUDA** (optional): For GPU acceleration

See `docs/INSTALLATION.md` for setup instructions.


