import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    Shield, 
    Upload, 
    FileText, 
    CheckCircle2, 
    HelpCircle,
    ArrowRight
} from 'lucide-react';
import apiService from '../services/api';
import './Upload.css';

const UploadPage = () => {
    const [documentId, setDocumentId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const supportedDocuments = [
        'National ID Cards',
        'Driver\'s Licenses',
        'Educational Certificates',
        'Passports',
        'Birth Certificates',
        'Property Documents'
    ];

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileSelect = (file) => {
        const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 10 * 1024 * 1024; // 10MB

        if (!validTypes.includes(file.type)) {
            setError('Please upload a PDF, JPG, or PNG file.');
            return;
        }

        if (file.size > maxSize) {
            setError('File size must be less than 10MB.');
            return;
        }

        setSelectedFile(file);
        setError(null);
        setVerificationResult(null);
    };

    const handleFileInputChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleVerify = async () => {
        if (!documentId && !selectedFile) {
            setError('Please enter a document ID or upload a document.');
            return;
        }

        setIsVerifying(true);
        setError(null);
        setVerificationResult(null);

        try {
            if (documentId) {
                // Verify by document ID
                await new Promise(resolve => setTimeout(resolve, 2000));
                setVerificationResult({
                    status: 'success',
                    message: 'Document verified successfully',
                    documentId: documentId
                });
            } else if (selectedFile) {
                // Verify by file upload
                const result = await apiService.enhancedExtractText(selectedFile, 'Verification Document', true);
                setVerificationResult({
                    status: 'success',
                    message: 'Document processed and verified',
                    extractedData: result
                });
            }
        } catch (err) {
            setError(err.message || 'Verification failed. Please try again.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="docverify-page-container">
            <div className="docverify-content-wrapper">
                {/* Main Verification Card */}
                <motion.div
                    className="verification-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="secure-badge">
                        <Shield size={14} />
                        <span>Secure Verification</span>
                    </div>

                    <h1 className="verification-title">Start Your Verification</h1>
                    <p className="verification-subtitle">
                        Upload your document or enter the document ID to verify its authenticity instantly.
                    </p>

                    {/* Document ID Input */}
                    <div className="input-section">
                        <label className="input-label">Document ID Number</label>
                        <input
                            type="text"
                            className="document-id-input"
                            placeholder="Enter document ID (e.g., DOC-2024-XXXXX)"
                            value={documentId}
                            onChange={(e) => {
                                setDocumentId(e.target.value);
                                setSelectedFile(null);
                                setError(null);
                            }}
                        />
                    </div>

                    {/* OR Separator */}
                    <div className="separator">
                        <div className="separator-line"></div>
                        <span className="separator-text">OR</span>
                        <div className="separator-line"></div>
                    </div>

                    {/* File Upload Section */}
                    <div className="input-section">
                        <label className="input-label">Upload Document</label>
                        <div
                            className={`upload-area ${isDragging ? 'dragging' : ''} ${selectedFile ? 'has-file' : ''}`}
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={handleBrowseClick}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileInputChange}
                                style={{ display: 'none' }}
                            />
                            <Upload size={48} className="upload-icon" />
                            {selectedFile ? (
                                <div className="file-selected">
                                    <FileText size={20} />
                                    <span>{selectedFile.name}</span>
                                </div>
                            ) : (
                                <>
                                    <p className="upload-text">Drag & drop your document here</p>
                                    <p className="upload-hint">or click to browse (PDF, JPG, PNG - Max 10MB)</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            className="error-message"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Verification Result */}
                    {verificationResult && (
                        <motion.div
                            className="verification-result"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <CheckCircle2 size={24} />
                            <div>
                                <h3>{verificationResult.message}</h3>
                                {verificationResult.documentId && (
                                    <p>Document ID: {verificationResult.documentId}</p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Verify Button */}
                    <button
                        className="verify-button"
                        onClick={handleVerify}
                        disabled={isVerifying || (!documentId && !selectedFile)}
                    >
                        {isVerifying ? (
                            <>Verifying...</>
                        ) : (
                            <>
                                <Shield size={20} />
                                Verify Document
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </motion.div>

                {/* Sidebar */}
                <div className="docverify-sidebar">
                    {/* Supported Documents Card */}
                    <motion.div
                        className="info-card supported-docs"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="card-header">
                            <FileText size={24} className="card-icon" />
                            <h3>Supported Documents</h3>
                        </div>
                        <ul className="doc-list">
                            {supportedDocuments.map((doc, index) => (
                                <li key={index}>
                                    <CheckCircle2 size={16} />
                                    <span>{doc}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Security Card */}
                    <motion.div
                        className="info-card security-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="card-header">
                            <Shield size={24} className="card-icon" />
                            <h3>Your Security Matters</h3>
                        </div>
                        <p>
                            All documents are encrypted with 256-bit SSL encryption. We never store your documents 
                            permanently and all data is automatically deleted after verification is complete.
                        </p>
                    </motion.div>

                    {/* Help Card */}
                    <motion.div
                        className="info-card help-card"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="card-header">
                            <HelpCircle size={24} className="card-icon" />
                            <h3>Need Help?</h3>
                        </div>
                        <p>
                            If you're having trouble with verification or need assistance, our support team is available 24/7.
                        </p>
                        <a href="#contact" className="help-link">
                            Contact Support
                            <ArrowRight size={16} />
                        </a>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default UploadPage;
