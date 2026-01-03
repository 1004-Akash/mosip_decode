import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Upload, Search, CheckCircle, Download, ArrowRight, ArrowUp } from 'lucide-react';
import Button from '../components/Button';
import './HowItWorks.css';

const HowItWorks = () => {
    const navigate = useNavigate();

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
            icon: CheckCircle,
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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    return (
        <div className="how-it-works-container">
            <motion.section
                className="how-it-works-hero"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <motion.div
                    className="process-badge"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="badge-dot"></span>
                    Simple Process
                </motion.div>

                <motion.h1
                    className="how-it-works-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    How Document Verification Works
                </motion.h1>

                <motion.p
                    className="how-it-works-subtitle"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    Verify your documents in four simple steps. Our streamlined process ensures quick and accurate results every time.
                </motion.p>
            </motion.section>

            {/* Steps Section */}
            <div className="container">
                <motion.div
                    className="steps-container"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {steps.map((step, index) => (
                        <React.Fragment key={index}>
                            <motion.div
                                className="step-card-wrapper"
                                variants={itemVariants}
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
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    className="how-it-works-cta"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                >
                    <Button
                        size="large"
                        onClick={() => navigate('/upload')}
                        className="start-verification-btn"
                    >
                        <ArrowUp size={20} />
                        Start Verification Now
                        <ArrowRight size={20} />
                    </Button>
                </motion.div>
            </div>
        </div>
    );
};

export default HowItWorks;

