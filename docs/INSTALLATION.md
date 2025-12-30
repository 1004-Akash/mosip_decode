# Installation Guide

## Prerequisites

### System Requirements
- **OS**: Windows 10+, Linux, macOS
- **Python**: 3.8 or higher
- **RAM**: 4 GB minimum (8 GB recommended)
- **Disk Space**: 5 GB for installation and models
- **CPU**: Multi-core recommended for parallel processing
- **GPU**: Optional but recommended for faster DL-based OCR

### External Dependencies

#### 1. Tesseract OCR
**Windows**:
- Download from: https://github.com/UB-Mannheim/tesseract/wiki
- Install to default location: `C:\Program Files\Tesseract-OCR`
- Add to PATH or configure in code

**Linux**:
```bash
sudo apt-get update
sudo apt-get install tesseract-ocr
sudo apt-get install tesseract-ocr-eng tesseract-ocr-fra  # Add languages as needed
```

**macOS**:
```bash
brew install tesseract
brew install tesseract-lang  # For additional languages
```

#### 2. Poppler (for PDF processing)
**Windows**:
- Download from: https://github.com/oschwartz10612/poppler-windows/releases
- Extract and add `bin` folder to PATH

**Linux**:
```bash
sudo apt-get install poppler-utils
```

**macOS**:
```bash
brew install poppler
```

## Installation Steps

### 1. Clone or Download Repository
```bash
cd mosip_v2
```

### 2. Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Python Dependencies
```bash
pip install -r requirements.txt
```

**Note**: This may take 10-20 minutes as it downloads:
- PyTorch and dependencies (~1-2 GB)
- PaddleOCR models (~500 MB)
- EasyOCR models (~500 MB)

### 4. Verify Installation

#### Test Tesseract
```bash
tesseract --version
```

#### Test Python Imports
```python
python -c "import pytesseract; import cv2; import paddleocr; import easyocr; print('All imports successful')"
```

### 5. Configure (Optional)

Edit `config.yaml` to customize:
- OCR engine settings
- Preprocessing options
- API configuration
- Verification thresholds

## Quick Start

### Start the API Server
```bash
python app.py
```

The server will start on `http://localhost:5000`

### Test Health Endpoint
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

## Troubleshooting

### Issue: Tesseract not found
**Solution**: 
- Ensure Tesseract is installed and in PATH
- Or set path explicitly:
  ```python
  import pytesseract
  pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
  ```

### Issue: Poppler not found (PDF processing fails)
**Solution**:
- Install Poppler and add to PATH
- Or set path in code:
  ```python
  from pdf2image import convert_from_path
  # Set poppler_path if needed
  ```

### Issue: Out of memory errors
**Solution**:
- Reduce batch size in config
- Process documents one at a time
- Close other applications
- Consider GPU acceleration

### Issue: Slow performance
**Solution**:
- Enable GPU if available (set `use_gpu: true` in config)
- Reduce image resolution in preprocessing
- Disable unused OCR engines
- Use fewer languages in EasyOCR

### Issue: Import errors
**Solution**:
- Ensure virtual environment is activated
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`
- Check Python version: `python --version` (should be 3.8+)

## GPU Setup (Optional)

### CUDA Installation (for GPU acceleration)

**Windows**:
1. Install CUDA Toolkit from NVIDIA
2. Install cuDNN
3. PyTorch will detect CUDA automatically

**Linux**:
```bash
# Install CUDA (varies by distribution)
# PyTorch will use CUDA if available
```

**Verify GPU**:
```python
import torch
print(torch.cuda.is_available())  # Should be True
```

Then set in `config.yaml`:
```yaml
ocr:
  engines:
    paddleocr:
      use_gpu: true
    easyocr:
      gpu: true
```

## Language Support

### Adding Languages

**Tesseract**:
- Download language data files (.traineddata)
- Place in Tesseract `tessdata` folder
- Update config: `languages: "eng+fra+deu+..."`

**PaddleOCR**:
- Supports 80+ languages out of the box
- Update config: `lang: "en"` (change as needed)

**EasyOCR**:
- Supports 80+ languages
- Update config: `languages: ["en", "hi", "ar", ...]`

## Production Deployment

### Using Gunicorn (Linux/macOS)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Using Waitress (Windows)
```bash
pip install waitress
waitress-serve --host=0.0.0.0 --port=5000 app:app
```

### Docker (Future Enhancement)
```dockerfile
# Dockerfile can be added for containerized deployment
```

## Next Steps

1. Read `docs/ARCHITECTURE.md` for system overview
2. Review `docs/API_SCHEMAS.md` for API usage
3. Check `docs/DESIGN_DECISIONS.md` for design rationale
4. Test with sample documents

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review documentation in `docs/` folder
3. Check logs for error messages
4. Verify all dependencies are installed correctly


