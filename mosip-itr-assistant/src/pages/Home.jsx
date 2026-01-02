import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Database, ShieldCheck, Wallet } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();

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
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    const steps = [
        { icon: FileText, title: "1. Upload PDF", desc: "Securely upload your scanned documents." },
        { icon: Database, title: "2. Auto-Extract", desc: "Our AI extracts data to fill forms automatically." },
        { icon: ShieldCheck, title: "3. Validate", desc: "Verify data against MOSIP standards." },
        { icon: Wallet, title: "4. Store in Wallet", desc: "Keep verifiable credentials in your digital wallet." }
    ];

    return (
        <div className="home-container">
            <motion.section
                className="hero-section"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <div className="hero-content">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Welcome to MOSIP ITR Assistant
                    </motion.h1>
                    <motion.p
                        className="hero-subtitle"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        Streamline your Income Tax Return filing with secure OCR and validation.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Button
                            size="large"
                            onClick={() => navigate('/upload')}
                            className="hero-cta"
                        >
                            Start Document Upload
                        </Button>
                    </motion.div>
                </div>
            </motion.section>

            <div className="container">
                <h2 className="section-title">How It Works</h2>
                <motion.div
                    className="steps-grid"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {steps.map((step, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <Card className="step-card" glass>
                                <div className="step-icon-wrapper">
                                    <step.icon size={32} />
                                </div>
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
