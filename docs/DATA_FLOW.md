# End-to-End Data Flow

## Overview

This document describes the complete data flow through the OCR and Data Verification Platform, from document upload to final verification results.

## OCR Extraction Data Flow

### 1. Request Reception
```
Client → POST /api/ocr/extract
         └─ multipart/form-data
            └─ file: document.pdf/image
```

### 2. File Validation & Storage
```
API Server
  ├─ Validate file extension
  ├─ Check file size (< 50 MB)
  ├─ Save to temporary file
  └─ Determine file type (PDF/image)
```

### 3. Document Conversion (if PDF)
```
PDF File
  └─ pdf2image.convert_from_path()
     └─ List of PIL Images
        └─ Convert to numpy arrays
           └─ [Image1, Image2, ..., ImageN]
```

### 4. Image Preprocessing Pipeline
```
For each image:
  Image (numpy array)
    ├─ Convert to grayscale (if needed)
    ├─ Resize (if > max_dim)
    ├─ Deskew (rotation correction)
    ├─ Denoise (bilateral filter + NLM)
    ├─ Enhance contrast (CLAHE)
    └─ Binarize (adaptive threshold)
       └─ Processed Image
```

### 5. Text Detection (Optional)
```
Processed Image
  └─ Text Detector (CRAFT/DBNet or fallback)
     └─ List of text regions
        └─ [Region1, Region2, ..., RegionN]
           └─ Each region: {bbox, confidence, area}
```

### 6. Multi-Engine OCR Processing (Parallel)
```
Processed Image
  ├─→ Tesseract Engine
  │     └─ pytesseract.image_to_data()
  │        └─ Result1: {text, confidence, boxes}
  │
  ├─→ PaddleOCR Engine
  │     └─ ocr.ocr(image)
  │        └─ Result2: {text, confidence, boxes}
  │
  └─→ EasyOCR Engine
        └─ reader.readtext(image)
           └─ Result3: {text, confidence, boxes}
```

### 7. Language Detection
```
OCR Results (from any engine)
  └─ Sample text (first 500 chars)
     └─ langdetect.detect()
        └─ Language: {code, confidence}
           └─ Example: "en" (0.98)
```

### 8. Output Fusion
```
[Result1, Result2, Result3]
  └─ Fusion Engine
     ├─ Filter by min_confidence
     ├─ Calculate weighted average
     ├─ Merge bounding boxes
     └─ Select best text (confidence-weighted)
        └─ Fused Result:
           {
             text: "Combined text...",
             confidence: 0.92,
             boxes: [all merged boxes],
             engines_used: ["tesseract", "paddleocr", "easyocr"]
           }
```

### 9. Page Aggregation (Multi-Page)
```
Page Results: [Page1, Page2, ..., PageN]
  └─ Aggregate
     ├─ Combine text with page breaks
     ├─ Merge all boxes (with page numbers)
     ├─ Calculate average confidence
     └─ Final Result:
        {
          text: "Page1 text\n\n--- Page Break ---\n\nPage2 text...",
          confidence: 0.90,
          boxes: [all boxes with page_num],
          page_count: N
        }
```

### 10. Response Formation
```
Final Result
  └─ Format JSON Response
     {
       success: true,
       data: {
         text: "...",
         confidence: 0.90,
         boxes: [...],
         page_count: 3,
         detected_language: "en",
         language_confidence: 0.98,
         engines_used: [...],
         fusion_method: "confidence_weighted"
       },
       metadata: {
         filename: "document.pdf",
         file_size: 2048576,
         total_boxes: 45
       }
     }
  └─ Return to Client (HTTP 200)
```

---

## Data Verification Data Flow

### 1. Request Reception
```
Client → POST /api/verify/check
         └─ multipart/form-data
            ├─ file: document.pdf/image
            └─ form_data: JSON string
               {
                 "name": "John Doe",
                 "email": "john@example.com",
                 ...
               }
```

### 2. Document OCR Extraction
```
Same flow as OCR Extraction (steps 2-9 above)
  └─ OCR Result:
     {
       text: "Full extracted text...",
       confidence: 0.87,
       boxes: [...]
     }
```

### 3. Form Data Parsing
```
form_data (JSON string)
  └─ json.loads()
     └─ Form Data Dictionary:
        {
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "123-456-7890"
        }
```

### 4. Field-Level OCR Extraction
```
For each field in form_data:
  Field: "name" → "John Doe"
    └─ Field Extractor
       ├─ Search OCR boxes for matching text
       ├─ Use keyword-based extraction
       └─ Extract field value from OCR text
          └─ Field OCR Map:
             {
               "name": "John Doe" (from OCR),
               "email": "john@example.com" (from OCR),
               ...
             }
```

