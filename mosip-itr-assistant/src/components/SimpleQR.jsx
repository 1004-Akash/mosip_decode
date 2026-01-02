import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle, Zap } from 'lucide-react';
import QRCode from 'qrcode';

const SimpleQR = ({ data, size = "200px", label = "Scan Code" }) => {
    // State for generated QR data URL
    const [generatedQR, setGeneratedQR] = useState(null);

    // Check if data is a base64 image (from PixelPass or other QR generators)
    const isImageData = data && (
        data.startsWith('data:image/') ||
        data.startsWith('data:image') ||
        // Check for base64 image without data URL prefix
        (typeof data === 'string' && data.length > 100 && /^[A-Za-z0-9+/=]+$/.test(data))
    );

    // If it's base64 without data URL prefix, add it
    const getImageSrc = () => {
        if (!data) return null;

        if (data.startsWith('data:image/')) {
            return data;
        } else if (typeof data === 'string' && data.length > 100 && /^[A-Za-z0-9+/=]+$/.test(data)) {
            // Raw base64 data, add data URL prefix
            return `data:image/png;base64,${data}`;
        }

        return null;
    };

    const imageSrc = getImageSrc();

    // Generate QR code if raw data is provided
    useEffect(() => {
        const generate = async () => {
            if (data && !imageSrc) {
                try {
                    const text = typeof data === 'string' ? data : JSON.stringify(data);
                    const url = await QRCode.toDataURL(text, {
                        width: 400,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#ffffff'
                        }
                    });
                    setGeneratedQR(url);
                } catch (err) {
                    console.error("QR Generation failed", err);
                }
            } else {
                setGeneratedQR(null);
            }
        };
        generate();
    }, [data, imageSrc]);

    // Unified source: either existing image or generated one
    const finalImageSrc = imageSrc || generatedQR;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: '1.5rem 0'
        }}>
            <div style={{
                width: size,
                height: size,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                padding: '1.5rem',
                borderRadius: '20px',
                boxShadow: `
                    0 20px 40px -10px rgba(0, 0, 0, 0.1),
                    0 8px 16px -4px rgba(0, 0, 0, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `,
                border: '2px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
            }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                    e.currentTarget.style.boxShadow = `
                    0 30px 60px -15px rgba(0, 0, 0, 0.15),
                    0 12px 24px -6px rgba(0, 0, 0, 0.1),
                    0 0 0 1px rgba(59, 130, 246, 0.3)
                `;
                    e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = `
                    0 20px 40px -10px rgba(0, 0, 0, 0.1),
                    0 8px 16px -4px rgba(0, 0, 0, 0.05),
                    inset 0 1px 0 rgba(255, 255, 255, 0.2)
                `;
                    e.currentTarget.style.borderColor = '#e2e8f0';
                }}
            >
                {/* Animated gradient border */}
                <div style={{
                    position: 'absolute',
                    top: '-3px',
                    left: '-3px',
                    right: '-3px',
                    bottom: '-3px',
                    background: 'linear-gradient(45deg, #3b82f6, #8b5cf6, #06b6d4, #10b981, #f59e0b, #ef4444, #3b82f6)',
                    borderRadius: '23px',
                    zIndex: -1,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    backgroundSize: '300% 300%',
                    animation: 'gradientShift 4s ease infinite'
                }} />

                {finalImageSrc ? (
                    <img
                        src={finalImageSrc}
                        alt="QR Code"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: '16px',
                            filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))'
                        }}
                    />
                ) : (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#374151',
                        width: '100%',
                        height: '100%',
                        backgroundImage: `
                            radial-gradient(circle at 25% 25%, #1f2937 2px, transparent 2px),
                            radial-gradient(circle at 75% 75%, #1f2937 2px, transparent 2px)
                        `,
                        backgroundSize: '20px 20px',
                        backgroundColor: '#ffffff',
                        backgroundPosition: '0 0, 10px 10px',
                        position: 'relative'
                    }}>
                        <div style={{
                            animation: 'qrIconSpin 4s ease-in-out infinite',
                            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
                        }}>
                            <QrCode size={90} strokeWidth={1.5} />
                        </div>
                        <span style={{
                            marginTop: '1rem',
                            fontSize: '0.8rem',
                            background: 'rgba(255, 255, 255, 0.95)',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            maxWidth: '180px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            fontWeight: '600',
                            color: '#1f2937',
                            backdropFilter: 'blur(8px)',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                            {data ? (typeof data === 'string' ? data.substring(0, 25) + '...' : 'QR Data') : 'Generating...'}
                        </span>
                    </div>
                )}

                {/* Enhanced scanning line */}
                <div style={{
                    position: 'absolute',
                    left: '8%',
                    right: '8%',
                    height: '5px',
                    background: 'linear-gradient(90deg, transparent 0%, #3b82f6 15%, #60a5fa 50%, #3b82f6 85%, transparent 100%)',
                    boxShadow: `
                        0 0 20px #3b82f6,
                        0 0 40px rgba(59, 130, 246, 0.4),
                        0 4px 8px rgba(59, 130, 246, 0.3)
                    `,
                    zIndex: 10,
                    borderRadius: '3px',
                    animation: 'scanLine 3s ease-in-out infinite',
                    filter: 'blur(0.5px)'
                }} />

                {/* Pulse ring */}
                <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '-12px',
                    right: '-12px',
                    bottom: '-12px',
                    border: '3px solid #3b82f6',
                    borderRadius: '26px',
                    pointerEvents: 'none',
                    opacity: 0.4,
                    animation: 'pulseRing 3s ease-out infinite'
                }} />

                {/* Corner indicators */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    width: '20px',
                    height: '20px',
                    border: '3px solid #3b82f6',
                    borderRight: 'none',
                    borderBottom: 'none',
                    borderRadius: '4px 0 0 0',
                    animation: 'cornerPulse 2s ease-in-out infinite'
                }} />
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '20px',
                    height: '20px',
                    border: '3px solid #3b82f6',
                    borderLeft: 'none',
                    borderBottom: 'none',
                    borderRadius: '0 4px 0 0',
                    animation: 'cornerPulse 2s ease-in-out infinite 0.5s'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    left: '12px',
                    width: '20px',
                    height: '20px',
                    border: '3px solid #3b82f6',
                    borderRight: 'none',
                    borderTop: 'none',
                    borderRadius: '0 0 0 4px',
                    animation: 'cornerPulse 2s ease-in-out infinite 1s'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '12px',
                    right: '12px',
                    width: '20px',
                    height: '20px',
                    border: '3px solid #3b82f6',
                    borderLeft: 'none',
                    borderTop: 'none',
                    borderRadius: '0 0 4px 0',
                    animation: 'cornerPulse 2s ease-in-out infinite 1.5s'
                }} />
            </div>

            <p style={{
                marginTop: '1.5rem',
                fontWeight: '700',
                color: '#1f2937',
                fontSize: '1rem',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                letterSpacing: '0.5px'
            }}>
                {label}
            </p>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginTop: '16px',
                padding: '10px 20px',
                background: finalImageSrc
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(34, 197, 94, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                color: finalImageSrc ? '#059669' : '#3b82f6',
                borderRadius: '30px',
                fontSize: '0.85rem',
                fontWeight: '700',
                border: `1px solid ${finalImageSrc ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`,
                backdropFilter: 'blur(8px)',
                boxShadow: `0 4px 8px ${finalImageSrc ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)'}`,
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
            }}>
                <span style={{
                    animation: finalImageSrc ? 'checkPulse 2s ease-in-out infinite' : 'iconSpin 3s linear infinite',
                    display: 'inline-flex',
                    alignItems: 'center'
                }}>
                    {finalImageSrc ? <CheckCircle size={18} /> : <Zap size={18} />}
                </span>
                {finalImageSrc ? 'QR Code Ready' : 'Generating QR...'}
            </div>

            <style jsx>{`
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                
                @keyframes qrIconSpin {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    25% { transform: rotate(90deg) scale(1.1); }
                    50% { transform: rotate(180deg) scale(1); }
                    75% { transform: rotate(270deg) scale(1.1); }
                }
                
                @keyframes iconSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                
                @keyframes checkPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
                
                @keyframes scanLine {
                    0%, 100% { 
                        transform: translateY(-150%);
                        opacity: 0;
                        scaleX: 0.8;
                    }
                    10%, 90% { 
                        opacity: 1;
                        scaleX: 1.2;
                    }
                    50% { 
                        transform: translateY(150%);
                        opacity: 1;
                        scaleX: 1.2;
                    }
                }
                
                @keyframes pulseRing {
                    0% { 
                        transform: scale(1);
                        opacity: 0.4;
                    }
                    50% { 
                        transform: scale(1.1);
                        opacity: 0.1;
                    }
                    100% { 
                        transform: scale(1);
                        opacity: 0.4;
                    }
                }
                
                @keyframes cornerPulse {
                    0%, 100% { 
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% { 
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }
            `}</style>
        </div>
    );
};

export default SimpleQR;