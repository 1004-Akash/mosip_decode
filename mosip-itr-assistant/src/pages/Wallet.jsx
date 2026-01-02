import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { QrCode, Download, Clock, FileText, CheckCircle, XCircle, Eye } from 'lucide-react';
import Card from '../components/Card';
import Button from '../components/Button';
import SimpleQR from '../components/SimpleQR';
import './Wallet.css';
import { useLocation } from 'react-router-dom';

const WalletPage = () => {
    const location = useLocation();
    const [qrDatabase, setQrDatabase] = useState([]);
    const [selectedQR, setSelectedQR] = useState(null);

    useEffect(() => {
        // Debug logging
        console.log('🔍 Wallet - Location State:', location.state);

        // Load existing QR codes from localStorage
        const stored = localStorage.getItem('qr_database');
        let existing = stored ? JSON.parse(stored) : [];

        console.log('📦 Wallet - Existing QR Database:', existing);

        // Add new QR from validation if available
        if (location.state?.signedQR || location.state?.extractedData) {
            console.log('✅ Wallet - New QR Data Found!');
            console.log('  - signedQR:', location.state?.signedQR);
            console.log('  - extractedData:', location.state?.extractedData);

            // Extract QR image - use the rendered QR from Validation page
            let qrImage = null;
            if (location.state?.qrData && typeof location.state.qrData === 'string' && location.state.qrData.startsWith('data:image')) {
                qrImage = location.state.qrData;
            }

            console.log('🖼️ Wallet - QR Image:', qrImage ? qrImage.substring(0, 50) + '...' : 'No valid image');

            const newQR = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                qrImage: qrImage,
                workflowId: location.state?.signedQR?.workflow_id,
                verified: location.state?.verified || false,
                validationScore: location.state?.score || null,
                metadata: {
                    name: location.state?.extractedData?.name || 'Unknown',
                    pan: location.state?.extractedData?.pan || location.state?.extractedData?.pan_number || 'N/A',
                    documentType: 'ITR Document',
                    encoding: location.state?.signedQR?.qr_code?.encoding || 'CBOR'
                }
            };

            console.log('📝 Wallet - New QR Object:', newQR);

            // Check if not duplicate
            const isDuplicate = existing.some(qr => qr.workflowId === newQR.workflowId);
            if (!isDuplicate && newQR.qrImage) {
                existing = [newQR, ...existing];
                localStorage.setItem('qr_database', JSON.stringify(existing));
                console.log('💾 Wallet - Saved to localStorage');
            } else {
                console.log('⚠️ Wallet - Duplicate or missing QR image');
            }
        } else {
            console.log('❌ Wallet - No new QR data in location.state');
        }

        setQrDatabase(existing);
        console.log('🎯 Wallet - Final Database:', existing);
    }, [location.state]);

    const formatTimestamp = (isoString) => {
        const date = new Date(isoString);
        return {
            date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const downloadQR = (qr) => {
        if (qr.qrImage) {
            const link = document.createElement('a');
            link.href = qr.qrImage;
            link.download = `QR_${qr.metadata.name}_${qr.timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const exportAllData = () => {
        const dataStr = JSON.stringify(qrDatabase, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `QR_Database_${new Date().toISOString()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="container page-wrapper">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="wallet-header">
                    <div className="icon-badge">
                        <QrCode size={32} />
                    </div>
                    <h2>QR Code Database</h2>
                    <p>Verified credentials with timestamps and metadata.</p>
                </div>

                {qrDatabase.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '3rem' }}>
                        <QrCode size={64} style={{ margin: '0 auto', opacity: 0.3 }} />
                        <h3 style={{ marginTop: '1rem', color: '#6b7280' }}>No QR Codes Yet</h3>
                        <p style={{ color: '#9ca3af' }}>Upload and verify documents to generate QR codes</p>
                    </Card>
                ) : (
                    <div className="qr-database-grid">
                        {qrDatabase.map((qr, index) => {
                            const { date, time } = formatTimestamp(qr.timestamp);
                            return (
                                <motion.div
                                    key={qr.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Card className="qr-database-item">
                                        {/* QR Code Display */}
                                        <div className="qr-preview">
                                            {qr.qrImage ? (
                                                <img
                                                    src={qr.qrImage}
                                                    alt="QR Code"
                                                    style={{
                                                        width: '100%',
                                                        height: 'auto',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => setSelectedQR(qr)}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    aspectRatio: '1',
                                                    background: '#f3f4f6',
                                                    borderRadius: '8px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <QrCode size={48} style={{ opacity: 0.3 }} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Metadata */}
                                        <div className="qr-metadata">
                                            <div className="qr-status">
                                                {qr.verified ? (
                                                    <span className="status-badge verified">
                                                        <CheckCircle size={14} />
                                                        Verified
                                                    </span>
                                                ) : (
                                                    <span className="status-badge unverified">
                                                        <XCircle size={14} />
                                                        Unverified
                                                    </span>
                                                )}
                                                {qr.validationScore && (
                                                    <span className="score-badge">
                                                        {qr.validationScore}% Match
                                                    </span>
                                                )}
                                            </div>

                                            <h3 className="qr-title">{qr.metadata.name}</h3>

                                            <div className="qr-info">
                                                <div className="info-row">
                                                    <FileText size={14} />
                                                    <span>{qr.metadata.documentType}</span>
                                                </div>
                                                <div className="info-row">
                                                    <span className="label">PAN:</span>
                                                    <span className="value">{qr.metadata.pan}</span>
                                                </div>
                                                {qr.workflowId && (
                                                    <div className="info-row">
                                                        <span className="label">ID:</span>
                                                        <span className="value" style={{ fontSize: '0.75rem' }}>
                                                            {qr.workflowId.substring(0, 12)}...
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="qr-timestamp">
                                                <Clock size={12} />
                                                <span>{date} • {time}</span>
                                            </div>

                                            <div className="qr-actions">
                                                <Button
                                                    variant="ghost"
                                                    size="small"
                                                    icon={Eye}
                                                    onClick={() => setSelectedQR(qr)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="small"
                                                    icon={Download}
                                                    onClick={() => downloadQR(qr)}
                                                >
                                                    Download
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                {qrDatabase.length > 0 && (
                    <div className="wallet-actions">
                        <Button variant="primary" icon={Download} onClick={exportAllData}>
                            Export Database
                        </Button>
                    </div>
                )}

                {/* QR Detail Modal */}
                {selectedQR && (
                    <motion.div
                        className="qr-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setSelectedQR(null)}
                    >
                        <motion.div
                            className="qr-modal"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Card>
                                <h2>QR Code Details</h2>
                                <div style={{ textAlign: 'center', margin: '2rem 0' }}>
                                    {selectedQR.qrImage && (
                                        <img
                                            src={selectedQR.qrImage}
                                            alt="QR Code"
                                            style={{ maxWidth: '300px', width: '100%' }}
                                        />
                                    )}
                                </div>
                                <div className="modal-metadata">
                                    <div className="metadata-row">
                                        <strong>Name:</strong>
                                        <span>{selectedQR.metadata.name}</span>
                                    </div>
                                    <div className="metadata-row">
                                        <strong>PAN:</strong>
                                        <span>{selectedQR.metadata.pan}</span>
                                    </div>
                                    <div className="metadata-row">
                                        <strong>Document Type:</strong>
                                        <span>{selectedQR.metadata.documentType}</span>
                                    </div>
                                    <div className="metadata-row">
                                        <strong>Encoding:</strong>
                                        <span>{selectedQR.metadata.encoding}</span>
                                    </div>
                                    {selectedQR.workflowId && (
                                        <div className="metadata-row">
                                            <strong>Workflow ID:</strong>
                                            <span style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>
                                                {selectedQR.workflowId}
                                            </span>
                                        </div>
                                    )}
                                    <div className="metadata-row">
                                        <strong>Generated:</strong>
                                        <span>{formatTimestamp(selectedQR.timestamp).date} at {formatTimestamp(selectedQR.timestamp).time}</span>
                                    </div>
                                    <div className="metadata-row">
                                        <strong>Status:</strong>
                                        <span>{selectedQR.verified ? '✅ Verified' : '❌ Unverified'}</span>
                                    </div>
                                    {selectedQR.validationScore && (
                                        <div className="metadata-row">
                                            <strong>Validation Score:</strong>
                                            <span>{selectedQR.validationScore}%</span>
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <Button variant="secondary" onClick={() => setSelectedQR(null)}>
                                        Close
                                    </Button>
                                    <Button variant="primary" icon={Download} onClick={() => downloadQR(selectedQR)}>
                                        Download
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default WalletPage;
