"""
Main FastAPI application for OCR and Data Verification API
"""
import os
import logging
import yaml
import json
import tempfile
from typing import Dict, Optional, List, Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.ocr.ocr_ensemble import OCREnsemble
from src.verification.verifier import DataVerifier

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load configuration
config_path = os.path.join(os.path.dirname(__file__), 'config.yaml')
with open(config_path, 'r') as f:
    config = yaml.safe_load(f)

# Initialize OCR and Verification components
ocr_ensemble = OCREnsemble(config)
data_verifier = DataVerifier(config)

# API configuration
api_config = config.get('api', {})
MAX_FILE_SIZE = api_config.get('max_file_size', 50) * 1024 * 1024  # Convert to bytes
ALLOWED_EXTENSIONS = set(api_config.get('allowed_extensions', ['pdf', 'png', 'jpg', 'jpeg', 'tiff', 'bmp']))

# Initialize FastAPI app
app = FastAPI(
    title="OCR & Data Verification Platform API",
    description="""
    Production-ready OCR system with multi-engine ensemble and data verification.
    
    ## Features
    
    * **Multi-Engine OCR**: Tesseract, PaddleOCR, EasyOCR running in parallel
    * **Hindi Support**: Full support for Hindi (हिंदी) language
    * **Data Verification**: Field-level verification with confidence scores
    * **Multi-Page PDF**: Support for multi-page documents
    
    ## OCR Engines
    
    All three engines run in parallel:
    - **Tesseract**: LSTM-based, excellent for printed text
    - **PaddleOCR**: DBNet + CRNN, layout-aware, multilingual
    - **EasyOCR**: CRAFT + ResNet/BiLSTM, handles noisy text
    
    Results are fused using confidence-weighted voting, edit distance, and dictionary validation.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Models for API Documentation
class HealthResponse(BaseModel):
    status: str = Field(..., example="healthy", description="Service status")
    service: str = Field(..., example="OCR & Data Verification Platform", description="Service name")
    version: str = Field(..., example="1.0.0", description="API version")


class OCRBox(BaseModel):
    text: str = Field(..., description="Extracted text in this box")
    bbox: List[int] = Field(..., description="Bounding box coordinates [x1, y1, x2, y2]")
    confidence: float = Field(..., description="Confidence score (0.0-1.0)")
    page_num: Optional[int] = Field(None, description="Page number (for multi-page documents)")


class OCREngineOutput(BaseModel):
    text: str = Field(..., description="Extracted text from this engine")
    confidence: float = Field(..., description="Average confidence score")
    boxes: List[OCRBox] = Field(default=[], description="Text bounding boxes")
    status: str = Field(..., description="Engine status: success, failed, or empty_output")


class FusedResult(BaseModel):
    text: str = Field(..., description="Fused text from all engines")
    confidence: float = Field(..., description="Overall confidence score")
    boxes: List[OCRBox] = Field(default=[], description="All bounding boxes")
    source_models: List[str] = Field(..., description="List of engines used")
    fusion_method: str = Field(..., description="Fusion method used")


class OCRResponseData(BaseModel):
    page_number: Optional[int] = Field(None, description="Page number (for single page)")
    page_count: Optional[int] = Field(None, description="Total pages (for multi-page)")
    text: str = Field(..., description="Extracted text (legacy format)")
    confidence: float = Field(..., description="Average confidence (legacy format)")
    boxes: List[Any] = Field(default=[], description="Bounding boxes (legacy format)")
    detected_language: str = Field(..., description="Detected language code")
    language_confidence: float = Field(..., description="Language detection confidence")
    engines_used: List[str] = Field(..., description="Engines used (legacy format)")
    fusion_method: str = Field(..., description="Fusion method")
    ocr_outputs: Dict[str, Any] = Field(..., description="Per-engine outputs")
    fused_result: Dict[str, Any] = Field(..., description="Fused result from all engines")
    metadata: Dict[str, Any] = Field(..., description="Additional metadata")


class OCRResponse(BaseModel):
    success: bool = Field(..., example=True, description="Request success status")
    data: OCRResponseData = Field(..., description="OCR extraction results")
    error: Optional[str] = Field(None, description="Error message if failed")


class VerificationFieldResult(BaseModel):
    field_value: str = Field(..., description="User-submitted value")
    ocr_value: str = Field(..., description="OCR-extracted value")
    match_status: str = Field(..., description="MATCH, PARTIAL_MATCH, or MISMATCH")
    similarity: float = Field(..., description="Similarity score (0.0-1.0)")
    confidence: float = Field(..., description="Overall confidence")
    exact_match: bool = Field(..., description="Whether values match exactly")
    partial_match: bool = Field(..., description="Whether partial match detected")


class VerificationSummary(BaseModel):
    total_fields: int = Field(..., description="Total number of fields verified")
    matches: int = Field(..., description="Number of matches")
    partial_matches: int = Field(..., description="Number of partial matches")
    mismatches: int = Field(..., description="Number of mismatches")
    match_rate: float = Field(..., description="Match rate (0.0-1.0)")
    overall_confidence: float = Field(..., description="Overall confidence score")


class VerificationResponse(BaseModel):
    success: bool = Field(..., example=True, description="Request success status")
    data: Dict = Field(..., description="Verification results")
    error: Optional[str] = Field(None, description="Error message if failed")


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health Check Endpoint
    
    Returns the health status of the API service.
    """
    return HealthResponse(
        status="healthy",
        service="OCR & Data Verification Platform",
        version="1.0.0"
    )


@app.post("/api/ocr/extract", response_model=OCRResponse, tags=["OCR"])
async def extract_text(file: UploadFile = File(..., description="PDF or image file (PNG, JPG, JPEG, TIFF, BMP)")):
    """
    OCR Text Extraction API
    
    Extracts text from multi-page PDFs or images using a multi-engine OCR ensemble.
    
    **Features:**
    - Runs Tesseract, PaddleOCR, and EasyOCR in parallel
    - Automatic language detection (supports Hindi and 80+ languages)
    - Confidence-weighted fusion of results
    - Returns per-engine outputs and fused result
    
    **Supported Formats:**
    - PDF (multi-page)
    - Images: PNG, JPG, JPEG, TIFF, BMP
    
    **Response includes:**
    - Extracted text from all three engines
    - Fused result with confidence scores
    - Bounding boxes for each text region
    - Detected language and confidence
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file selected")
        
        if not allowed_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Read file content
        contents = await file.read()
        file_size = len(contents)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File too large. Maximum size: {MAX_FILE_SIZE / (1024*1024)} MB"
            )
        
        # Save file temporarily
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'png'
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_ext}') as tmp_file:
            tmp_file.write(contents)
            temp_path = tmp_file.name
        
        try:
            # Extract text based on file type
            if file_ext == 'pdf':
                result = ocr_ensemble.extract_from_pdf(temp_path)
                
                # Get fused result for backward compatibility
                fused = result.get('fused_result', {})
                
                # Format multi-page response
                response_data = OCRResponseData(
                    page_count=result.get('page_count', 0),
                    text=fused.get('text', ''),
                    confidence=fused.get('confidence', 0.0),
                    boxes=fused.get('boxes', []),
                    detected_language='unknown',
                    language_confidence=0.0,
                    engines_used=fused.get('source_models', []),
                    fusion_method='confidence_weighted',
                    ocr_outputs={},  # Will be populated from pages
                    fused_result={
                        'text': fused.get('text', ''),
                        'confidence': fused.get('confidence', 0.0),
                        'boxes': fused.get('boxes', []),
                        'source_models': fused.get('source_models', []),
                        'fusion_method': 'confidence_weighted'
                    },
                    metadata={
                        'filename': file.filename,
                        'file_size': file_size,
                        'total_boxes': len(fused.get('boxes', [])),
                        'pages': result.get('pages', []),
                        'aggregated_ocr_outputs': result.get('aggregated_ocr_outputs', {})
                    }
                )
            else:
                # Single image result
                result = ocr_ensemble.extract_from_image(temp_path)
                
                # Get fused result for backward compatibility
                fused = result.get('fused_result', {})
                ocr_outputs = result.get('ocr_outputs', {})
                metadata = result.get('metadata', {})
                
                response_data = OCRResponseData(
                    page_number=result.get('page_number', 1),
                    page_count=1,
                    text=fused.get('text', ''),
                    confidence=fused.get('confidence', 0.0),
                    boxes=fused.get('boxes', []),
                    detected_language=metadata.get('detected_language', 'unknown'),
                    language_confidence=metadata.get('language_confidence', 0.0),
                    engines_used=fused.get('source_models', []),
                    fusion_method=fused.get('fusion_method', 'unknown'),
                    ocr_outputs=ocr_outputs,
                    fused_result={
                        'text': fused.get('text', ''),
                        'confidence': fused.get('confidence', 0.0),
                        'boxes': fused.get('boxes', []),
                        'source_models': fused.get('source_models', []),
                        'fusion_method': fused.get('fusion_method', 'unknown')
                    },
                    metadata={
                        'filename': file.filename,
                        'file_size': file_size,
                        'detected_language': metadata.get('detected_language', 'unknown'),
                        'language_confidence': metadata.get('language_confidence', 0.0),
                        'engines_executed': metadata.get('engines_executed', []),
                        'total_boxes': len(fused.get('boxes', []))
                    }
                )
            
            return OCRResponse(success=True, data=response_data)
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"OCR extraction error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/verify/check", response_model=VerificationResponse, tags=["Verification"])
async def verify_data(
    file: UploadFile = File(..., description="Original document (PDF or image)"),
    form_data: str = Form(..., description='JSON string with form field data, e.g., {"name": "John Doe", "email": "john@example.com"}')
):
    """
    Data Verification API
    
    Verifies user-submitted form data against OCR-extracted text from the original document.
    
    **Process:**
    1. Extracts text from the document using multi-engine OCR
    2. Compares each form field against OCR-extracted values
    3. Returns field-level match/mismatch status with confidence scores
    
    **Verification Methods:**
    - Levenshtein distance for character-level comparison
    - FuzzyWuzzy for token-level comparison
    - Partial matching for abbreviations and variations
    
    **Match Status:**
    - **MATCH**: Exact match or similarity ≥ 0.85
    - **PARTIAL_MATCH**: Partial containment with similarity ≥ 0.6
    - **MISMATCH**: Similarity < 0.6
    
    **Example form_data:**
    ```json
    {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "123-456-7890"
    }
    ```
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file selected")
        
        # Parse form data
        try:
            form_data_dict = json.loads(form_data)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in form_data")
        
        if not isinstance(form_data_dict, dict):
            raise HTTPException(status_code=400, detail="form_data must be a JSON object")
        
        # Read file content
        contents = await file.read()
        
        # Save file temporarily
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else 'png'
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file_ext}') as tmp_file:
            tmp_file.write(contents)
            temp_path = tmp_file.name
        
        try:
            # Extract text from document
            if file_ext == 'pdf':
                ocr_result = ocr_ensemble.extract_from_pdf(temp_path)
            else:
                ocr_result = ocr_ensemble.extract_from_image(temp_path)
            
            # Verify form data
            verification_result = data_verifier.verify_form(form_data_dict, ocr_result)
            
            # Format response
            response_data = {
                'verification_results': verification_result['verification_results'],
                'summary': verification_result['summary'],
                'ocr_metadata': verification_result['ocr_metadata']
            }
            
            return VerificationResponse(success=True, data=response_data)
            
        finally:
            # Clean up temp file
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Verification error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == '__main__':
    import uvicorn
    
    host = api_config.get('host', '0.0.0.0')
    port = api_config.get('port', 5000)
    debug = api_config.get('debug', False)
    
    logger.info(f"Starting OCR & Data Verification Platform on {host}:{port}")
    logger.info(f"API Documentation available at http://{host}:{port}/docs")
    
    uvicorn.run(
        "app:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info"
    )
