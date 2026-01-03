# System Architecture

## Overview

The Offline OCR & Data Verification Platform is a production-ready, open-source system designed to extract text from scanned documents and verify user-submitted form data against original documents. The system operates entirely offline, using multiple OCR engines in an ensemble configuration to achieve high accuracy and reliability.

## Architecture Diagram (Logical Description)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Application                        │
│                    (Web/Mobile/Desktop App)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ HTTP/REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                      Flask API Server                            │
│  ┌──────────────────┐          ┌──────────────────┐            │
│  │  OCR Extraction  │          │ Data Verification│            │
│  │      Endpoint    │          │     Endpoint     │            │
│  └────────┬─────────┘          └────────┬─────────┘            │
└───────────┼──────────────────────────────┼───────────────────────┘
            │                              │
            │                              │
┌───────────▼──────────────────────────────▼───────────────────────┐
│                    OCR Ensemble Orchestrator                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Image Preprocessing Pipeline                  │  │
│  │  • Deskewing  • Denoising  • Contrast Enhancement         │  │
│  │  • Binarization  • Resizing                               │  │
│  └──────────────────────┬─────────────────────────────────────┘  │
│                         │                                         │
│  ┌──────────────────────▼─────────────────────────────────────┐ │
│  │            Multi-Engine OCR Processing                      │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                │ │
│  │  │Tesseract │  │PaddleOCR │  │ EasyOCR  │                │ │
│  │  │  Engine  │  │  Engine  │  │  Engine  │                │ │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘                │ │
│  └───────┼──────────────┼──────────────┼───────────────────────┘ │
│          │              │              │                         │
│  ┌───────▼──────────────▼──────────────▼───────────────────────┐ │
│  │              Output Fusion Engine                            │ │
│  │  • Confidence-Weighted Voting                               │ │
│  │  • Edit Distance Analysis                                   │ │
│  │  • Dictionary Validation                                    │ │
│  └──────────────────────┬──────────────────────────────────────┘ │
│                         │                                         │
│  ┌──────────────────────▼─────────────────────────────────────┐ │
│  │         Language Detection & Routing                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                    Data Verification Module                        │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Field-Level Comparison Engine                │   │
│  │  • Levenshtein Distance  • Fuzzy Matching                 │   │
│  │  • Partial Field Mapping  • Confidence Scoring            │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────┐
│                    Deep Learning Components                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Text Detector│  │ Language     │  │ OCR Models   │          │
│  │ (CRAFT/DBNet)│  │ Detector     │  │ (PaddleOCR/  │          │
│  │              │  │              │  │  EasyOCR)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└───────────────────────────────────────────────────────────────────┘
```

## Component Descriptions

### 1. API Server Layer
- **Technology**: Flask (Python)
- **Purpose**: RESTful API endpoints for OCR extraction and data verification
- **Features**: File upload handling, request validation, error handling

### 2. Image Preprocessing Pipeline
- **Deskewing**: Corrects document rotation using projection profile analysis
- **Denoising**: Removes noise using bilateral filtering and non-local means
- **Contrast Enhancement**: Applies CLAHE for adaptive histogram equalization
- **Binarization**: Converts to binary using adaptive thresholding
- **Resizing**: Maintains aspect ratio while limiting maximum dimensions

### 3. Multi-Engine OCR Ensemble
- **Tesseract OCR**: Rule-based OCR engine, excellent for printed text
- **PaddleOCR**: Deep learning-based, supports 80+ languages
- **EasyOCR**: CNN-based, handles multilingual and handwritten text
- **Parallel Processing**: All engines run simultaneously for efficiency

### 4. Output Fusion Engine
- **Confidence-Weighted Voting**: Combines results based on confidence scores
- **Edit Distance Analysis**: Uses Levenshtein distance for similarity
- **Dictionary Validation**: Validates against known word lists
- **Best Result Selection**: Chooses optimal output from ensemble

### 5. Language Detection & Routing
- **Automatic Detection**: Identifies document language from OCR samples
- **Dynamic Routing**: Routes text to appropriate OCR models
- **Fallback Mechanism**: Defaults to English if detection fails

### 6. Data Verification Module
- **Field-Level Comparison**: Compares individual form fields
- **Fuzzy Matching**: Handles variations and typos
- **Partial Matching**: Supports partial field mapping
- **Confidence Scoring**: Calculates verification confidence

### 7. Deep Learning Components
- **Text Detection**: CRAFT/DBNet for accurate text region detection
- **OCR Models**: Deep learning models in PaddleOCR and EasyOCR
- **Language Models**: Statistical models for language detection

## Data Flow

### OCR Extraction Flow

1. **File Upload**: Client sends PDF/image file to `/api/ocr/extract`
2. **File Validation**: Server validates file type, size, and format
3. **Document Conversion**: PDF converted to images (if needed)
4. **Preprocessing**: Each page/image goes through preprocessing pipeline
5. **Multi-Engine OCR**: Processed images sent to all OCR engines in parallel
6. **Language Detection**: Initial OCR results analyzed for language
7. **Output Fusion**: Results from all engines combined using fusion algorithm
8. **Response Formation**: Structured response with text, boxes, confidence scores

### Data Verification Flow

1. **Request**: Client sends document + form data to `/api/verify/check`
2. **OCR Extraction**: Document processed through OCR pipeline
3. **Field Extraction**: OCR text analyzed to extract field-level values
4. **Field Comparison**: Each form field compared against OCR-extracted value
5. **Similarity Calculation**: Multiple similarity metrics computed
6. **Match Determination**: MATCH/MISMATCH/PARTIAL_MATCH status assigned
7. **Confidence Scoring**: Overall confidence calculated for each field
8. **Report Generation**: Comprehensive verification report returned

## Design Principles

1. **Modularity**: Each component is independently testable and replaceable
2. **Extensibility**: New OCR engines can be added without major refactoring
3. **Reliability**: Multiple engines provide redundancy and error recovery
4. **Performance**: Parallel processing and efficient algorithms
5. **Accuracy**: Ensemble approach improves accuracy over single engines
6. **Offline Operation**: No external dependencies or cloud services

## Technology Stack

- **Backend**: Python 3.8+, Flask
- **OCR Engines**: Tesseract, PaddleOCR, EasyOCR
- **Image Processing**: OpenCV, PIL, scikit-image
- **Deep Learning**: PyTorch (for PaddleOCR/EasyOCR models)
- **Text Processing**: Levenshtein, fuzzywuzzy, langdetect
- **Document Processing**: pdf2image, Poppler

## Scalability Considerations

- **Horizontal Scaling**: Stateless API design allows multiple instances
- **Caching**: OCR results can be cached for repeated documents
- **Batch Processing**: Can be extended for batch document processing
- **Resource Management**: Configurable GPU/CPU usage for DL models
- **Memory Optimization**: Efficient image processing and cleanup


