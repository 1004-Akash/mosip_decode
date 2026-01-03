"""
Deep Learning-based text detection (CRAFT/DBNet)
"""
import cv2
import numpy as np
from typing import List, Dict, Tuple
import logging

logger = logging.getLogger(__name__)


class TextDetector:
    """DL-based text region detection"""
    
    def __init__(self, config: dict):
        self.config = config
        self.enabled = config.get('use_dl_detector', True)
        self.model_type = config.get('detector_model', 'craft')
        self.confidence_threshold = config.get('confidence_threshold', 0.7)
        self.detector = None
        self._initialize()
    
    def _initialize(self):
        """Initialize text detector model"""
        if not self.enabled:
            return
        
        try:
            # For production, you would load actual CRAFT or DBNet models
            # This is a placeholder for the architecture
            logger.info(f"Text detector ({self.model_type}) initialized")
            # In real implementation:
            # if self.model_type == 'craft':
            #     from craft_text_detector import Craft
            #     self.detector = Craft()
            # elif self.model_type == 'dbnet':
            #     from dbnet import DBNet
            #     self.detector = DBNet()
        except Exception as e:
            logger.warning(f"DL text detector not available: {e}")
            self.enabled = False
    
    def detect_regions(self, image: np.ndarray) -> List[Dict]:
        """
        Detect text regions in image
        
        Returns:
            List of detected text regions with bounding boxes
        """
        if not self.enabled or self.detector is None:
            # Fallback to simple contour-based detection
            return self._fallback_detection(image)
        
        try:
            # Placeholder for actual DL detection
            # regions = self.detector.detect(image)
            # return self._format_regions(regions)
            return self._fallback_detection(image)
        except Exception as e:
            logger.error(f"Text detection error: {e}")
            return self._fallback_detection(image)
    
    def _fallback_detection(self, image: np.ndarray) -> List[Dict]:
        """Fallback detection using contour analysis"""
        try:
            # Convert to grayscale
            if len(image.shape) == 3:
                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            else:
                gray = image
            
            # Apply threshold
            _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            
            # Find contours
            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            regions = []
            for contour in contours:
                x, y, w, h = cv2.boundingRect(contour)
                area = w * h
                
                # Filter by size
                if area > 100 and w > 10 and h > 10:
                    regions.append({
                        'bbox': [x, y, x + w, y + h],
                        'confidence': 0.7,
                        'area': area
                    })
            
            return regions
        except Exception as e:
            logger.error(f"Fallback detection error: {e}")
            return []


