import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Zap, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';
import './QRGenerator.css';

const QRGenerator = ({ data, size = "200px", label = "Scan Code" }) => {
    const [isReady, setIsReady] = useState(false);
    const [animationPhase, setAnimationPhase] = useState('loading');

    const [generatedQR, setGeneratedQR] = useState(null);

    // Check if data is a base64 image
    const isImageData = data && (data.startsWith('data:image/') || data.startsWith('data:image'));

    useEffect(() => {
        if (isImageData || data) {
            setAnimationPhase('ready');
            setIsReady(true);

            if (data && !isImageData) {
                const generate = async () => {
                    try {
                        const text = typeof data === 'string' ? data : JSON.stringify(data);
                        const url = await QRCode.toDataURL(text, { margin: 2, width: 400 });
                        setGeneratedQR(url);
                    } catch (err) {
                        console.error("QR Gen failed", err);
                    }
                };
                generate();
            }

        } else {
            setAnimationPhase('generating');
            setIsReady(false);
            setGeneratedQR(null);
        }
    }, [isImageData, data]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                staggerChildren: 0.1
            }
        }
    };

    const boxVariants = {
        hidden: { scale: 0.8, opacity: 0, rotateY: -15 },
        visible: {
            scale: 1,
            opacity: 1,
            rotateY: 0,
            transition: {
                duration: 0.7,
                ease: "backOut",
                delay: 0.1
            }
        },
        hover: {
            scale: 1.02,
            y: -4,
            transition: { duration: 0.3 }
        }
    };

    const iconVariants = {
        loading: {
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        },
        generating: {
            rotate: [0, 180, 360],
            scale: [1, 1.1, 1],
            transition: {
                duration: 3,
                repeat: Infinity,
                ease: "linear"
            }
        },
        ready: {
            scale: [1, 1.1, 1],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const scanLineVariants = {
        animate: {
            y: ['-120%', '120%'],
            opacity: [0, 1, 1, 0],
            scaleX: [0.8, 1.2, 1.2, 0.8],
            transition: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.1, 0.9, 1]
            }
        }
    };

    const pulseRingVariants = {
        animate: {
            scale: [1, 1.15, 1],
            opacity: [0.6, 0.1, 0.6],
            transition: {
                duration: 2.5,
                repeat: Infinity,
                ease: "easeOut"
            }
        }
    };

    const statusVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 10 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: 0.8,
                ease: "backOut"
            }
        }
    };

    const getStatusIcon = () => {
        switch (animationPhase) {
            case 'ready':
                return <CheckCircle size={16} />;
            case 'generating':
                return <Zap size={16} />;
            default:
                return <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>⚡</motion.div>;
        }
    };

    const getStatusText = () => {
        switch (animationPhase) {
            case 'ready':
                return 'QR Code Ready';
            case 'generating':
                return 'Generating QR...';
            default:
                return 'Processing...';
        }
    };

    return (
        <motion.div
            className="qr-container"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className={`qr-box ${isReady ? 'active' : ''}`}
                variants={boxVariants}
                whileHover="hover"
                style={{ width: size, height: size }}
            >
                <AnimatePresence mode="wait">
                    {isImageData ? (
                        <motion.img
                            key="qr-image"
                            src={data}
                            alt="QR Code"
                            className="qr-image"
                            initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                            transition={{ duration: 0.6, ease: "backOut" }}
                        />
                    ) : isReady && data ? (
                        <motion.div
                            key="qr-code-raw"
                            className="qr-raw-container"
                            initial={{ opacity: 0, scale: 0.9, rotateY: 90 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            exit={{ opacity: 0, scale: 0.9, rotateY: -90 }}
                            transition={{ duration: 0.6, ease: "backOut" }}
                            style={{
                                background: 'white',
                                padding: '10px',
                                borderRadius: '8px',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {generatedQR && <img src={generatedQR} alt="QR Code" style={{ width: '100%', height: 'auto' }} />}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="qr-placeholder"
                            className="qr-placeholder"
                            initial={{ opacity: 0 }}
                            animate={{
                                opacity: 1,
                                backgroundPosition: ['0px 0px', '16px 16px', '0px 0px']
                            }}
                            exit={{ opacity: 0 }}
                            transition={{
                                opacity: { duration: 0.3 },
                                backgroundPosition: { duration: 4, repeat: Infinity, ease: "linear" }
                            }}
                        >
                            <motion.div
                                variants={iconVariants}
                                animate={animationPhase}
                            >
                                <QrCode size={80} strokeWidth={1.5} />
                            </motion.div>
                            <motion.span
                                className="qr-data-preview"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                {data ? (typeof data === 'string' ? data.substring(0, 20) + '...' : 'QR Data') : 'Generating...'}
                            </motion.span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Enhanced scanning line animation */}
                <motion.div
                    className="scan-line"
                    variants={scanLineVariants}
                    animate="animate"
                />

                {/* Pulse ring animation */}
                <motion.div
                    className="qr-pulse-ring"
                    variants={pulseRingVariants}
                    animate="animate"
                />
            </motion.div>

            <motion.p
                className="qr-label"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                {label}
            </motion.p>

            {/* Enhanced status indicator */}
            <motion.div
                className="qr-status"
                variants={statusVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: animationPhase === 'generating' ? [0, 360] : [0, 10, -10, 0]
                    }}
                    transition={{
                        duration: animationPhase === 'generating' ? 2 : 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {getStatusIcon()}
                </motion.div>
                {getStatusText()}
            </motion.div>
        </motion.div>
    );
};

export default QRGenerator;
