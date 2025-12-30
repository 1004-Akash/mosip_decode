# API Request/Response Schemas

## Base URL
```
http://localhost:5000
```

## Endpoints

### 1. Health Check

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "healthy",
  "service": "OCR & Data Verification Platform",
  "version": "1.0.0"
}
```

---

### 2. OCR Extraction API

**Endpoint**: `POST /api/ocr/extract`

**Description**: Extracts text from multi-page PDFs or images using ensemble OCR engines.

**Request**:
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (required): PDF or image file (png, jpg, jpeg, tiff, bmp)
  - Maximum file size: 50 MB

**Request Example** (cURL):
```bash
curl -X POST http://localhost:5000/api/ocr/extract \
  -F "file=@document.pdf"
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "text": "Extracted text content from the document...",
    "confidence": 0.92,
    "boxes": [
      {
        "text": "Sample text",
        "bbox": [100, 200, 300, 250],
        "confidence": 0.95,
        "page_num": 1
      },
      {
        "text": "More text",
        "bbox": [100, 300, 400, 350],
        "confidence": 0.88,
        "page_num": 1
      }
    ],
    "page_count": 3,
    "detected_language": "en",
    "language_confidence": 0.98,
    "engines_used": ["tesseract", "paddleocr", "easyocr"],
    "fusion_method": "confidence_weighted"
  },
  "metadata": {
    "filename": "document.pdf",
    "file_size": 2048576,
    "total_boxes": 45
  }
}
```

**Response Fields**:
- `text` (string): Full extracted text from all pages
- `confidence` (float): Average confidence score (0.0 - 1.0)
- `boxes` (array): Array of text bounding boxes with:
  - `text` (string): Extracted text in this box
  - `bbox` (array): Bounding box coordinates [x1, y1, x2, y2]
  - `confidence` (float): Confidence for this text box
  - `page_num` (int): Page number (1-indexed)
- `page_count` (int): Total number of pages
- `detected_language` (string): Detected language code (ISO 639-1)
- `language_confidence` (float): Language detection confidence
- `engines_used` (array): List of OCR engines that contributed
- `fusion_method` (string): Fusion method used

**Error Responses**:

400 Bad Request:
```json
{
  "error": "No file provided"
}
```

400 Bad Request (Invalid file type):
```json
{
  "error": "File type not allowed. Allowed types: pdf, png, jpg, jpeg, tiff, bmp"
}
```

400 Bad Request (File too large):
```json
{
  "error": "File too large. Maximum size: 50 MB"
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

---

### 3. Data Verification API

**Endpoint**: `POST /api/verify/check`

**Description**: Verifies user-submitted form data against OCR-extracted text from the original document.

**Request**:
- **Method**: POST
- **Content-Type**: `multipart/form-data`
- **Parameters**:
  - `file` (required): Original document (PDF or image)
  - `form_data` (required): JSON string containing form field data

**Request Example** (cURL):
```bash
curl -X POST http://localhost:5000/api/verify/check \
  -F "file=@document.pdf" \
  -F "form_data={\"name\":\"John Doe\",\"email\":\"john@example.com\",\"phone\":\"123-456-7890\"}"
```

**Request Example** (JavaScript):
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('form_data', JSON.stringify({
  name: "John Doe",
  email: "john@example.com",
  phone: "123-456-7890",
  address: "123 Main St"
}));

fetch('http://localhost:5000/api/verify/check', {
  method: 'POST',
  body: formData
})
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "verification_results": {
      "name": {
        "field_value": "John Doe",
        "ocr_value": "John Doe",
        "match_status": "MATCH",
        "similarity": 1.0,
        "similarity_scores": {
          "levenshtein": 1.0,
          "fuzzy_ratio": 1.0,
          "fuzzy_partial": 1.0,
          "fuzzy_token": 1.0
        },
        "exact_match": true,
        "partial_match": false,
        "confidence": 0.96,
        "ocr_confidence": 0.92
      },
      "email": {
        "field_value": "john@example.com",
        "ocr_value": "john@example.com",
        "match_status": "MATCH",
        "similarity": 1.0,
        "similarity_scores": {
          "levenshtein": 1.0,
          "fuzzy_ratio": 1.0,
          "fuzzy_partial": 1.0,
          "fuzzy_token": 1.0
        },
        "exact_match": true,
        "partial_match": false,
        "confidence": 0.95,
        "ocr_confidence": 0.91
      },
      "phone": {
        "field_value": "123-456-7890",
        "ocr_value": "123 456 7890",
        "match_status": "MATCH",
        "similarity": 0.95,
        "similarity_scores": {
          "levenshtein": 0.95,
          "fuzzy_ratio": 0.95,
          "fuzzy_partial": 1.0,
          "fuzzy_token": 0.95
        },
        "exact_match": false,
        "partial_match": true,
        "confidence": 0.88,
        "ocr_confidence": 0.85
      },
      "address": {
        "field_value": "123 Main St",
        "ocr_value": "123 Main Street",
        "match_status": "PARTIAL_MATCH",
        "similarity": 0.82,
        "similarity_scores": {
          "levenshtein": 0.82,
          "fuzzy_ratio": 0.82,
          "fuzzy_partial": 0.90,
          "fuzzy_token": 0.85
        },
        "exact_match": false,
        "partial_match": true,
        "confidence": 0.75,
        "ocr_confidence": 0.80
      }
    },
    "summary": {
      "total_fields": 4,
      "matches": 3,
      "partial_matches": 1,
      "mismatches": 0,
      "match_rate": 0.75,
      "overall_confidence": 0.885
    },
    "ocr_metadata": {
      "ocr_confidence": 0.87,
      "text_length": 1250,
      "boxes_count": 28
    }
  }
}
```

**Response Fields**:

**Verification Results** (per field):
- `field_value` (string): User-submitted value
- `ocr_value` (string): OCR-extracted value for this field
- `match_status` (string): One of "MATCH", "PARTIAL_MATCH", "MISMATCH"
- `similarity` (float): Best similarity score (0.0 - 1.0)
- `similarity_scores` (object): Detailed similarity metrics
  - `levenshtein`: Levenshtein distance ratio
  - `fuzzy_ratio`: FuzzyWuzzy ratio score
  - `fuzzy_partial`: FuzzyWuzzy partial ratio
  - `fuzzy_token`: FuzzyWuzzy token sort ratio
- `exact_match` (boolean): True if values match exactly
- `partial_match` (boolean): True if partial match detected
- `confidence` (float): Overall verification confidence (0.0 - 1.0)
- `ocr_confidence` (float): OCR confidence for this field

**Summary**:
- `total_fields` (int): Number of fields verified
- `matches` (int): Number of exact/strong matches
- `partial_matches` (int): Number of partial matches
- `mismatches` (int): Number of mismatches
- `match_rate` (float): Ratio of matches to total fields
- `overall_confidence` (float): Average confidence across all fields

**OCR Metadata**:
- `ocr_confidence` (float): Overall OCR confidence
- `text_length` (int): Length of extracted text
- `boxes_count` (int): Number of text boxes detected

**Error Responses**:

400 Bad Request:
```json
{
  "error": "No document file provided"
}
```

400 Bad Request (Missing form data):
```json
{
  "error": "No form data provided"
}
```

400 Bad Request (Invalid JSON):
```json
{
  "error": "Invalid JSON in form_data"
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "error": "Error message describing the issue"
}
```

---

## Match Status Definitions

### MATCH
- Exact string match (after normalization), OR
- Similarity score ≥ threshold (default: 0.85), OR
- High confidence partial match (similarity ≥ 0.6)

### PARTIAL_MATCH
- Partial containment (one value contains the other), AND
- Similarity score ≥ 0.6 but < threshold

### MISMATCH
- Similarity score < 0.6, OR
- No significant overlap between values

---

## Confidence Score Interpretation

- **0.9 - 1.0**: Very High Confidence - Strong match
- **0.7 - 0.9**: High Confidence - Good match
- **0.5 - 0.7**: Medium Confidence - Moderate match
- **0.3 - 0.5**: Low Confidence - Weak match
- **0.0 - 0.3**: Very Low Confidence - Likely mismatch

---

## Example Use Cases

### 1. Form Auto-Fill
```javascript
// Extract text from document
const ocrResponse = await fetch('/api/ocr/extract', {
  method: 'POST',
  body: formData
});
const ocrData = await ocrResponse.json();

// Use extracted text to auto-fill form
// Then verify user's corrections
const verifyResponse = await fetch('/api/verify/check', {
  method: 'POST',
  body: verifyFormData
});
```

### 2. Document Verification
```python
import requests

# Verify identity document
with open('id_card.pdf', 'rb') as f:
    files = {'file': f}
    data = {
        'form_data': json.dumps({
            'name': 'John Doe',
            'dob': '1990-01-01',
            'id_number': 'ABC123456'
        })
    }
    response = requests.post(
        'http://localhost:5000/api/verify/check',
        files=files,
        data=data
    )
    result = response.json()
    
    # Check verification results
    for field, verification in result['data']['verification_results'].items():
        if verification['match_status'] != 'MATCH':
            print(f"Field {field} mismatch: {verification['field_value']} vs {verification['ocr_value']}")
```


