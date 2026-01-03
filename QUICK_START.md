# Quick Start Guide

Complete setup guide for the OCR & Data Verification Platform (Backend + Frontend).

## Prerequisites

1. **Python 3.8+** installed
2. **Node.js 16+** and npm installed
3. **Tesseract OCR** installed (see `docs/INSTALLATION.md`)
4. **Poppler** installed (for PDF processing)

## Backend Setup

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Verify External Dependencies

```bash
# Check Tesseract
tesseract --version

# Check Poppler (Linux/macOS)
pdftoppm -h
```

### 3. Start Backend Server

```bash
python app.py
```

Backend API will be running at `http://localhost:5000`

### 4. Test Backend

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "OCR & Data Verification Platform",
  "version": "1.0.0"
}
```

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will be running at `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

## Using the Application

### OCR Extraction

1. Click on **"OCR Extraction"** in the navigation
2. Drag & drop or click to select a PDF/image file
3. Click **"Extract Text"**
4. View extracted text, confidence scores, and bounding boxes

### Data Verification

1. Click on **"Data Verification"** in the navigation
2. Upload the original document
3. Enter form field data (name, email, phone, etc.)
4. Click **"Verify Data"**
5. View field-level verification results with match/mismatch status

## Troubleshooting

### Backend Issues

**Problem**: Tesseract not found
```bash
# Windows: Add Tesseract to PATH or set in code
# Linux: sudo apt-get install tesseract-ocr
# macOS: brew install tesseract
```

**Problem**: Import errors
```bash
pip install -r requirements.txt --force-reinstall
```

**Problem**: Port 5000 already in use
```bash
# Change port in config.yaml or app.py
```

### Frontend Issues

**Problem**: Cannot connect to API
- Ensure backend is running on `http://localhost:5000`
- Check browser console for errors
- Verify CORS is enabled (should be by default)

**Problem**: npm install fails
```bash
# Clear cache and retry
npm cache clean --force
npm install
```

**Problem**: Port 3000 already in use
```bash
# Vite will automatically use next available port
# Or change in vite.config.js
```

## Production Build

### Backend

Backend runs as-is. For production:
- Use Gunicorn (Linux/macOS): `gunicorn -w 4 -b 0.0.0.0:5000 app:app`
- Use Waitress (Windows): `waitress-serve --host=0.0.0.0 --port=5000 app:app`

### Frontend

```bash
cd frontend
npm run build
```

Built files will be in `frontend/dist/`. Serve with any static file server.

## Architecture

```
┌─────────────┐
│   Browser   │
│  (React)    │
└──────┬──────┘
       │ HTTP
       │
┌──────▼──────┐
│ Flask API   │
│ (Python)    │
└──────┬──────┘
       │
┌──────▼──────────────────┐
│ OCR Engines             │
│ (Tesseract/Paddle/Easy)│
└─────────────────────────┘
```

## Next Steps

- Read `docs/ARCHITECTURE.md` for system design
- Check `docs/API_SCHEMAS.md` for API documentation
- Review `frontend/README.md` for frontend details
- Explore `examples/` for code examples

## Support

For detailed installation instructions, see `docs/INSTALLATION.md`


