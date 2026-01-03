"""
PaddleOCR engine wrapper
"""
import cv2
import numpy as np
from typing import Dict, Optional
import logging

logger = logging.getLogger(__name__)


class PaddleOCREngine:
    """PaddleOCR engine implementation"""
    
    def __init__(self, config: dict):
        self.config = config
        self.enabled = config.get('enabled', True)
        self.use_angle_cls = config.get('use_angle_cls', True)
        self.lang = config.get('lang', 'en')
        self.use_gpu = config.get('use_gpu', False)
        self.ocr = None
        self._initialize()
    
    def _initialize(self):
        """Initialize PaddleOCR"""
        if not self.enabled:
            return
        
        try:
            from paddleocr import PaddleOCR
            self.ocr = PaddleOCR(
                use_angle_cls=self.use_angle_cls,
                lang=self.lang,
                use_gpu=self.use_gpu,
                show_log=False
            )
            logger.info("PaddleOCR initialized successfully")
        except ImportError as e:
            logger.warning(f"PaddleOCR not installed: {e}. Engine will be disabled.")
            self.enabled = False
            self.ocr = None
        except Exception as e:
            logger.error(f"Failed to initialize PaddleOCR: {e}")
            self.enabled = False
            self.ocr = None
    
    def extract_text(self, image: np.ndarray, language: Optional[str] = None) -> Dict:
        """
        Extract text using PaddleOCR
        
        Args:
            image: Input image
            language: Language code (e.g., 'en', 'hi'). If provided, will use that language.
                     Otherwise uses self.lang from config.
        
        Returns:
            Dictionary with text, confidence, and bounding boxes
        """
        if not self.enabled or self.ocr is None:
            return {'text': '', 'confidence': 0.0, 'boxes': []}
        
        try:
            # Use provided language or default
            ocr_lang = language or self.lang
            
            # If language changed, reinitialize PaddleOCR with new language
            if ocr_lang != self.lang and ocr_lang in ['en', 'ch', 'ko', 'ja', 'hi', 'te', 'ta', 'kn', 'ml', 'or', 'gu', 'pa', 'bn']:
                try:
                    from paddleocr import PaddleOCR
                    self.ocr = PaddleOCR(
                        use_angle_cls=self.use_angle_cls,
                        lang=ocr_lang,
                        use_gpu=self.use_gpu,
                        show_log=False
                    )
                    logger.info(f"PaddleOCR reinitialized with language: {ocr_lang}")
                except Exception as e:
                    logger.warning(f"Failed to reinitialize PaddleOCR with {ocr_lang}: {e}")
                    # Continue with existing OCR instance
            
            # PaddleOCR expects BGR format
            if len(image.shape) == 2:
                image = cv2.cvtColor(image, cv2.COLOR_GRAY2BGR)
            
            # Run OCR
            result = self.ocr.ocr(image, cls=self.use_angle_cls)
            
            if not result or not result[0]:
                return {'text': '', 'confidence': 0.0, 'boxes': [], 'engine': 'paddleocr'}
            
            text_parts = []
            boxes = []
            confidences = []
            
            for line in result[0]:
                if line:
                    bbox, (text, conf) = line
                    text_parts.append(text)
                    confidences.append(conf)
                    
                    # Convert bbox to [x1, y1, x2, y2] format
                    x_coords = [point[0] for point in bbox]
                    y_coords = [point[1] for point in bbox]
                    x1, x2 = min(x_coords), max(x_coords)
                    y1, y2 = min(y_coords), max(y_coords)
                    
                    boxes.append({
                        'text': text,
                        'bbox': [int(x1), int(y1), int(x2), int(y2)],
                        'confidence': conf,
                        'page_num': 1
                    })
            
            full_text = ' '.join(text_parts)
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0
            
            return {
                'text': full_text,
                'confidence': avg_confidence,
                'boxes': boxes,
                'engine': 'paddleocr'
            }
        except Exception as e:
            logger.error(f"PaddleOCR error: {e}")
            return {'text': '', 'confidence': 0.0, 'boxes': [], 'engine': 'paddleocr', 'error': str(e)}


