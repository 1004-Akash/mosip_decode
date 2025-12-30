"""
Tesseract OCR engine wrapper
"""
import pytesseract
import cv2
import numpy as np
from typing import List, Dict, Optional
import logging
from PIL import Image

logger = logging.getLogger(__name__)


class TesseractEngine:
    """Tesseract OCR engine implementation"""
    
    def __init__(self, config: dict):
        self.config = config
        self.enabled = config.get('enabled', True)
        self.languages = config.get('languages', 'eng')
        self.psm = config.get('psm', 6)
        self.oem = config.get('oem', 3)
    
    def extract_text(self, image: np.ndarray, language: Optional[str] = None) -> Dict:
        """
        Extract text using Tesseract OCR
        
        Args:
            image: Input image
            language: Language code (e.g., 'eng', 'hin'). If provided, will use that language.
                     Otherwise uses self.languages from config.
        
        Returns:
            Dictionary with text, confidence, and bounding boxes
        """
        if not self.enabled:
            return {'text': '', 'confidence': 0.0, 'boxes': []}
        
        try:
            # Convert numpy array to PIL Image
            if isinstance(image, np.ndarray):
                pil_image = Image.fromarray(image)
            else:
                pil_image = image
            
            # Use provided language or default
            # If language is provided as code (e.g., 'hin'), use it directly
            # Otherwise use configured languages
            if language:
                # Map language codes: 'hi' -> 'hin', 'en' -> 'eng', etc.
                lang_map = {
                    'hi': 'hin',
                    'en': 'eng',
                    'ar': 'ara',
                    'zh': 'chi_sim',
                    'ja': 'jpn',
                    'ko': 'kor',
                    'fr': 'fra',
                    'de': 'deu',
                    'es': 'spa'
                }
                lang = lang_map.get(language, language)
                # If it's already a tesseract code (like 'hin'), use as is
                if lang not in ['hin', 'eng', 'ara', 'chi_sim', 'jpn', 'kor', 'fra', 'deu', 'spa']:
                    lang = self.languages  # Fallback to default
            else:
                lang = self.languages
            
            # Configure Tesseract
            custom_config = f'--oem {self.oem} --psm {self.psm} -l {lang}'
            
            # Get detailed data
            data = pytesseract.image_to_data(pil_image, config=custom_config, output_type=pytesseract.Output.DICT)
            
            # Extract text and confidence
            text_parts = []
            boxes = []
            confidences = []
            
            n_boxes = len(data['text'])
            for i in range(n_boxes):
                text = data['text'][i].strip()
                conf = int(data['conf'][i])
                
                if text and conf > 0:
                    text_parts.append(text)
                    confidences.append(conf)
                    
                    # Bounding box
                    x = data['left'][i]
                    y = data['top'][i]
                    w = data['width'][i]
                    h = data['height'][i]
                    boxes.append({
                        'text': text,
                        'bbox': [x, y, x + w, y + h],
                        'confidence': conf / 100.0,
                        'page_num': 1
                    })
            
            full_text = ' '.join(text_parts)
            avg_confidence = sum(confidences) / len(confidences) / 100.0 if confidences else 0.0
            
            return {
                'text': full_text,
                'confidence': avg_confidence,
                'boxes': boxes,
                'engine': 'tesseract'
            }
        except Exception as e:
            logger.error(f"Tesseract OCR error: {e}")
            return {'text': '', 'confidence': 0.0, 'boxes': [], 'engine': 'tesseract', 'error': str(e)}


