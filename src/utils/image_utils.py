"""
Image utility functions for document processing
"""
import cv2
import numpy as np
from PIL import Image
from typing import Tuple, Optional
import logging

logger = logging.getLogger(__name__)


def load_image(image_path: str) -> np.ndarray:
    """Load image from file path"""
    try:
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not load image from {image_path}")
        return img
    except Exception as e:
        logger.error(f"Error loading image: {e}")
        raise


def pdf_to_images(pdf_path: str) -> list:
    """Convert PDF to list of images"""
    try:
        from pdf2image import convert_from_path
        images = convert_from_path(pdf_path, dpi=300)
        return [np.array(img) for img in images]
    except Exception as e:
        logger.error(f"Error converting PDF: {e}")
        raise


def resize_image(image: np.ndarray, max_dim: int = 3000) -> np.ndarray:
    """Resize image maintaining aspect ratio"""
    h, w = image.shape[:2]
    if max(h, w) <= max_dim:
        return image
    
    if h > w:
        scale = max_dim / h
    else:
        scale = max_dim / w
    
    new_w = int(w * scale)
    new_h = int(h * scale)
    
    return cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)


def convert_to_rgb(image: np.ndarray) -> np.ndarray:
    """Convert BGR to RGB if needed"""
    if len(image.shape) == 3 and image.shape[2] == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return image


def convert_to_grayscale(image: np.ndarray) -> np.ndarray:
    """Convert image to grayscale"""
    if len(image.shape) == 3:
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    return image


