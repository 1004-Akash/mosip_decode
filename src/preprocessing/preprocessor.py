"""
Advanced image preprocessing for OCR optimization
"""
import cv2
import numpy as np
from typing import Optional
import logging
from scipy import ndimage
from skimage import filters, restoration

logger = logging.getLogger(__name__)


class ImagePreprocessor:
    """Handles image preprocessing operations for OCR"""
    
    def __init__(self, config: dict):
        self.config = config
        self.deskew_enabled = config.get('deskew', True)
        self.denoise_enabled = config.get('denoise', True)
        self.contrast_enabled = config.get('contrast_enhancement', True)
        self.binarization_enabled = config.get('binarization', True)
    
    def preprocess(self, image: np.ndarray) -> np.ndarray:
        """Apply all preprocessing steps"""
        processed = image.copy()
        
        # Convert to grayscale if needed
        if len(processed.shape) == 3:
            processed = cv2.cvtColor(processed, cv2.COLOR_BGR2GRAY)
        
        # Resize if needed
        max_dim = self.config.get('resize_max_dim', 3000)
        h, w = processed.shape[:2]
        if max(h, w) > max_dim:
            if h > w:
                scale = max_dim / h
            else:
                scale = max_dim / w
            new_w = int(w * scale)
            new_h = int(h * scale)
            processed = cv2.resize(processed, (new_w, new_h), interpolation=cv2.INTER_AREA)
        
        # Deskewing
        if self.deskew_enabled:
            processed = self.deskew(processed)
        
        # Denoising
        if self.denoise_enabled:
            processed = self.denoise(processed)
        
        # Contrast enhancement
        if self.contrast_enabled:
            processed = self.enhance_contrast(processed)
        
        # Binarization
        if self.binarization_enabled:
            processed = self.binarize(processed)
        
        return processed
    
    def deskew(self, image: np.ndarray) -> np.ndarray:
        """Correct image skew using projection profile analysis"""
        try:
            # Convert to binary
            binary = cv2.threshold(image, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)[1]
            
            # Find angle using Hough transform
            coords = np.column_stack(np.where(binary > 0))
            if len(coords) == 0:
                return image
            
            # Use minimum area rectangle to find angle
            angle = cv2.minAreaRect(coords)[-1]
            
            # Correct angle
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
            
            # Only correct if angle is significant
            if abs(angle) > 0.5:
                (h, w) = image.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                rotated = cv2.warpAffine(image, M, (w, h), 
                                        flags=cv2.INTER_CUBIC, 
                                        borderMode=cv2.BORDER_REPLICATE)
                return rotated
            
            return image
        except Exception as e:
            logger.warning(f"Deskewing failed: {e}")
            return image
    
    def denoise(self, image: np.ndarray) -> np.ndarray:
        """Remove noise using non-local means denoising"""
        try:
            # Apply bilateral filter for edge-preserving denoising
            denoised = cv2.bilateralFilter(image, 9, 75, 75)
            
            # Additional non-local means denoising for heavy noise
            if self.config.get('aggressive_denoise', False):
                denoised = cv2.fastNlMeansDenoising(denoised, None, 10, 7, 21)
            
            return denoised
        except Exception as e:
            logger.warning(f"Denoising failed: {e}")
            return image
    
    def enhance_contrast(self, image: np.ndarray) -> np.ndarray:
        """Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)"""
        try:
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced = clahe.apply(image)
            return enhanced
        except Exception as e:
            logger.warning(f"Contrast enhancement failed: {e}")
            return image
    
    def binarize(self, image: np.ndarray) -> np.ndarray:
        """Binarize image using adaptive thresholding"""
        try:
            # Use adaptive thresholding for better results on varying lighting
            binary = cv2.adaptiveThreshold(
                image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
            return binary
        except Exception as e:
            logger.warning(f"Binarization failed: {e}")
            return image


