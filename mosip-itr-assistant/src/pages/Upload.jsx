import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, ArrowLeft, Zap, Settings } from 'lucide-react';
import FileUpload from '../components/FileUpload';
import Button from '../components/Button';
import Card from '../components/Card';
import apiService from '../services/api';
import './Upload.css';

const UploadPage = () => {
    const navigate = useNavigate();
    const [fileUploaded, setFileUploaded] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [error, setError] = useState(null);
    const [useEnhancedOCR, setUseEnhancedOCR] = useState(true);
    const [engineStatus, setEngineStatus] = useState(null);
    const [processingDetails, setProcessingDetails] = useState(null);

    // Check enhanced OCR status on component mount
    useEffect(() => {
        checkEnhancedOCRStatus();
    }, []);

    const checkEnhancedOCRStatus = async () => {
        try {
            const status = await apiService.getEnhancedOCRStatus();
            setEngineStatus(status);
            console.log('🔧 Enhanced OCR Status:', status);
        } catch (error) {
            console.error('Failed to check enhanced OCR status:', error);
        }
    };

    const handleUpload = (file) => {
        setSelectedFile(file);
        setFileUploaded(true);
        setError(null);
        setProcessingDetails(null);
        
        // Check file size and show warning
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > 15) {
            setError(`Large file detected (${fileSizeMB.toFixed(1)}MB). Processing may take longer and the file will be compressed automatically.`);
        } else if (fileSizeMB > 25) {
            setError(`File is very large (${fileSizeMB.toFixed(1)}MB). Please consider reducing the file size or number of pages for better performance.`);
        }
    };

    const handleProcess = async () => {
        if (!selectedFile) return;

        setIsProcessing(true);
        setError(null);
        setProcessingDetails(null);

        try {
            console.log(`🔍 Starting ${useEnhancedOCR ? 'Enhanced' : 'Basic'} OCR processing...`);
            
            let data;
            if (useEnhancedOCR) {
                // Use Enhanced OCR with multiple engines
                data = await apiService.enhancedExtractText(selectedFile, 'ITR Document', true);
                console.log('✅ Enhanced OCR processing successful:', data);
                
                // Store processing details for display
                setProcessingDetails({
                    engines_used: data.engines_used || [],
                    confidence_score: data.confidence_score || 0,
                    processing_time: data.processing_time || 0,
                    selected_engine: data.processing_details?.selected_engine || 'unknown'
                });
            } else {
                // Use basic OCR
                data = await apiService.extractText(selectedFile, 'ITR Document');
                console.log('✅ Basic OCR processing successful:', data);
            }
            
            // Navigate to forms page with extracted data
            navigate('/forms', { 
                state: { 
                    extractedData: data,
                    originalFile: selectedFile,
                    processingDetails: processingDetails,
                    usedEnhancedOCR: useEnhancedOCR
                } 
            });
            
        } catch (error) {
            console.error('❌ OCR processing failed:', error);
            setError(error.message || 'OCR processing failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container page-wrapper">
            <motion.div
                className="upload-wrapper"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card title="Upload Document" subtitle="Upload your scanned document for OCR processing." glass>
                    <FileUpload
                        onUpload={handleUpload}
                        helperText="Supports PDF, JPG, PNG files up to 10MB"
                    />

                    {/* OCR Engine Selection */}
                    <motion.div
                        className="ocr-options"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: '20px',
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: '12px',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                    >
                        <h4 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '14px', fontWeight: '600' }}>
                            <Settings size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            OCR Engine Selection
                        </h4>
                        
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#e5e7eb' }}>
                                <input
                                    type="radio"
                                    name="ocrType"
                                    checked={!useEnhancedOCR}
                                    onChange={() => setUseEnhancedOCR(false)}
                                    style={{ marginRight: '8px' }}
                                />
                                Basic OCR (EasyOCR)
                            </label>
                            
                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#e5e7eb' }}>
                                <input
                                    type="radio"
                                    name="ocrType"
                                    checked={useEnhancedOCR}
                                    onChange={() => setUseEnhancedOCR(true)}
                                    style={{ marginRight: '8px' }}
                                />
                                <Zap size={16} style={{ marginRight: '4px', color: '#fbbf24' }} />
                                Enhanced OCR (Tesseract + EasyOCR + TrOCR)
                            </label>
                        </div>

                        {/* Engine Status Display */}
                        {engineStatus && (
                            <div style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>
                                <div>Available Engines: {engineStatus.summary?.available_engines || 0}/{engineStatus.summary?.total_engines || 0}</div>
                                {useEnhancedOCR && (
                                    <div style={{ marginTop: '4px' }}>
                                        {Object.entries(engineStatus.engines || {}).map(([engine, info]) => (
                                            <span key={engine} style={{ marginRight: '12px' }}>
                                                {info.available ? '✅' : '❌'} {engine}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {error && (
                        <motion.div
                            className="error-message"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                color: '#ef4444',
                                background: '#fef2f2',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #fecaca',
                                marginTop: '16px'
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Processing Details */}
                    {processingDetails && (
                        <motion.div
                            className="processing-details"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: '16px',
                                padding: '12px',
                                background: 'rgba(34, 197, 94, 0.1)',
                                borderRadius: '8px',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                color: '#22c55e'
                            }}
                        >
                            <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
                                ✅ Processing Complete
                            </div>
                            <div style={{ fontSize: '12px', color: '#16a34a' }}>
                                <div>Engines Used: {processingDetails.engines_used.join(', ')}</div>
                                <div>Confidence: {(processingDetails.confidence_score * 100).toFixed(1)}%</div>
                                <div>Processing Time: {processingDetails.processing_time.toFixed(2)}s</div>
                                <div>Selected Engine: {processingDetails.selected_engine}</div>
                            </div>
                        </motion.div>
                    )}

                    <div className="action-buttons">
                        <Button variant="secondary" onClick={() => navigate('/')} icon={ArrowLeft}>
                            Back to Home
                        </Button>

                        <Button
                            onClick={handleProcess}
                            disabled={!fileUploaded || isProcessing}
                            icon={isProcessing ? null : (useEnhancedOCR ? Zap : ArrowRight)}
                        >
                            {isProcessing ? "Processing..." : (useEnhancedOCR ? "Enhanced Process" : "Process Document")}
                        </Button>
                    </div>
                </Card>

                <AnimatePresence>
                    {isProcessing && (
                        <motion.div
                            className="processing-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="spinner-container">
                                <motion.div
                                    className="spinner"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <p>
                                    {useEnhancedOCR 
                                        ? "Analyzing document with Enhanced OCR (Multiple Engines)..." 
                                        : "Analyzing document with OCR..."
                                    }
                                </p>
                                <small>Connecting to backend at http://127.0.0.1:5000</small>
                                {useEnhancedOCR && (
                                    <small style={{ display: 'block', marginTop: '8px', color: '#fbbf24' }}>
                                        Using Tesseract + EasyOCR + TrOCR for maximum accuracy
                                    </small>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default UploadPage;
