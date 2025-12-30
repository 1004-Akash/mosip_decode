"""
Example script for testing data verification
"""
import requests
import json

# API endpoint
API_URL = "http://localhost:5000/api/verify/check"

# Test form data
form_data = {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "address": "123 Main Street",
    "date_of_birth": "1990-01-01"
}

def test_verification(file_path, form_data):
    """Test data verification API"""
    
    with open(file_path, 'rb') as f:
        files = {'file': f}
        data = {'form_data': json.dumps(form_data)}
        response = requests.post(API_URL, files=files, data=data)
    
    if response.status_code == 200:
        result = response.json()
        print("✓ Verification Successful")
        print(f"\nSummary:")
        summary = result['data']['summary']
        print(f"  Total Fields: {summary['total_fields']}")
        print(f"  Matches: {summary['matches']}")
        print(f"  Partial Matches: {summary['partial_matches']}")
        print(f"  Mismatches: {summary['mismatches']}")
        print(f"  Match Rate: {summary['match_rate']:.2%}")
        print(f"  Overall Confidence: {summary['overall_confidence']:.2f}")
        
        print(f"\nField-Level Results:")
        for field, verification in result['data']['verification_results'].items():
            status = verification['match_status']
            confidence = verification['confidence']
            similarity = verification['similarity']
            
            status_symbol = "✓" if status == "MATCH" else "⚠" if status == "PARTIAL_MATCH" else "✗"
            print(f"  {status_symbol} {field}: {status} (confidence: {confidence:.2f}, similarity: {similarity:.2f})")
            print(f"    User: {verification['field_value']}")
            print(f"    OCR:  {verification['ocr_value']}")
        
        return result
    else:
        print(f"✗ Error: {response.status_code}")
        print(response.json())
        return None

if __name__ == "__main__":
    # Replace with your test file path
    test_file = "test_document.pdf"  # or "test_image.png"
    
    print(f"Testing verification with: {test_file}")
    print(f"Form Data: {json.dumps(form_data, indent=2)}")
    print()
    
    result = test_verification(test_file, form_data)
    
    if result:
        print("\n✓ Test completed successfully")


