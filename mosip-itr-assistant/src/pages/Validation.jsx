import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle, CreditCard, Download } from 'lucide-react';
import ValidationStatus from '../components/ValidationStatus';
import SimpleQR from '../components/SimpleQR';
import Button from '../components/Button';
import Card from '../components/Card';
import apiService from '../services/api';
import QRCodeLib from 'qrcode';
import './Validation.css';

const ValidationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isVerifying, setIsVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [isGeneratingQR, setIsGeneratingQR] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [qrImageData, setQrImageData] = useState(null); // Rendered QR image for Wallet
    const qrImageRef = React.useRef(null); // Store QR image reliably
    const [signedQR, setSignedQR] = useState(null);
    const [validationScore, setValidationScore] = useState(85);
    const [error, setError] = useState(null);

    // Get extracted data from previous page
    const extractedData = location.state?.extractedData?.extracted_data?.structured_data || {};
    const rawText = location.state?.extractedData?.extracted_data?.raw_text || "";
    const requestId = location.state?.extractedData?.request_id;
    const processingDetails = location.state?.processingDetails;
    const usedEnhancedOCR = location.state?.usedEnhancedOCR;

    useEffect(() => {
        // Always show animated QR, try to generate real QR if data exists
        if (Object.keys(extractedData).length > 0) {
            generateQRCodes();
        } else {
            // Show animated placeholder even without data
            setQrData("Demo QR code for Injinet credential verification system");
        }
    }, [extractedData]);

    const generateQRCodes = async () => {
        setIsGeneratingQR(true);
        setError(null);

        try {
            console.log('🔐 Generating QR codes with real signatures...');

            // Generate signed QR code with real Ed25519 signatures
            const signedQRResult = await apiService.generateSignedQR(extractedData);

            if (signedQRResult.success) {
                setSignedQR(signedQRResult);
                console.log('✅ Signed QR generated successfully');
            }

            // Generate simple QR for display (now uses PixelPass)
            const simpleQRResult = await apiService.generateSimpleQR(extractedData, 'json');

            console.log('🔍 PixelPass QR Result:', simpleQRResult);

            if (simpleQRResult.success) {
                // PixelPass returns the QR in qr_code.qr_image format
                const qrImageData = simpleQRResult.qr_code?.qr_image ||
                    simpleQRResult.qr_image ||
                    simpleQRResult.qr_data;

                console.log('🖼️ QR Image Data:', qrImageData ? qrImageData.substring(0, 100) + '...' : 'No image data');

                if (qrImageData) {
                    setQrData(qrImageData);
                    console.log('✅ PixelPass QR generated successfully');
                } else {
                    console.warn('⚠️ No QR image data found in PixelPass response');
                    // Fallback to demo data
                    setQrData("Demo QR code for Injinet credential verification system");
                }
            } else {
                console.error('❌ PixelPass QR generation failed:', simpleQRResult.error);
                // Fallback to demo data
                setQrData("Demo QR code for Injinet credential verification system");
            }

            // Generate renderable QR image for Wallet storage from extracted data
            console.log('🎨 Starting QR image generation for Wallet...');
            console.log('  - extractedData:', extractedData);
            try {
                const dataForQR = JSON.stringify(extractedData);
                console.log('  - dataForQR (stringified):', dataForQR.substring(0, 100) + '...');
                const qrImage = await QRCodeLib.toDataURL(dataForQR, { width: 400, margin: 2 });
                setQrImageData(qrImage);
                qrImageRef.current = qrImage; // Store in ref for immediate access
                console.log('✅ Generated QR image for Wallet:', qrImage.substring(0, 50) + '...');
            } catch (err) {
                console.error('❌ Failed to generate QR image for Wallet:', err);
            }

            // Perform data verification
            if (requestId) {
                const verificationResult = await apiService.verifyData(requestId, extractedData);
                if (verificationResult.verification_status === 'passed') {
                    setValidationScore(95);
                } else {
                    setValidationScore(Math.max(70, 95 - (verificationResult.discrepancies?.length || 0) * 10));
                }
            }

        } catch (error) {
            console.error('❌ QR generation failed:', error);
            setError(error.message || 'QR generation failed');

            // Fallback to mock data
            const mockQRData = JSON.stringify({
                name: extractedData.name || "User",
                pan: extractedData.pan_number || extractedData.pan || "XXXXX1234X",
                verified: false,
                timestamp: new Date().toISOString(),
                note: "Generated offline - backend unavailable"
            });
            setQrData(`data:image/svg+xml;base64,${btoa(mockQRData)}`);
        } finally {
            setIsGeneratingQR(false);
        }
    };

    const handleVerify = async () => {
        if (!qrData && !signedQR) {
            setError("QR validation failed: No valid QR data found. Please ensure the QR code is generated before verifying.");
            return;
        }

        setIsVerifying(true);
        setError(null);

        try {
            console.log('🔍 Verifying with Semantic Validator...');

            // Perform Semantic Validation
            const semanticResult = await apiService.validateSemantic(
                rawText || JSON.stringify(extractedData), // Fallback if raw text missing
                extractedData
            );

            console.log("✅ Semantic Validation Result:", semanticResult);

            if (semanticResult) {
                const qrImageToPass = qrImageRef.current || qrImageData;
                console.log('📤 Navigating to ValidationResult with:');
                console.log('  - qrImageData (from ref):', qrImageToPass ? qrImageToPass.substring(0, 50) + '...' : 'NULL/UNDEFINED');
                console.log('  - signedQR:', signedQR);
                console.log('  - extractedData:', extractedData);

                navigate('/validation-result', {
                    state: {
                        result: semanticResult,
                        verified: semanticResult.is_match,
                        signedQR: signedQR,
                        qrData: qrImageToPass, // Use ref value for immediate access
                        extractedData: extractedData
                    }
                });
            }

        } catch (error) {
            console.error('❌ Validation failed:', error);
            setError(error.message || 'Verification failed');
            setIsVerifying(false); // Stop loading only on error
        }
    };

    const downloadQR = () => {
        // Try multiple possible QR image sources from PixelPass response
        const qrImageSrc = signedQR?.qr_code?.qr_image ||
            signedQR?.qr_image ||
            qrData;

        if (qrImageSrc) {
            const link = document.createElement('a');
            link.href = qrImageSrc;
            link.download = 'signed-credential-qr.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            console.warn('No QR image data available for download');
        }
    };

    return (
        <div className="container page-wrapper">
            <motion.div
                className="validation-wrapper"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="validation-header">
                    <h2>Schema Validation</h2>
                    <p>Validation results against verified MOSIP ITR schemas.</p>
                </div>

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
                            marginBottom: '16px'
                        }}
                    >
                        {error}
                    </motion.div>
                )}

                <div className="validation-grid">
                    <Card className="score-card">
                        <ValidationStatus score={validationScore} status={validationScore >= 90 ? "Passed" : "Warning"} />

                        {/* Enhanced OCR Processing Details */}
                        {usedEnhancedOCR && processingDetails && (
                            <motion.div
                                className="ocr-details"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    marginTop: '16px',
                                    padding: '12px',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                }}
                            >
                                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#3b82f6' }}>
                                    🚀 Enhanced OCR Results
                                </div>
                                <div style={{ fontSize: '12px', color: '#1e40af' }}>
                                    <div>Engines Used: {processingDetails.engines_used.join(', ')}</div>
                                    <div>Confidence: {(processingDetails.confidence_score * 100).toFixed(1)}%</div>
                                    <div>Processing Time: {processingDetails.processing_time.toFixed(2)}s</div>
                                    <div>Best Engine: {processingDetails.selected_engine}</div>
                                </div>
                            </motion.div>
                        )}
                    </Card>

                    <Card className="qr-card" title="Injinet QR Generation">
                        <div className="qr-content-wrapper">
                            {/* Always show the animated QR component */}
                            <SimpleQR
                                data={qrData || "Generating QR code for Injinet credential verification..."}
                                size="280px"
                                label="Injinet Credential"
                            />

                            <div className="qr-actions">
                                {signedQR && (
                                    <Button
                                        variant="secondary"
                                        onClick={downloadQR}
                                        icon={Download}
                                        size="small"
                                    >
                                        Download Signed QR
                                    </Button>
                                )}

                                {!verified ? (
                                    <Button
                                        variant="primary"
                                        onClick={handleVerify}
                                        disabled={isVerifying}
                                        className="full-width"
                                    >
                                        {isVerifying ? "Verifying with Injinet..." : "Verify with Injinet"}
                                    </Button>
                                ) : (
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="success-message"
                                    >
                                        <CheckCircle size={20} />
                                        <span>Verified Successfully!</span>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>

                {signedQR && (
                    <Card title="Verification Details" className="details-card">
                        <div className="verification-details">
                            <div className="detail-item">
                                <strong>Workflow ID:</strong> {signedQR.workflow_id}
                            </div>
                            <div className="detail-item">
                                <strong>Signature Type:</strong> Ed25519Signature2018
                            </div>
                            <div className="detail-item">
                                <strong>Encoding:</strong> {signedQR.qr_code?.encoding || 'CBOR'}
                            </div>
                            <div className="detail-item">
                                <strong>Compatible With:</strong> Inji Verify Portal
                            </div>
                        </div>
                    </Card>
                )}

                <div className="action-row">
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/wallet', {
                            state: {
                                extractedData,
                                signedQR,
                                verified
                            }
                        })}
                        icon={CreditCard}
                        size="large"
                    >
                        Go to Wallet
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

export default ValidationPage;
