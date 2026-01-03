import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, FileText, Clock, CheckCircle2, ArrowRight, Play } from 'lucide-react';
import Button from '../components/Button';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

    const stats = [
        { value: "10M+", label: "Documents Verified", icon: FileText },
        { value: "<30s", label: "Average Time", icon: Clock },
        { value: "99.9%", label: "Accuracy Rate", icon: CheckCircle2 }
    ];

    return (
        <div className="home-container">
            {/* Hero Section */}
            <motion.section
                className="hero-section"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
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
                            <Button
                                size="large"
                                onClick={() => navigate('/upload')}
                                className="cta-primary"
                            >
                                Start Verification
                                <ArrowRight size={20} />
                            </Button>
                            <Button
                                size="large"
                                variant="secondary"
                                onClick={() => navigate('/how-it-works')}
                                className="cta-secondary"
                            >
                                Learn How It Works
                            </Button>
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
        </div>
    );
};

export default Home;
