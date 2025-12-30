# Offline OCR & Data Verification Platform

A production-ready, open-source OCR-driven system that extracts text from multi-page scanned documents, auto-fills digital forms, and verifies user-submitted data against original documents with high accuracy.

## Features

- **Multi-Model OCR Ensemble**: Tesseract, PaddleOCR, EasyOCR with DL-based text detection
- **Advanced Preprocessing**: Deskewing, denoising, contrast enhancement
- **Multilingual Support**: Automatic language/script detection and routing
- **Multi-Page Support**: Handles PDFs and image sequences
- **Intelligent Fusion**: Confidence-weighted voting and edit distance validation
- **Field-Level Verification**: Precise data matching with confidence scores
- **Fully Offline**: No cloud dependencies, all processing local

## Installation

```bash
pip install -r requirements.txt
```

### Additional Setup

1. **Tesseract OCR**: Install from [GitHub releases](https://github.com/UB-Mannheim/tesseract/wiki)
2. **Poppler** (for PDF processing): Install from [poppler-windows](https://github.com/oschwartz10612/poppler-windows/releases)

## Quick Start

### Backend (API Server)

```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend (React App)

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

See `frontend/README.md` for detailed frontend documentation.

## API Endpoints

- `POST /api/ocr/extract` - Extract text from documents
- `POST /api/verify/check` - Verify form data against documents

See `docs/API_SCHEMAS.md` for detailed documentation.

## Architecture

See `docs/ARCHITECTURE.md` for system design and data flow.

