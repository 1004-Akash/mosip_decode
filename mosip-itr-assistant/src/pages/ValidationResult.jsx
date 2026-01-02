import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, ArrowRight, Home, Zap } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import './Validation.css'; // Reuse basic styles or create specific ones

const ValidationResult = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const result = location.state?.result;

    useEffect(() => {
        console.log('🔍 ValidationResult - Location State:', location.state);
        console.log('  - qrData:', location.state?.qrData);

        if (!result) {
            navigate('/validation');
        }
    }, [result, navigate]);

    if (!result) return null;

    const { score, is_match, match_label, status } = result;

    const getColor = (value) => {
        if (value >= 90) return '#10b981'; // Green
        if (value >= 75) return '#f59e0b'; // Amber
        return '#ef4444'; // Red
    };

    const color = getColor(score);

    return (
        <div className="container page-wrapper">
            <motion.div
                className="validation-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="validation-header">
                    <h2>Semantic Validation Result</h2>
                    <p>AI-powered comparison between Document Text and QR Data</p>
                </div>

                <div className="validation-grid" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Score Card */}
                    <Card>
                        <div style={{ textAlign: 'center', padding: '2rem' }}>
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 100 }}
                                style={{
                                    width: '180px',
                                    height: '180px',
                                    borderRadius: '50%',
                                    border: `10px solid ${color}20`,
                                    borderTop: `10px solid ${color}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto',
                                    boxShadow: `0 0 30px ${color}30`
                                }}
                            >
                                <span style={{ fontSize: '3rem', fontWeight: '800', color }}>{score}%</span>
                                <span style={{ fontSize: '0.9rem', color: '#6b7280', fontWeight: '600' }}>SIMILARITY</span>
                            </motion.div>

                            <div style={{ marginTop: '2rem' }}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1.5rem',
                                        background: `${color}15`,
                                        borderRadius: '30px',
                                        color: color,
                                        fontWeight: '700',
                                        fontSize: '1.2rem',
                                        border: `1px solid ${color}30`
                                    }}
                                >
                                    {is_match ? <CheckCircle size={24} /> : <XCircle size={24} />}
                                    {match_label.toUpperCase()}
                                </motion.div>
                            </div>

                            <p style={{ marginTop: '1.5rem', color: '#4b5563', maxWidth: '600px', marginInline: 'auto' }}>
                                The AI model validated the semantic meaning of your document against the secure verification code.
                                {is_match
                                    ? " The content strongly matches, confirming the document's authenticity."
                                    : " Significant discrepancies were found. Please verify the document manually."}
                            </p>
                        </div>
                    </Card>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/')}
                            icon={Home}
                        >
                            Back to Home
                        </Button>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/wallet', {
                                state: {
                                    score,
                                    verified: is_match,
                                    signedQR: location.state?.signedQR,
                                    extractedData: location.state?.extractedData
                                }
                            })}
                            icon={ArrowRight}
                            disabled={!is_match}
                        >
                            Proceed to Wallet
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default ValidationResult;
