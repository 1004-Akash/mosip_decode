# Confidence Scoring Logic

## Overview

The platform uses a multi-layered confidence scoring system that combines OCR engine confidence, text similarity metrics, and field completeness to provide accurate verification results.

## OCR Confidence Scoring

### Engine-Level Confidence

Each OCR engine provides its own confidence scores:

1. **Tesseract**: Confidence values range from 0-100, normalized to 0.0-1.0
2. **PaddleOCR**: Confidence scores directly in 0.0-1.0 range
3. **EasyOCR**: Confidence scores directly in 0.0-1.0 range

### Fusion Confidence Calculation

When multiple engines are used, confidence is calculated as:

```
fused_confidence = Σ(engine_confidence_i) / n_engines
```

Where:
- `engine_confidence_i` = confidence from engine i
- `n_engines` = number of engines that successfully extracted text

### Box-Level Confidence

For individual text boxes:
- Each OCR engine assigns confidence to detected text regions
- Box confidence is averaged across engines that detected the same region
- Boxes with confidence < threshold (default: 0.5) are filtered out

## Verification Confidence Scoring

### Field-Level Confidence

The verification confidence for each field combines three factors:

```
field_confidence = (w1 × ocr_conf) + (w2 × similarity) + (w3 × completeness)
```

Where:
- `w1` = OCR confidence weight (default: 0.4)
- `w2` = Similarity weight (default: 0.4)
- `w3` = Completeness weight (default: 0.2)
- `ocr_conf` = OCR confidence for the field
- `similarity` = Best similarity score (0.0-1.0)
- `completeness` = 1.0 for exact match, 0.5 for partial match, 0.0 for mismatch

### Similarity Score Calculation

Multiple similarity metrics are computed and the best score is used:

#### 1. Levenshtein Distance Ratio

```
levenshtein_ratio = 1 - (edit_distance / max(len(str1), len(str2)))
```

- Measures minimum number of single-character edits
- Range: 0.0 (completely different) to 1.0 (identical)
- Good for: Character-level differences

#### 2. FuzzyWuzzy Ratio

```
fuzzy_ratio = fuzz.ratio(normalized_str1, normalized_str2) / 100
```

- Token-based comparison
- Range: 0.0 to 1.0
- Good for: Word-level differences

#### 3. FuzzyWuzzy Partial Ratio

```
fuzzy_partial = fuzz.partial_ratio(str1, str2) / 100
```

- Finds best matching substring
- Range: 0.0 to 1.0
- Good for: Partial matches, abbreviations

#### 4. FuzzyWuzzy Token Sort Ratio

```
fuzzy_token = fuzz.token_sort_ratio(str1, str2) / 100
```

- Compares sorted tokens
- Range: 0.0 to 1.0
- Good for: Word order variations

**Best Similarity Selection**:
```
best_similarity = max(levenshtein_ratio, fuzzy_ratio, fuzzy_partial, fuzzy_token)
```

### Confidence Boost Factors

1. **Exact Match Boost**: If exact match, similarity = 1.0
2. **Partial Match Boost**: If partial containment, similarity = max(similarity, 0.7)
3. **High OCR Confidence**: If OCR confidence > 0.9, slight boost to field confidence

## Overall Confidence Calculation

### Document-Level Confidence

For multi-page documents:
```
document_confidence = Σ(page_confidence_i) / n_pages
```

### Verification Summary Confidence

```
overall_confidence = Σ(field_confidence_i) / n_fields
```

## Confidence Thresholds

### OCR Confidence Thresholds

- **High**: ≥ 0.8 - Very reliable extraction
- **Medium**: 0.5 - 0.8 - Reasonable extraction
- **Low**: < 0.5 - Unreliable, may need review

### Verification Confidence Thresholds

- **Very High**: 0.9 - 1.0 - Strong match, high reliability
- **High**: 0.7 - 0.9 - Good match, reliable
- **Medium**: 0.5 - 0.7 - Moderate match, review recommended
- **Low**: 0.3 - 0.5 - Weak match, manual verification needed
- **Very Low**: < 0.3 - Likely mismatch

### Match Status Thresholds

- **MATCH**: similarity ≥ 0.85 OR exact_match = true
- **PARTIAL_MATCH**: 0.6 ≤ similarity < 0.85 AND partial_match = true
- **MISMATCH**: similarity < 0.6

## Normalization Impact on Confidence

Text normalization affects confidence calculation:

1. **Case Insensitivity**: "John" vs "JOHN" → similarity = 1.0
2. **Whitespace Normalization**: "John  Doe" vs "John Doe" → similarity = 1.0
3. **Punctuation**: "123-456-7890" vs "123 456 7890" → similarity ≈ 0.95

## Confidence Calibration

### Calibration Factors

1. **Language-Specific**: Some languages have lower baseline OCR confidence
2. **Document Quality**: Poor quality documents reduce confidence
3. **Text Type**: Handwritten text typically has lower confidence than printed
4. **Field Type**: Structured fields (dates, numbers) have different confidence patterns

### Confidence Adjustment

The system can be calibrated by adjusting weights in `config.yaml`:

```yaml
verification:
  confidence_scoring:
    ocr_confidence_weight: 0.4    # Increase for OCR-reliant scenarios
    similarity_weight: 0.4        # Increase for similarity-reliant scenarios
    field_completeness_weight: 0.2 # Increase for exact-match scenarios
```

## Example Calculations

### Example 1: Exact Match

**Input**:
- User value: "John Doe"
- OCR value: "John Doe"
- OCR confidence: 0.92

**Calculation**:
- Exact match: true → similarity = 1.0, completeness = 1.0
- Field confidence = (0.4 × 0.92) + (0.4 × 1.0) + (0.2 × 1.0) = 0.968

**Result**: MATCH, confidence = 0.968

### Example 2: Partial Match

**Input**:
- User value: "123 Main St"
- OCR value: "123 Main Street"
- OCR confidence: 0.85

**Calculation**:
- Levenshtein ratio: 0.82
- Fuzzy partial: 0.90
- Best similarity: 0.90
- Partial match: true → completeness = 0.5
- Field confidence = (0.4 × 0.85) + (0.4 × 0.90) + (0.2 × 0.5) = 0.80

**Result**: PARTIAL_MATCH, confidence = 0.80

### Example 3: Mismatch

**Input**:
- User value: "john@example.com"
- OCR value: "jane@example.com"
- OCR confidence: 0.88

**Calculation**:
- Levenshtein ratio: 0.80
- Best similarity: 0.80
- No partial match → completeness = 0.0
- Field confidence = (0.4 × 0.88) + (0.4 × 0.80) + (0.2 × 0.0) = 0.672

**Result**: MISMATCH (similarity < 0.85), confidence = 0.672

## Confidence Reporting

Confidence scores are reported at multiple levels:

1. **Box Level**: Individual text box confidence
2. **Page Level**: Average confidence per page
3. **Field Level**: Verification confidence per form field
4. **Document Level**: Overall document confidence
5. **Summary Level**: Aggregate verification confidence

This multi-level reporting enables:
- Fine-grained quality assessment
- Targeted error identification
- Confidence-based decision making
- Quality metrics for system evaluation