### 5. Field Verification (Per Field)
```
For each field:
  User Value: "John Doe"
  OCR Value: "John Doe"
  OCR Confidence: 0.92
  
  └─ Verification Engine
     ├─ Normalize both values
     │   ├─ Lowercase (if case_insensitive)
     │   └─ Remove extra whitespace
     │
     ├─ Calculate Similarity Scores
     │   ├─ Levenshtein ratio: 1.0
     │   ├─ Fuzzy ratio: 1.0
     │   ├─ Fuzzy partial: 1.0
     │   └─ Fuzzy token: 1.0
     │      └─ Best similarity: 1.0
     │
     ├─ Check Match Status
     │   ├─ Exact match? → MATCH
     │   ├─ Similarity ≥ 0.85? → MATCH
     │   ├─ Partial match? → PARTIAL_MATCH
     │   └─ Otherwise → MISMATCH
     │
     └─ Calculate Confidence
        └─ field_confidence = 
           (0.4 × ocr_conf) + 
           (0.4 × similarity) + 
           (0.2 × completeness)
           = 0.968
        
        └─ Field Result:
           {
             field_value: "John Doe",
             ocr_value: "John Doe",
             match_status: "MATCH",
             similarity: 1.0,
             confidence: 0.968,
             ...
           }
```

### 6. Verification Aggregation
```
Field Results: [Field1, Field2, ..., FieldN]
  └─ Aggregate
     ├─ Count matches: 3
     ├─ Count partial_matches: 1
     ├─ Count mismatches: 0
     ├─ Calculate match_rate: 0.75
     ├─ Calculate overall_confidence: 0.885
     └─ Summary:
        {
          total_fields: 4,
          matches: 3,
          partial_matches: 1,
          mismatches: 0,
          match_rate: 0.75,
          overall_confidence: 0.885
        }
```

### 7. Response Formation
```
Verification Results
  └─ Format JSON Response
     {
       success: true,
       data: {
         verification_results: {
           "name": {match_status: "MATCH", ...},
           "email": {match_status: "MATCH", ...},
           ...
         },
         summary: {
           total_fields: 4,
           matches: 3,
           ...
         },
         ocr_metadata: {
           ocr_confidence: 0.87,
           text_length: 1250,
           boxes_count: 28
         }
       }
     }
  └─ Return to Client (HTTP 200)
```

---

## Data Structures

### OCR Result Structure
```python
{
    "text": str,                    # Full extracted text
    "confidence": float,            # 0.0 - 1.0
    "boxes": [
        {
            "text": str,            # Text in this box
            "bbox": [x1, y1, x2, y2],  # Bounding box
            "confidence": float,    # Box confidence
            "page_num": int         # Page number (1-indexed)
        },
        ...
    ],
    "page_count": int,             # Total pages
    "detected_language": str,       # Language code
    "language_confidence": float,   # Language detection confidence
    "engines_used": [str],         # List of engines
    "fusion_method": str            # Fusion method used
}
```

### Verification Result Structure
```python
{
    "verification_results": {
        "field_name": {
            "field_value": str,     # User-submitted value
            "ocr_value": str,        # OCR-extracted value
            "match_status": str,     # "MATCH" | "PARTIAL_MATCH" | "MISMATCH"
            "similarity": float,    # Best similarity score
            "similarity_scores": {
                "levenshtein": float,
                "fuzzy_ratio": float,
                "fuzzy_partial": float,
                "fuzzy_token": float
            },
            "exact_match": bool,
            "partial_match": bool,
            "confidence": float,     # Overall confidence
            "ocr_confidence": float  # OCR confidence for this field
        },
        ...
    },
    "summary": {
        "total_fields": int,
        "matches": int,
        "partial_matches": int,
        "mismatches": int,
        "match_rate": float,
        "overall_confidence": float
    },
    "ocr_metadata": {
        "ocr_confidence": float,
        "text_length": int,
        "boxes_count": int
    }
}
```

---

## Error Handling Flow

### OCR Extraction Errors
```
Error at any step
  └─ Try-Catch Block
     ├─ Log error with details
     ├─ Continue with other engines (if applicable)
     ├─ Return partial results (if available)
     └─ Return error response:
        {
          success: false,
          error: "Error message"
        }
```

### Verification Errors
```
Error during verification
  └─ Try-Catch Block
     ├─ Log error
     ├─ Return error for specific field (if field-level)
     └─ Return error response:
        {
          success: false,
          error: "Error message"
        }
```

---

## Performance Characteristics

### Processing Time (per page)
- **Preprocessing**: 0.5 - 1.0 seconds
- **Tesseract OCR**: 1 - 3 seconds
- **PaddleOCR**: 2 - 5 seconds (CPU), 0.5 - 1 second (GPU)
- **EasyOCR**: 2 - 4 seconds (CPU), 0.5 - 1 second (GPU)
- **Fusion**: < 0.1 seconds
- **Total (parallel)**: 2 - 5 seconds per page

### Memory Usage
- **Base**: ~500 MB
- **With models**: ~2 - 4 GB
- **Per document**: ~100 - 500 MB (temporary)

### Accuracy Flow
- **Raw OCR**: 85 - 95% (single engine)
- **After preprocessing**: +5 - 15% improvement
- **After ensemble**: 92 - 99% accuracy
- **Verification confidence**: 0.7 - 1.0 for matches

---

## Optimization Points

1. **Parallel Processing**: OCR engines run simultaneously
2. **Caching**: Can cache OCR results for repeated documents
3. **Lazy Loading**: Models loaded on first use
4. **Memory Management**: Temporary files cleaned up immediately
5. **GPU Acceleration**: Optional GPU support for DL models

---

## Data Privacy & Security

1. **Local Processing**: All data stays on local system
2. **Temporary Files**: Automatically deleted after processing
3. **No External Calls**: No data sent to external services
4. **Memory Cleanup**: Images cleared from memory after processing


