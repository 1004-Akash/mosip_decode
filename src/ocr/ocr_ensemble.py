"""
Multi-model OCR ensemble orchestrator
MANDATORY: All three engines (Tesseract, PaddleOCR, EasyOCR) must run in parallel
"""
import logging
from typing import List, Dict, Optional
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading

from src.preprocessing.preprocessor import ImagePreprocessor
from src.ocr.tesseract_engine import TesseractEngine
from src.ocr.paddle_engine import PaddleOCREngine
from src.ocr.easyocr_engine import EasyOCREngine
from src.ocr.text_detector import TextDetector
from src.ocr.language_detector import LanguageDetector
from src.ocr.fusion import OCRFusion
from src.utils.image_utils import load_image, pdf_to_images

logger = logging.getLogger(__name__)


class OCREnsemble:
    """Orchestrates multiple OCR engines with preprocessing and fusion"""
    
    def __init__(self, config: dict):
        self.config = config
        ocr_config = config.get('ocr', {})
        
        # Initialize components
        self.preprocessor = ImagePreprocessor(ocr_config.get('preprocessing', {}))
        self.tesseract = TesseractEngine(ocr_config.get('engines', {}).get('tesseract', {}))
        self.paddleocr = PaddleOCREngine(ocr_config.get('engines', {}).get('paddleocr', {}))
        self.easyocr = EasyOCREngine(ocr_config.get('engines', {}).get('easyocr', {}))
        self.text_detector = TextDetector(ocr_config.get('text_detection', {}))
        self.language_detector = LanguageDetector(config.get('language_detection', {}))
        self.fusion = OCRFusion(ocr_config.get('fusion', {}))
    
    def _run_tesseract(self, processed_image: np.ndarray) -> Dict:
        """Run Tesseract OCR - MANDATORY"""
        try:
            result = self.tesseract.extract_text(processed_image)
            result['engine'] = 'tesseract'
            result['status'] = 'success'
            if not result.get('text'):
                result['status'] = 'empty_output'
            return result
        except Exception as e:
            logger.error(f"Tesseract OCR failed: {e}")
            return {
                'engine': 'tesseract',
                'text': '',
                'confidence': 0.0,
                'boxes': [],
                'status': 'failed',
                'error': str(e)
            }
    
    def _run_paddleocr(self, processed_image: np.ndarray) -> Dict:
        """Run PaddleOCR - MANDATORY"""
        try:
            result = self.paddleocr.extract_text(processed_image)
            result['engine'] = 'paddleocr'
            result['status'] = 'success'
            if not result.get('text'):
                result['status'] = 'empty_output'
            return result
        except Exception as e:
            logger.error(f"PaddleOCR failed: {e}")
            return {
                'engine': 'paddleocr',
                'text': '',
                'confidence': 0.0,
                'boxes': [],
                'status': 'failed',
                'error': str(e)
            }
    
    def _run_easyocr(self, processed_image: np.ndarray) -> Dict:
        """Run EasyOCR - MANDATORY"""
        try:
            result = self.easyocr.extract_text(processed_image)
            result['engine'] = 'easyocr'
            result['status'] = 'success'
            if not result.get('text'):
                result['status'] = 'empty_output'
            return result
        except Exception as e:
            logger.error(f"EasyOCR failed: {e}")
            return {
                'engine': 'easyocr',
                'text': '',
                'confidence': 0.0,
                'boxes': [],
                'status': 'failed',
                'error': str(e)
            }
    
    def extract_from_image(self, image_path: str, page_num: int = 1) -> Dict:
        """
        Extract text from a single image using MANDATORY parallel multi-model ensemble
        
        Returns:
            Dictionary with per-engine outputs and fused result
        """
        try:
            # Load image
            logger.info(f"Loading image from: {image_path}")
            image = load_image(image_path)
            if image is None or image.size == 0:
                raise ValueError(f"Failed to load image or image is empty: {image_path}")
            logger.info(f"Image loaded: shape={image.shape if hasattr(image, 'shape') else 'unknown'}")
            
            # Preprocess
            logger.info("Preprocessing image...")
            processed_image = self.preprocessor.preprocess(image)
            logger.info(f"Preprocessed image: shape={processed_image.shape if hasattr(processed_image, 'shape') else 'unknown'}")
            
            # Detect text regions (optional, for focused OCR)
            text_regions = self.text_detector.detect_regions(processed_image)
            
            # MANDATORY: Run ALL three engines in PARALLEL
            # Each engine MUST execute independently on the same input
            logger.info(f"Running MANDATORY parallel OCR ensemble for page {page_num}")
            
            ocr_outputs = {}
            ocr_results = []
            
            # Execute all engines in parallel using ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=3) as executor:
                # Submit all three engines
                future_tesseract = executor.submit(self._run_tesseract, processed_image)
                future_paddleocr = executor.submit(self._run_paddleocr, processed_image)
                future_easyocr = executor.submit(self._run_easyocr, processed_image)
                
                # Collect results as they complete
                futures = {
                    'tesseract': future_tesseract,
                    'paddleocr': future_paddleocr,
                    'easyocr': future_easyocr
                }
                
                for engine_name, future in futures.items():
                    try:
                        result = future.result(timeout=300)  # 5 minute timeout per engine
                        # Ensure confidence is a valid number
                        conf = result.get('confidence', 0.0)
                        if conf is None or (isinstance(conf, float) and (conf != conf or conf < 0 or conf > 1)):
                            conf = 0.0
                        
                        ocr_outputs[engine_name] = {
                            'text': result.get('text', '') or '',
                            'confidence': float(conf),
                            'boxes': result.get('boxes', []) or [],
                            'status': result.get('status', 'unknown')
                        }
                        if result.get('error'):
                            ocr_outputs[engine_name]['error'] = result['error']
                        
                        # Add to results list for fusion (even if failed/empty)
                        ocr_results.append(result)
                        logger.info(f"{engine_name} completed: status={result.get('status')}, "
                                  f"confidence={result.get('confidence', 0):.2f}, "
                                  f"text_length={len(result.get('text', ''))}")
                    except Exception as e:
                        logger.error(f"{engine_name} execution failed: {e}")
                        # MANDATORY: Report failure, don't skip
                        ocr_outputs[engine_name] = {
                            'text': '',
                            'confidence': 0.0,
                            'boxes': [],
                            'status': 'failed',
                            'error': str(e)
                        }
                        ocr_results.append({
                            'engine': engine_name,
                            'text': '',
                            'confidence': 0.0,
                            'boxes': [],
                            'status': 'failed',
                            'error': str(e)
                        })
            
            # Verify all three engines executed
            if len(ocr_outputs) != 3:
                logger.warning(f"Expected 3 engines, got {len(ocr_outputs)}")
            
            # MANDATORY: Fuse results using confidence-weighted voting, edit distance, dictionary validation
            logger.info("Fusing OCR results...")
            fused_result = self.fusion.fuse(ocr_results)
            
            # Detect language from successful results (after fusion for better detection)
            sample_texts = [r.get('text', '')[:500] for r in ocr_results if r.get('text')]
            if sample_texts:
                detected_lang, lang_conf = self.language_detector.detect_language(
                    ' '.join(sample_texts[:500])
                )
                logger.info(f"Detected language: {detected_lang} (confidence: {lang_conf:.2f})")
            else:
                detected_lang = 'en'
                lang_conf = 0.5
                logger.info("No text extracted, defaulting to English")
            
            # If Hindi detected and we have limited results, try Hindi-specific OCR
            if detected_lang == 'hi' and lang_conf > 0.5 and len(fused_result.get('text', '')) < 50:
                logger.info("Hindi detected with limited results, attempting Hindi-specific OCR")
                hindi_results = []
                
                # Tesseract with Hindi
                try:
                    hindi_tess = self.tesseract.extract_text(processed_image, language='hin')
                    if hindi_tess.get('text'):
                        hindi_tess['engine'] = 'tesseract'
                        hindi_tess['status'] = 'success'
                        hindi_results.append(hindi_tess)
                        logger.info(f"Hindi Tesseract extracted {len(hindi_tess.get('text', ''))} characters")
                except Exception as e:
                    logger.warning(f"Hindi Tesseract failed: {e}")
                
                # PaddleOCR with Hindi
                try:
                    if self.paddleocr.enabled:
                        hindi_paddle = self.paddleocr.extract_text(processed_image, language='hi')
                        if hindi_paddle.get('text'):
                            hindi_paddle['engine'] = 'paddleocr'
                            hindi_paddle['status'] = 'success'
                            hindi_results.append(hindi_paddle)
                            logger.info(f"Hindi PaddleOCR extracted {len(hindi_paddle.get('text', ''))} characters")
                except Exception as e:
                    logger.warning(f"Hindi PaddleOCR failed: {e}")
                
                # EasyOCR already supports Hindi - use existing result
                easyocr_result = next((r for r in ocr_results if r.get('engine') == 'easyocr'), None)
                if easyocr_result and easyocr_result.get('text'):
                    hindi_results.append(easyocr_result)
                
                # If we got better results with Hindi-specific OCR, use them
                if hindi_results:
                    hindi_fused = self.fusion.fuse(hindi_results)
                    if len(hindi_fused.get('text', '')) > len(fused_result.get('text', '')):
                        logger.info(f"Using Hindi-specific OCR results (improved from {len(fused_result.get('text', ''))} to {len(hindi_fused.get('text', ''))} chars)")
                        fused_result = hindi_fused
                        # Update ocr_outputs with Hindi results where available
                        for result in hindi_results:
                            engine = result.get('engine', 'unknown')
                            if engine in ocr_outputs:
                                ocr_outputs[engine] = {
                                    'text': result.get('text', ''),
                                    'confidence': result.get('confidence', 0.0),
                                    'boxes': result.get('boxes', []),
                                    'status': result.get('status', 'success')
                                }
            
            # Ensure fused confidence is valid
            fused_conf = fused_result.get('confidence', 0.0)
            if fused_conf is None or (isinstance(fused_conf, float) and (fused_conf != fused_conf or fused_conf < 0 or fused_conf > 1)):
                fused_conf = 0.0
            
            logger.info(f"Fusion complete: text_length={len(fused_result.get('text', ''))}, confidence={fused_conf:.2f}")
            
            # Build response in required format
            response = {
                'page_number': page_num,
                'ocr_outputs': {
                    'tesseract': {
                        'text': str(ocr_outputs.get('tesseract', {}).get('text', '')),
                        'confidence': float(ocr_outputs.get('tesseract', {}).get('confidence', 0.0)),
                        'boxes': ocr_outputs.get('tesseract', {}).get('boxes', []),
                        'status': ocr_outputs.get('tesseract', {}).get('status', 'unknown')
                    },
                    'paddleocr': {
                        'text': str(ocr_outputs.get('paddleocr', {}).get('text', '')),
                        'confidence': float(ocr_outputs.get('paddleocr', {}).get('confidence', 0.0)),
                        'boxes': ocr_outputs.get('paddleocr', {}).get('boxes', []),
                        'status': ocr_outputs.get('paddleocr', {}).get('status', 'unknown')
                    },
                    'easyocr': {
                        'text': str(ocr_outputs.get('easyocr', {}).get('text', '')),
                        'confidence': float(ocr_outputs.get('easyocr', {}).get('confidence', 0.0)),
                        'boxes': ocr_outputs.get('easyocr', {}).get('boxes', []),
                        'status': ocr_outputs.get('easyocr', {}).get('status', 'unknown')
                    }
                },
                'fused_result': {
                    'text': str(fused_result.get('text', '')),
                    'confidence': float(fused_conf),
                    'boxes': fused_result.get('boxes', []),
                    'source_models': fused_result.get('engines_used', ['tesseract', 'paddleocr', 'easyocr']),
                    'fusion_method': fused_result.get('fusion_method', 'confidence_weighted')
                },
                'metadata': {
                    'detected_language': detected_lang,
                    'language_confidence': float(lang_conf),
                    'text_regions_detected': len(text_regions),
                    'engines_executed': list(ocr_outputs.keys())
                }
            }
            
            return response
            
        except Exception as e:
            logger.error(f"OCR extraction error: {e}", exc_info=True)
            # Return error response with all engines marked as failed
            return {
                'page_number': page_num,
                'ocr_outputs': {
                    'tesseract': {'text': '', 'confidence': 0.0, 'boxes': [], 'status': 'failed', 'error': str(e)},
                    'paddleocr': {'text': '', 'confidence': 0.0, 'boxes': [], 'status': 'failed', 'error': str(e)},
                    'easyocr': {'text': '', 'confidence': 0.0, 'boxes': [], 'status': 'failed', 'error': str(e)}
                },
                'fused_result': {
                    'text': '',
                    'confidence': 0.0,
                    'boxes': [],
                    'source_models': [],
                    'fusion_method': 'none'
                },
                'error': str(e)
            }
    
    def extract_from_pdf(self, pdf_path: str) -> Dict:
        """
        Extract text from multi-page PDF
        MANDATORY: Process each page independently with all three engines
        
        Returns:
            Dictionary with per-page results and aggregated fused results
        """
        try:
            # Convert PDF to images
            images = pdf_to_images(pdf_path)
            logger.info(f"Processing PDF with {len(images)} pages")
            
            all_pages = []
            all_fused_texts = []
            all_boxes = []
            
            # Process each page independently
            for page_idx, image in enumerate(images, 1):
                # Save temporary image for processing
                import tempfile
                import os
                import cv2
                with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
                    cv2.imwrite(tmp_file.name, image)
                    temp_path = tmp_file.name
                
                try:
                    # Extract from this page (runs all three engines in parallel)
                    page_result = self.extract_from_image(temp_path, page_num=page_idx)
                    
                    # Update page numbers in boxes for all engines
                    for engine_name in ['tesseract', 'paddleocr', 'easyocr']:
                        if engine_name in page_result.get('ocr_outputs', {}):
                            for box in page_result['ocr_outputs'][engine_name].get('boxes', []):
                                box['page_num'] = page_idx
                    
                    # Update fused result boxes
                    for box in page_result.get('fused_result', {}).get('boxes', []):
                        box['page_num'] = page_idx
                    
                    all_pages.append(page_result)
                    all_fused_texts.append(page_result.get('fused_result', {}).get('text', ''))
                    all_boxes.extend(page_result.get('fused_result', {}).get('boxes', []))
                    
                finally:
                    # Clean up temp file
                    if os.path.exists(temp_path):
                        os.unlink(temp_path)
            
            # Aggregate results across pages
            full_fused_text = '\n\n--- Page Break ---\n\n'.join(all_fused_texts)
            
            # Calculate overall confidence from fused results
            fused_confidences = [
                p.get('fused_result', {}).get('confidence', 0) 
                for p in all_pages 
                if p.get('fused_result', {}).get('confidence', 0) > 0
            ]
            avg_confidence = sum(fused_confidences) / len(fused_confidences) if fused_confidences else 0.0
            
            # Aggregate per-engine outputs across all pages
            aggregated_ocr_outputs = {
                'tesseract': {'text': '', 'confidence': 0.0, 'boxes': [], 'pages': []},
                'paddleocr': {'text': '', 'confidence': 0.0, 'boxes': [], 'pages': []},
                'easyocr': {'text': '', 'confidence': 0.0, 'boxes': [], 'pages': []}
            }
            
            for page_result in all_pages:
                for engine_name in ['tesseract', 'paddleocr', 'easyocr']:
                    if engine_name in page_result.get('ocr_outputs', {}):
                        engine_output = page_result['ocr_outputs'][engine_name]
                        aggregated_ocr_outputs[engine_name]['pages'].append({
                            'page_number': page_result.get('page_number', 0),
                            'text': engine_output.get('text', ''),
                            'confidence': engine_output.get('confidence', 0.0)
                        })
                        aggregated_ocr_outputs[engine_name]['boxes'].extend(engine_output.get('boxes', []))
            
            # Calculate average confidence per engine
            for engine_name in aggregated_ocr_outputs:
                confidences = [p.get('confidence', 0) for p in aggregated_ocr_outputs[engine_name]['pages'] if p.get('confidence', 0) > 0]
                if confidences:
                    aggregated_ocr_outputs[engine_name]['confidence'] = sum(confidences) / len(confidences)
                # Combine text from all pages
                texts = [p.get('text', '') for p in aggregated_ocr_outputs[engine_name]['pages'] if p.get('text')]
                aggregated_ocr_outputs[engine_name]['text'] = '\n\n--- Page Break ---\n\n'.join(texts)
            
            return {
                'page_count': len(images),
                'pages': all_pages,  # Per-page detailed results
                'aggregated_ocr_outputs': aggregated_ocr_outputs,  # Per-engine aggregation
                'fused_result': {
                    'text': full_fused_text,
                    'confidence': avg_confidence,
                    'boxes': all_boxes,
                    'source_models': ['tesseract', 'paddleocr', 'easyocr'],
                    'total_boxes': len(all_boxes)
                }
            }
            
        except Exception as e:
            logger.error(f"PDF extraction error: {e}", exc_info=True)
            return {
                'page_count': 0,
                'pages': [],
                'aggregated_ocr_outputs': {
                    'tesseract': {'text': '', 'confidence': 0.0, 'boxes': [], 'pages': []},
                    'paddleocr': {'text': '', 'confidence': 0.0, 'boxes': [], 'pages': []},
                    'easyocr': {'text': '', 'confidence': 0.0, 'boxes': [], 'pages': []}
                },
                'fused_result': {
                    'text': '',
                    'confidence': 0.0,
                    'boxes': [],
                    'source_models': [],
                    'total_boxes': 0
                },
                'error': str(e)
            }

