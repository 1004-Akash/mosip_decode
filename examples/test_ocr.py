"""
Example script for testing OCR extraction
"""
import requests
import json

# API endpoint
API_URL = "http://localhost:5000/api/ocr/extract"

# Test with a PDF or image file
def test_ocr_extraction(file_path):
    """Test OCR extraction API"""
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(API_URL, files=files)
    
    if response.status_code == 200:
        result = response.json()
        print("✓ OCR Extraction Successful")
        print(f"  Confidence: {result['data']['confidence']:.2f}")
        print(f"  Pages: {result['data']['page_count']}")
        print(f"  Language: {result['data']['detected_language']}")
        print(f"  Engines: {', '.join(result['data']['engines_used'])}")
        print(f"\nExtracted Text (first 500 chars):")
        print(result['data']['text'][:500])
        return result
    else:
        print(f"✗ Error: {response.status_code}")
        print(response.json())
        return None

if __name__ == "__main__":
    # Replace with your test file path
    test_file = "test_document.pdf"  # or "test_image.png"
    
    print(f"Testing OCR extraction with: {test_file}")
    result = test_ocr_extraction(test_file)
    
    if result:
        print("\n✓ Test completed successfully")


