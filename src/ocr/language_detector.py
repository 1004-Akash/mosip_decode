"""
Language detection for dynamic OCR routing
"""
import logging
from typing import Dict, Optional, Tuple
from langdetect import detect, detect_langs, LangDetectException

logger = logging.getLogger(__name__)


class LanguageDetector:
    """Detects language from text samples"""
    
    def __init__(self, config: dict):
        self.config = config
        self.enabled = config.get('enabled', True)
        self.fallback_language = config.get('fallback_language', 'en')
        self.min_confidence = config.get('min_confidence', 0.3)
        
        # Language to OCR engine mapping
        self.language_mapping = {
            'en': 'english',
            'hi': 'hindi',
            'ar': 'arabic',
            'zh': 'chinese',
            'ja': 'japanese',
            'ko': 'korean',
            'fr': 'french',
            'de': 'german',
            'es': 'spanish',
            'ru': 'russian',
            'th': 'thai',
            'vi': 'vietnamese',
        }
    
    def detect_language(self, text: str) -> Tuple[str, float]:
        """
        Detect language from text
        
        Returns:
            Tuple of (language_code, confidence)
        """
        if not self.enabled or not text or len(text.strip()) < 3:
            return self.fallback_language, 0.5
        
        try:
            # Get primary language
            primary_lang = detect(text)
            confidence = 1.0
            
            # Get confidence scores
            try:
                lang_scores = detect_langs(text)
                if lang_scores:
                    confidence = lang_scores[0].prob
                    primary_lang = lang_scores[0].lang
            except:
                pass
            
            if confidence < self.min_confidence:
                logger.warning(f"Low confidence language detection: {primary_lang} ({confidence})")
                return self.fallback_language, confidence
            
            return primary_lang, confidence
        except LangDetectException as e:
            logger.warning(f"Language detection failed: {e}")
            return self.fallback_language, 0.3
        except Exception as e:
            logger.error(f"Unexpected error in language detection: {e}")
            return self.fallback_language, 0.3
    
    def get_ocr_language(self, detected_lang: str) -> str:
        """Map detected language to OCR engine language code"""
        return self.language_mapping.get(detected_lang, self.fallback_language)


