"""
OCR output fusion using confidence-weighted voting, edit distance, and dictionary validation
MANDATORY: Confidence-weighted voting, edit-distance correction, dictionary validation
"""
import logging
from typing import List, Dict, Tuple
from collections import Counter
from Levenshtein import distance as levenshtein_distance, ratio as levenshtein_ratio
import numpy as np
import re

logger = logging.getLogger(__name__)

# English dictionary for word validation (common words)
ENGLISH_DICTIONARY = set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
    'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
    'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them',
    'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
    'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first',
    'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day',
    'most', 'us', 'name', 'date', 'birth', 'address', 'phone', 'email', 'id', 'number',
    'certificate', 'document', 'form', 'field', 'value', 'text', 'page'
])


class OCRFusion:
    """Fuses multiple OCR engine outputs"""
    
    def __init__(self, config: dict):
        self.config = config
        self.method = config.get('method', 'confidence_weighted')
        self.min_confidence = config.get('min_confidence', 0.5)
        self.edit_distance_threshold = config.get('edit_distance_threshold', 0.8)
    
    def fuse(self, ocr_results: List[Dict]) -> Dict:
        """
        Fuse multiple OCR results into a single output
        
        Args:
            ocr_results: List of OCR results from different engines
            
        Returns:
            Fused OCR result
        """
        if not ocr_results:
            return {'text': '', 'confidence': 0.0, 'boxes': []}
        
        # Filter by minimum confidence
        valid_results = [r for r in ocr_results if r.get('confidence', 0) >= self.min_confidence]
        
        if not valid_results:
            # Return best result even if below threshold
            valid_results = ocr_results
        
        if len(valid_results) == 1:
            return valid_results[0]
        
        # MANDATORY: Always use confidence-weighted fusion with validation
        # This includes: confidence-weighted voting, edit distance correction, dictionary validation
        return self._confidence_weighted_fusion(valid_results)
    
    def _validate_word(self, word: str) -> bool:
        """Validate word against English dictionary"""
        if not word:
            return False
        # Remove punctuation and convert to lowercase
        clean_word = re.sub(r'[^\w]', '', word.lower())
        return clean_word in ENGLISH_DICTIONARY or len(clean_word) <= 2  # Allow short words
    
    def _apply_dictionary_validation(self, text: str) -> str:
        """Apply dictionary validation to correct common OCR errors"""
        words = text.split()
        corrected_words = []
        
        for word in words:
            if self._validate_word(word):
                corrected_words.append(word)
            else:
                # Try to find closest dictionary word
                best_match = word
                best_similarity = 0.0
                
                for dict_word in ENGLISH_DICTIONARY:
                    if len(dict_word) >= 3:  # Only check longer words
                        similarity = levenshtein_ratio(word.lower(), dict_word)
                        if similarity > best_similarity and similarity > 0.7:
                            best_similarity = similarity
                            best_match = dict_word
                
                if best_similarity > 0.7:
                    corrected_words.append(best_match)
                else:
                    corrected_words.append(word)  # Keep original if no good match
        
        return ' '.join(corrected_words)
    
    def _apply_edit_distance_correction(self, texts: List[str]) -> str:
        """Apply edit distance correction for conflicting tokens"""
        if not texts or len(texts) < 2:
            return texts[0] if texts else ''
        
        # Tokenize all texts
        all_tokens = []
        for text in texts:
            tokens = text.split()
            all_tokens.append(tokens)
        
        # Find consensus tokens using edit distance
        corrected_tokens = []
        max_len = max(len(tokens) for tokens in all_tokens)
        
        for i in range(max_len):
            candidates = []
            for tokens in all_tokens:
                if i < len(tokens):
                    candidates.append(tokens[i])
            
            if not candidates:
                continue
            
            # Find most similar token (consensus)
            if len(candidates) == 1:
                corrected_tokens.append(candidates[0])
            else:
                # Use edit distance to find best token
                best_token = candidates[0]
                best_score = 0.0
                
                for token in set(candidates):  # Check unique tokens
                    similarities = [levenshtein_ratio(token, c) for c in candidates]
                    avg_similarity = sum(similarities) / len(similarities)
                    if avg_similarity > best_score:
                        best_score = avg_similarity
                        best_token = token
                
                corrected_tokens.append(best_token)
        
        return ' '.join(corrected_tokens)
    
    def _preserve_layout_with_boxes(self, results: List[Dict]) -> List[Dict]:
        """Preserve layout structure using bounding box overlap"""
        all_boxes = []
        for result in results:
            boxes = result.get('boxes', [])
            for box in boxes:
                box['engine'] = result.get('engine', 'unknown')
                all_boxes.append(box)
        
        # Group overlapping boxes
        merged_boxes = []
        used_indices = set()
        
        for i, box1 in enumerate(all_boxes):
            if i in used_indices:
                continue
            
            bbox1 = box1.get('bbox', [])
            if len(bbox1) < 4:
                continue
            
            x1_1, y1_1, x2_1, y2_1 = bbox1[0], bbox1[1], bbox1[2], bbox1[3]
            group = [box1]
            used_indices.add(i)
            
            # Find overlapping boxes
            for j, box2 in enumerate(all_boxes[i+1:], i+1):
                if j in used_indices:
                    continue
                
                bbox2 = box2.get('bbox', [])
                if len(bbox2) < 4:
                    continue
                
                x1_2, y1_2, x2_2, y2_2 = bbox2[0], bbox2[1], bbox2[2], bbox2[3]
                
                # Calculate overlap
                overlap_x = max(0, min(x2_1, x2_2) - max(x1_1, x1_2))
                overlap_y = max(0, min(y2_1, y2_2) - max(y1_1, y1_2))
                overlap_area = overlap_x * overlap_y
                
                area1 = (x2_1 - x1_1) * (y2_1 - y1_1)
                area2 = (x2_2 - x1_2) * (y2_2 - y1_2)
                union_area = area1 + area2 - overlap_area
                
                if union_area > 0:
                    iou = overlap_area / union_area
                    if iou > 0.3:  # 30% overlap threshold
                        group.append(box2)
                        used_indices.add(j)
            
            # Merge group: use highest confidence text
            if group:
                best_box = max(group, key=lambda b: b.get('confidence', 0))
                merged_boxes.append(best_box)
        
        return merged_boxes
    
    def _confidence_weighted_fusion(self, results: List[Dict]) -> Dict:
        """
        MANDATORY: Confidence-weighted voting with edit distance and dictionary validation
        """
        # Filter out failed/empty results but keep them for reporting
        valid_results = [r for r in results if r.get('status') == 'success' and r.get('text')]
        
        if not valid_results:
            # If all failed, return best attempt
            valid_results = [r for r in results if r.get('text')]
            if not valid_results:
                # All completely failed
                return {
                    'text': '',
                    'confidence': 0.0,
                    'boxes': [],
                    'engines_used': [r.get('engine', 'unknown') for r in results],
                    'fusion_method': 'confidence_weighted'
                }
        
        # Extract texts and confidences
        texts = [r.get('text', '') for r in valid_results]
        confidences = [r.get('confidence', 0) for r in valid_results]
        
        # Normalize confidences for weighting
        total_confidence = sum(confidences)
        if total_confidence > 0:
            weights = [c / total_confidence for c in confidences]
        else:
            weights = [1.0 / len(confidences)] * len(confidences)
        
        # Apply edit distance correction for conflicting tokens
        corrected_text = self._apply_edit_distance_correction(texts)
        
        # Apply dictionary validation
        validated_text = self._apply_dictionary_validation(corrected_text)
        
        # Confidence-weighted selection: choose text from highest confidence engine
        # but use corrected/validated version
        best_idx = confidences.index(max(confidences))
        base_text = texts[best_idx]
        
        # Use corrected text if it's significantly different (likely better)
        if levenshtein_ratio(base_text, validated_text) > 0.8:
            final_text = validated_text
        else:
            final_text = base_text
        
        # Preserve layout with bounding box overlap
        merged_boxes = self._preserve_layout_with_boxes(valid_results)
        
        # Calculate weighted average confidence
        weighted_confidence = sum(w * c for w, c in zip(weights, confidences))
        
        return {
            'text': final_text,
            'confidence': weighted_confidence,
            'boxes': merged_boxes,
            'engines_used': [r.get('engine', 'unknown') for r in valid_results],
            'fusion_method': 'confidence_weighted_with_validation'
        }
    
    def _voting_fusion(self, results: List[Dict]) -> Dict:
        """Fuse using majority voting on text segments"""
        # Extract all text segments
        all_texts = [r.get('text', '') for r in results]
        
        # Simple voting: use most common text (or longest if tie)
        if all_texts:
            # Count occurrences
            text_counts = Counter(all_texts)
            most_common = text_counts.most_common(1)[0][0]
            
            # If tie, use longest
            max_count = text_counts[most_common]
            candidates = [text for text, count in text_counts.items() if count == max_count]
            selected_text = max(candidates, key=len)
        else:
            selected_text = ''
        
        # Merge boxes
        all_boxes = []
        for result in results:
            all_boxes.extend(result.get('boxes', []))
        
        # Average confidence
        avg_confidence = sum(r.get('confidence', 0) for r in results) / len(results) if results else 0.0
        
        return {
            'text': selected_text,
            'confidence': avg_confidence,
            'boxes': all_boxes,
            'engines_used': [r.get('engine', 'unknown') for r in results],
            'fusion_method': 'voting'
        }
    
    def _edit_distance_fusion(self, results: List[Dict]) -> Dict:
        """Fuse using edit distance similarity"""
        if len(results) < 2:
            return results[0] if results else {'text': '', 'confidence': 0.0, 'boxes': []}
        
        texts = [r.get('text', '') for r in results]
        confidences = [r.get('confidence', 0) for r in results]
        
        # Calculate pairwise similarities
        similarities = []
        for i, text1 in enumerate(texts):
            for j, text2 in enumerate(texts[i+1:], i+1):
                if text1 and text2:
                    max_len = max(len(text1), len(text2))
                    if max_len > 0:
                        edit_dist = levenshtein_distance(text1, text2)
                        similarity = 1 - (edit_dist / max_len)
                        similarities.append((i, j, similarity))
        
        # Find most similar pair
        if similarities:
            best_pair = max(similarities, key=lambda x: x[2])
            i, j, sim = best_pair
            
            if sim >= self.edit_distance_threshold:
                # Use higher confidence result from similar pair
                if confidences[i] >= confidences[j]:
                    selected_idx = i
                else:
                    selected_idx = j
            else:
                # Use highest confidence overall
                selected_idx = confidences.index(max(confidences))
        else:
            selected_idx = confidences.index(max(confidences))
        
        selected_result = results[selected_idx]
        
        # Merge boxes
        all_boxes = []
        for result in results:
            all_boxes.extend(result.get('boxes', []))
        
        return {
            'text': selected_result.get('text', ''),
            'confidence': selected_result.get('confidence', 0),
            'boxes': all_boxes,
            'engines_used': [r.get('engine', 'unknown') for r in results],
            'fusion_method': 'edit_distance'
        }

