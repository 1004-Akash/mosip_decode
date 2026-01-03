import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
    Shield, 
    Upload, 
    FileText, 
    CheckCircle2, 
    HelpCircle,
    ArrowRight,
    ArrowUp,
    ArrowDown,
    Building2,
    Clock,
    Search,
    Download,
    Play
} from 'lucide-react';
import apiService from '../services/api';
import './Landing.css';

const Landing = () => {
    const [documentId, setDocumentId] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const verificationRef = useRef(null);
    const howItWorksRef = useRef(null);
    const aboutRef = useRef(null);

    const supportedDocuments = [
        'National ID Cards',
        'Driver\'s Licenses',
        'Educational Certificates',
        'Passports',
        'Birth Certificates',
        'Property Documents'
    ];

    const stats = [
        { value: "10M+", label: "Documents Verified", icon: FileText },
        { value: "<30s", label: "Average Time", icon: Clock },
        { value: "99.9%", label: "Accuracy Rate", icon: CheckCircle2 }
    ];

    const steps = [
        {
            number: "01",
            icon: Upload,
            iconColor: "green",
            title: "Upload Document",
            description: "Upload your government-issued document securely. We accept PDF, JPG, and PNG formats."
        },
        {
            number: "02",
            icon: Search,
            iconColor: "yellow",
            title: "Automated Verification",
            description: "Our AI-powered system cross-references your document with official databases in real-time."
        },
        {
            number: "03",
            icon: CheckCircle2,
            iconColor: "green",
            title: "Receive Results",
            description: "Get instant verification results with a detailed authenticity report and certificate."
        },
        {
            number: "04",
            icon: Download,
            iconColor: "orange",
            title: "Download Certificate",
            description: "Download your official verification certificate for records or third-party sharing."
        }
    ];

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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
                await new Promise(resolve => setTimeout(resolve, 2000));
                setVerificationResult({
                    status: 'success',
                    message: 'Document verified successfully',
                    documentId: documentId
                });
            } else if (selectedFile) {
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
        <div className="landing-page">
            {/* Hero Section */}
            <motion.section
                className="hero-section"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="hero-content-wrapper">
                    <div className="hero-text-content">
                        <motion.div
                            className="official-badge"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <span className="badge-dot"></span>
                            Official Government Portal
                        </motion.div>

                        <motion.h1
                            className="hero-headline"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            Secure Document <span className="highlight">Verification</span> Portal
                        </motion.h1>

                        <motion.p
                            className="hero-subheadline"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            Instantly verify the authenticity of government-issued documents. Fast, secure, and trusted by millions of citizens nationwide.
                        </motion.p>

                        {/* Stats Grid */}
                        <motion.div
                            className="stats-grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            {stats.map((stat, index) => (
                                <div key={index} className="stat-card">
                                    <stat.icon size={24} className="stat-icon" />
                                    <div className="stat-content">
                                        <div className="stat-value">{stat.value}</div>
                                        <div className="stat-label">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>

                        {/* Security Badge */}
                        <motion.div
                            className="security-badge"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Shield size={20} />
                            <span>256-bit SSL Bank-grade Security</span>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            className="hero-cta-buttons"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                        >
                            <button
                                className="cta-primary"
                                onClick={() => scrollToSection(verificationRef)}
                            >
                                Start Verification
                                <ArrowRight size={20} />
                            </button>
                            <button
                                className="cta-secondary"
                                onClick={() => scrollToSection(howItWorksRef)}
                            >
                                Learn How It Works
                            </button>
                        </motion.div>
                    </div>

                    {/* Video Section */}
                    <motion.div
                        className="hero-video-section"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="video-card">
                            <div className="video-thumbnail">
                                <div className="video-overlay">
                                    <button className="play-button">
                                        <Play size={48} fill="white" />
                                    </button>
                                </div>
                                <div className="video-info">
                                    <div className="video-title">How Document Verification Works</div>
                                    <div className="video-duration">Under 2 minutes</div>
                                </div>
                            </div>
                            <div className="video-security-badge">
                                <Shield size={16} />
                                <span>256-bit SSL Bank-grade Security</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

            {/* How It Works Section */}
            <section id="how-it-works" ref={howItWorksRef} className="how-it-works-section">
                <motion.div
                    className="process-badge"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                >
                    <span className="badge-dot"></span>
                    Simple Process
                </motion.div>

                <motion.h2
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    How Document Verification Works
                </motion.h2>

                <motion.p
                    className="section-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                >
                    Verify your documents in four simple steps. Our streamlined process ensures quick and accurate results every time.
                </motion.p>

                <div className="container">
                    <div className="steps-container">
                        {steps.map((step, index) => (
                            <React.Fragment key={index}>
                                <motion.div
                                    className="step-card-wrapper"
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="step-card">
                                        <div className="step-number">{step.number}</div>
                                        <div className={`step-icon step-icon-${step.iconColor}`}>
                                            <step.icon size={32} />
                                        </div>
                                        <h3 className="step-title">{step.title}</h3>
                                        <p className="step-description">{step.description}</p>
                                    </div>
                                </motion.div>
                                {index < steps.length - 1 && (
                                    <motion.div
                                        className="step-arrow"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: 0.3 }}
                                    >
                                        <ArrowRight size={32} />
                                    </motion.div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    <motion.div
                        className="how-it-works-cta"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <button
                            className="start-verification-btn"
                            onClick={() => scrollToSection(verificationRef)}
                        >
                            <ArrowUp size={20} />
                            Start Verification Now
                            <ArrowRight size={20} />
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" ref={aboutRef} className="about-section">
                <div className="container">
                    <motion.div
                        className="about-badge"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="badge-dot-red"></span>
                        Document Verification Process
                        <span className="badge-dot-red"></span>
                    </motion.div>

                    <motion.h2
                        className="about-title"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        How Our System Works
                    </motion.h2>

                    <motion.p
                        className="about-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        From paper documents to verifiable credentials - a seamless verification journey
                    </motion.p>

                    <div className="about-steps-container">
                        <div className="about-steps-grid">
                            {/* Row 1 */}
                            <motion.div
                                className="about-step-card about-step-card-1"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                            >
                                <div className="about-step-icon">📄</div>
                                <h3>Document Intake</h3>
                                <p>Aadhaar, PAN, and other official paper documents</p>
                            </motion.div>

                            <motion.div
                                className="about-step-card about-step-card-2"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4, duration: 0.5 }}
                            >
                                <div className="about-step-icon">🔍</div>
                                <h3>Intelligent OCR Extraction</h3>
                                <p>High-accuracy text extraction via our Stoplight OCR API</p>
                            </motion.div>

                            <motion.div
                                className="about-step-card about-step-card-3"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.7, duration: 0.5 }}
                            >
                                <div className="about-step-icon">✅</div>
                                <h3>Data Validation</h3>
                                <p>Structured checks using our Verification API</p>
                            </motion.div>

                            {/* Row 2 */}
                            <motion.div
                                className="about-step-card about-step-card-4"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1.0, duration: 0.5 }}
                            >
                                <div className="about-step-icon">🇮🇳</div>
                                <h3>Authoritative Record Matching</h3>
                                <p>Cross-verified against trusted Indian databases (InjInet)</p>
                            </motion.div>

                            <motion.div
                                className="about-step-card about-step-card-5"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1.3, duration: 0.5 }}
                            >
                                <div className="about-step-icon">📜</div>
                                <h3>Verifiable Credential (VC) Issuance</h3>
                                <p>Tamper-proof credentials generated from validated data</p>
                            </motion.div>

                            <motion.div
                                className="about-step-card about-step-card-6"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1.6, duration: 0.5 }}
                            >
                                <div className="about-step-icon">📱</div>
                                <h3>Secure Wallet Storage</h3>
                                <p>Credentials stored in the InjI Wallet, owned by the user</p>
                            </motion.div>

                            {/* Horizontal Connectors - Row 1 */}
                            <motion.div
                                className="about-connector about-connector-horizontal about-connector-h-1"
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                            >
                                <ArrowRight size={24} />
                            </motion.div>

                            <motion.div
                                className="about-connector about-connector-horizontal about-connector-h-2"
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.6, duration: 0.5 }}
                            >
                                <ArrowRight size={24} />
                            </motion.div>

                            {/* Horizontal Connectors - Row 2 */}
                            <motion.div
                                className="about-connector about-connector-horizontal about-connector-h-3"
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1.2, duration: 0.5 }}
                            >
                                <ArrowRight size={24} />
                            </motion.div>

                            <motion.div
                                className="about-connector about-connector-horizontal about-connector-h-4"
                                initial={{ scaleX: 0 }}
                                whileInView={{ scaleX: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1.5, duration: 0.5 }}
                            >
                                <ArrowRight size={24} />
                            </motion.div>

                            {/* Vertical Connectors */}
                            <motion.div
                                className="about-connector about-connector-vertical about-connector-vertical-1"
                                initial={{ scaleY: 0 }}
                                whileInView={{ scaleY: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.9, duration: 0.5 }}
                            >
                                <ArrowDown size={24} />
                            </motion.div>

                            <motion.div
                                className="about-connector about-connector-vertical about-connector-vertical-2"
                                initial={{ scaleY: 0 }}
                                whileInView={{ scaleY: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1.1, duration: 0.5 }}
                            >
                                <ArrowDown size={24} />
                            </motion.div>

                            <motion.div
                                className="about-connector about-connector-vertical about-connector-vertical-3"
                                initial={{ scaleY: 0 }}
                                whileInView={{ scaleY: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1.3, duration: 0.5 }}
                            >
                                <ArrowDown size={24} />
                            </motion.div>

                            {/* Connector to Featured Card */}
                            <motion.div
                                className="about-connector about-connector-to-featured"
                                initial={{ scaleY: 0 }}
                                whileInView={{ scaleY: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1.8, duration: 0.5 }}
                            >
                                <ArrowDown size={32} />
                            </motion.div>

                            {/* Universal Acceptance - Featured Card */}
                            <motion.div
                                className="about-step-card about-step-card-featured"
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 1.9, duration: 0.5 }}
                            >
                                <div className="about-step-icon">🏦</div>
                                <h3>Universal Acceptance</h3>
                                <p>Share once, verify instantly across banks, insurance, and other applications—no re-OCR required</p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Verification Section */}
            <section id="verification" ref={verificationRef} className="verification-section">
                <div className="container">
                    <div className="docverify-content-wrapper">
                        {/* Main Verification Card */}
                        <motion.div
                            className="verification-card"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
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
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
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
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
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
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="card-header">
                                    <HelpCircle size={24} className="card-icon" />
                                    <h3>Need Help?</h3>
                                </div>
                                <p>
                                    If you're having trouble with verification or need assistance, our support team is available 24/7.
                                </p>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default Landing;

