"""
EasyOCR engine wrapper
"""
import cv2
import numpy as np
from typing import Dict, Optional, List
import logging

logger = logging.getLogger(__name__)


class EasyOCREngine:
    """EasyOCR engine implementation"""
    
    def __init__(self, config: dict):
        self.config = config
        self.enabled = config.get('enabled', True)
        self.languages = config.get('languages', ['en'])
        self.use_gpu = config.get('gpu', False)
        self.reader = None
        self._initialize()
    
    def _initialize(self):
        """Initialize EasyOCR"""
        if not self.enabled:
            return
        
        try:
            import easyocr
            self.reader = easyocr.Reader(self.languages, gpu=self.use_gpu)
            logger.info("EasyOCR initialized successfully")
        except ImportError as e:
            logger.warning(f"EasyOCR not installed: {e}. Engine will be disabled.")
            self.enabled = False
            self.reader = None
        except Exception as e:
            logger.error(f"Failed to initialize EasyOCR: {e}")
            self.enabled = False
            self.reader = None
    
    def extract_text(self, image: np.ndarray, language: Optional[str] = None) -> Dict:
        """
        Extract text using EasyOCR
        
        Returns:
            Dictionary with text, confidence, and bounding boxes
        """
        if not self.enabled or self.reader is None:
            return {'text': '', 'confidence': 0.0, 'boxes': []}
        
        try:
            # EasyOCR works with RGB images
            if len(image.shape) == 2:
                image = cv2.cvtColor(image, cv2.COLOR_GRAY2RGB)
            elif len(image.shape) == 3 and image.shape[2] == 3:
                # Assume BGR, convert to RGB
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            
            # Run OCR
            results = self.reader.readtext(image)
            
            if not results:
                return {'text': '', 'confidence': 0.0, 'boxes': [], 'engine': 'easyocr'}
            
            text_parts = []
            boxes = []
            confidences = []
            
            for (bbox, text, conf) in results:
                text_parts.append(text)
                confidences.append(conf)
                
                # Convert bbox to [x1, y1, x2, y2] format
                x_coords = [point[0] for point in bbox]
                y_coords = [point[1] for point in bbox]
                x1, x2 = int(min(x_coords)), int(max(x_coords))
                y1, y2 = int(min(y_coords)), int(max(y_coords))
                
                boxes.append({
                    'text': text,
                    'bbox': [x1, y1, x2, y2],
                    'confidence': conf,
                    'page_num': 1
                })
            
            full_text = ' '.join(text_parts)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            return {
                'text': full_text,
                'confidence': avg_confidence,
                'boxes': boxes,
                'engine': 'easyocr'
            }
        except Exception as e:
            logger.error(f"EasyOCR error: {e}")
            return {'text': '', 'confidence': 0.0, 'boxes': [], 'engine': 'easyocr', 'error': str(e)}


