# OCR & Data Verification Platform - Frontend

Modern React frontend for the Offline OCR & Data Verification Platform.

## Features

- 🎨 Modern, responsive UI design
- 📄 Document upload (PDF, images)
- 🔍 OCR text extraction with results display
- ✅ Data verification with field-level comparison
- 📊 Visual confidence indicators
- 🎯 Real-time status updates

## Installation

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Build

```bash
npm run build
```

## Configuration

The frontend connects to the Flask API backend. By default, it expects the API at `http://localhost:5000`.

To change the API URL, create a `.env` file:

```
VITE_API_URL=http://localhost:5000
```

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── FileUpload.jsx
│   │   ├── OCRResults.jsx
│   │   └── VerificationResults.jsx
│   ├── pages/               # Page components
│   │   ├── OCRPage.jsx
│   │   └── VerificationPage.jsx
│   ├── services/            # API integration
│   │   └── api.js
│   ├── App.jsx              # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── index.html
├── package.json
└── vite.config.js
```

## Usage

### OCR Extraction
1. Navigate to the OCR Extraction page
2. Upload a PDF or image file
3. Click "Extract Text"
4. View extracted text, confidence scores, and bounding boxes

### Data Verification
1. Navigate to the Data Verification page
2. Upload the original document
3. Enter form field data
4. Click "Verify Data"
5. View field-level verification results with match/mismatch status

## Technologies

- **React 18**: UI framework
- **React Router**: Navigation
- **Vite**: Build tool
- **Axios**: HTTP client
- **React Dropzone**: File upload

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)


