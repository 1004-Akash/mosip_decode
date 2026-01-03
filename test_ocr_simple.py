"""
Simple test script to verify OCR is working
"""
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import yaml
from src.ocr.ocr_ensemble import OCREnsemble

# Load config
with open('config.yaml', 'r') as f:
    config = yaml.safe_load(f)

# Initialize ensemble
print("Initializing OCR ensemble...")
ensemble = OCREnsemble(config)
print("OK - OCR ensemble initialized")

# Test with a simple message
print("\nTesting OCR engines...")
print("Note: This requires an actual image file to test OCR extraction")
print("To test, run: python test_ocr_simple.py <image_path>")

if len(sys.argv) > 1:
    image_path = sys.argv[1]
    print(f"\nExtracting text from: {image_path}")
    try:
        result = ensemble.extract_from_image(image_path)
        print(f"\nOK - Extraction complete!")
        print(f"  Page: {result.get('page_number', 'N/A')}")
        print(f"  Fused text length: {len(result.get('fused_result', {}).get('text', ''))}")
        print(f"  Fused confidence: {result.get('fused_result', {}).get('confidence', 0):.2f}")
        
        ocr_outputs = result.get('ocr_outputs', {})
        for engine, output in ocr_outputs.items():
            status = output.get('status', 'unknown')
            conf = output.get('confidence', 0)
            text_len = len(output.get('text', ''))
            print(f"  {engine}: status={status}, confidence={conf:.2f}, text_length={text_len}")
    except Exception as e:
        print(f"ERROR: {e}")
        import traceback
        traceback.print_exc()

