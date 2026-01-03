"""
Data verification module for comparing user-submitted data with OCR results
"""
import logging
from typing import Dict, List, Optional
from Levenshtein import distance as levenshtein_distance, ratio as levenshtein_ratio
from fuzzywuzzy import fuzz
import re

logger = logging.getLogger(__name__)


class DataVerifier:
    """Verifies user-submitted form data against OCR-extracted text"""
    
    def __init__(self, config: dict):
        self.config = config
        verification_config = config.get('verification', {})
        field_config = verification_config.get('field_matching', {})
        confidence_config = verification_config.get('confidence_scoring', {})
        
        self.similarity_threshold = field_config.get('similarity_threshold', 0.85)
        self.use_fuzzy_matching = field_config.get('use_fuzzy_matching', True)
        self.case_sensitive = field_config.get('case_sensitive', False)
        self.ignore_whitespace = field_config.get('ignore_whitespace', True)
        
        self.ocr_confidence_weight = confidence_config.get('ocr_confidence_weight', 0.4)
        self.similarity_weight = confidence_config.get('similarity_weight', 0.4)
        self.field_completeness_weight = confidence_config.get('field_completeness_weight', 0.2)
    
    def verify_field(self, user_value: str, ocr_text: str, ocr_confidence: float = 1.0) -> Dict:
        """
        Verify a single field value against OCR text
        
        Args:
            user_value: User-submitted value
            ocr_text: OCR-extracted text
            ocr_confidence: Confidence score from OCR
            
        Returns:
            Verification result with match status and confidence
        """
        # Normalize inputs
        user_norm = self._normalize_text(user_value)
        ocr_norm = self._normalize_text(ocr_text)
        
        # Check for exact match
        exact_match = user_norm == ocr_norm
        
        # Calculate similarity scores
        similarity_scores = {}
        
        # Levenshtein ratio
        if user_norm and ocr_norm:
            similarity_scores['levenshtein'] = levenshtein_ratio(user_norm, ocr_norm)
        else:
            similarity_scores['levenshtein'] = 0.0
        
        # Fuzzy matching
        if self.use_fuzzy_matching and user_norm and ocr_norm:
            similarity_scores['fuzzy_ratio'] = fuzz.ratio(user_norm, ocr_norm) / 100.0
            similarity_scores['fuzzy_partial'] = fuzz.partial_ratio(user_norm, ocr_norm) / 100.0
            similarity_scores['fuzzy_token'] = fuzz.token_sort_ratio(user_norm, ocr_norm) / 100.0
        else:
            similarity_scores['fuzzy_ratio'] = similarity_scores['levenshtein']
            similarity_scores['fuzzy_partial'] = similarity_scores['levenshtein']
            similarity_scores['fuzzy_token'] = similarity_scores['levenshtein']
        
        # Use best similarity score
        best_similarity = max(similarity_scores.values())
        
        # Check for partial match (user value contained in OCR text or vice versa)
        partial_match = False
        if user_norm and ocr_norm:
            if user_norm in ocr_norm or ocr_norm in user_norm:
                partial_match = True
                # Boost similarity for partial matches
                best_similarity = max(best_similarity, 0.7)
        
        # Determine match status
        if exact_match:
            match_status = "MATCH"
        elif best_similarity >= self.similarity_threshold:
            match_status = "MATCH"
        elif partial_match and best_similarity >= 0.6:
            match_status = "PARTIAL_MATCH"
        else:
            match_status = "MISMATCH"
        
        # Calculate overall confidence
        overall_confidence = self._calculate_confidence(
            ocr_confidence, best_similarity, exact_match, partial_match
        )
        
        return {
            'field_value': user_value,
            'ocr_value': ocr_text,
            'match_status': match_status,
            'similarity': best_similarity,
            'similarity_scores': similarity_scores,
            'exact_match': exact_match,
            'partial_match': partial_match,
            'confidence': overall_confidence,
            'ocr_confidence': ocr_confidence
        }
    
    def verify_form(self, form_data: Dict[str, str], ocr_result: Dict) -> Dict:
        """
        Verify entire form data against OCR results
        
        Args:
            form_data: Dictionary of field_name -> user_value
            ocr_result: OCR extraction result (new format with per-engine outputs)
            
        Returns:
            Complete verification report
        """
        # Handle new format with per-engine outputs
        if 'fused_result' in ocr_result:
            # New format: use fused result
            fused = ocr_result.get('fused_result', {})
            ocr_text = fused.get('text', '')
            ocr_boxes = fused.get('boxes', [])
            ocr_confidence = fused.get('confidence', 0.0)
        elif 'pages' in ocr_result and len(ocr_result.get('pages', [])) > 0:
            # Multi-page PDF: use first page's fused result
            first_page = ocr_result['pages'][0]
            fused = first_page.get('fused_result', {})
            ocr_text = fused.get('text', '')
            ocr_boxes = fused.get('boxes', [])
            ocr_confidence = fused.get('confidence', 0.0)
        else:
            # Legacy format
            ocr_text = ocr_result.get('text', '')
            ocr_boxes = ocr_result.get('boxes', [])
            ocr_confidence = ocr_result.get('confidence', 0.0)
        
        # Extract field-level OCR values (if boxes are available)
        field_ocr_map = self._extract_field_values(form_data, ocr_text, ocr_boxes)
        
        verification_results = {}
        overall_matches = 0
        overall_mismatches = 0
        overall_partials = 0
        
        for field_name, user_value in form_data.items():
            # Get OCR value for this field
            ocr_value = field_ocr_map.get(field_name, ocr_text)
            field_ocr_conf = ocr_result.get('confidence', ocr_confidence)
            
            # Verify field
            field_result = self.verify_field(user_value, ocr_value, field_ocr_conf)
            
            verification_results[field_name] = field_result
            
            # Count matches
            if field_result['match_status'] == "MATCH":
                overall_matches += 1
            elif field_result['match_status'] == "PARTIAL_MATCH":
                overall_partials += 1
            else:
                overall_mismatches += 1
        
        # Calculate overall verification score
        total_fields = len(form_data)
        match_rate = overall_matches / total_fields if total_fields > 0 else 0.0
        
        # Overall confidence
        field_confidences = [r['confidence'] for r in verification_results.values()]
        overall_confidence = sum(field_confidences) / len(field_confidences) if field_confidences else 0.0
        
        return {
            'verification_results': verification_results,
            'summary': {
                'total_fields': total_fields,
                'matches': overall_matches,
                'partial_matches': overall_partials,
                'mismatches': overall_mismatches,
                'match_rate': match_rate,
                'overall_confidence': overall_confidence
            },
            'ocr_metadata': {
                'ocr_confidence': ocr_confidence,
                'text_length': len(ocr_text),
                'boxes_count': len(ocr_boxes)
            }
        }
    
    def _normalize_text(self, text: str) -> str:
        """Normalize text for comparison"""
        if not text:
            return ""
        
        normalized = str(text)
        
        if not self.case_sensitive:
            normalized = normalized.lower()
        
        if self.ignore_whitespace:
            normalized = re.sub(r'\s+', ' ', normalized).strip()
        
        return normalized
    
    def _extract_field_values(self, form_data: Dict, ocr_text: str, ocr_boxes: List[Dict]) -> Dict[str, str]:
        """
        Extract field-specific values from OCR results
        
        This is a simplified implementation. In production, you would use
        field mapping, layout analysis, or ML-based field extraction.
        """
        field_ocr_map = {}
        
        # For each field, try to find matching text in OCR boxes
        for field_name, user_value in form_data.items():
            # Normalize user value for searching
            user_norm = self._normalize_text(user_value)
            
            # Search in OCR boxes
            best_match = None
            best_similarity = 0.0
            
            for box in ocr_boxes:
                box_text = box.get('text', '')
                box_norm = self._normalize_text(box_text)
                
                if user_norm and box_norm:
                    similarity = levenshtein_ratio(user_norm, box_norm)
                    if similarity > best_similarity and similarity > 0.5:
                        best_similarity = similarity
                        best_match = box_text
            
            # Use best match or fallback to full OCR text
            if best_match:
                field_ocr_map[field_name] = best_match
            else:
                # Try to extract from full text using field name as context
                field_ocr_map[field_name] = self._extract_by_context(field_name, ocr_text)
        
        return field_ocr_map
    
    def _extract_by_context(self, field_name: str, ocr_text: str) -> str:
        """Extract field value using field name as context"""
        # Simple keyword-based extraction
        # In production, use more sophisticated NLP/ML methods
        
        # Look for field name in text and extract nearby text
        field_lower = field_name.lower()
        text_lower = ocr_text.lower()
        
        idx = text_lower.find(field_lower)
        if idx != -1:
            # Extract text after field name
            start = idx + len(field_name)
            end = min(start + 100, len(ocr_text))
            extracted = ocr_text[start:end].strip()
            
            # Extract first line or until punctuation
            lines = extracted.split('\n')
            if lines:
                return lines[0].split(';')[0].split(',')[0].strip()
        
        return ocr_text[:200]  # Fallback to first 200 chars
    
    def _calculate_confidence(self, ocr_conf: float, similarity: float, 
                              exact_match: bool, partial_match: bool) -> float:
        """Calculate overall confidence score"""
        # Base confidence from similarity
        base_conf = similarity
        
        # Boost for exact matches
        if exact_match:
            base_conf = 1.0
        
        # Weighted combination
        confidence = (
            self.ocr_confidence_weight * ocr_conf +
            self.similarity_weight * base_conf +
            self.field_completeness_weight * (1.0 if exact_match else 0.5)
        )
        
        return min(1.0, max(0.0, confidence))

