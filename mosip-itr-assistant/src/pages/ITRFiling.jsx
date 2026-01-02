import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { Calculator, Send, Check } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import './ITRFiling.css';

const ITRFilingPage = () => {
    const [formData, setFormData] = useState({
        income: 1200000,
        deductions: 150000,
    });

    const [result, setResult] = useState({
        taxableIncome: 0,
        taxPercentage: 0,
        taxAmount: 0
    });

    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Auto-calculate on mount for demo
        handleCalculate();
    }, []);

    const handleCalculate = () => {
        const taxable = Math.max(0, formData.income - formData.deductions);
        let tax = 0;

        // Simple mock tax logic
        if (taxable > 1000000) {
            tax = 112500 + (taxable - 1000000) * 0.3;
        } else if (taxable > 500000) {
            tax = 12500 + (taxable - 500000) * 0.2;
        }

        const percentage = taxable > 0 ? ((tax / taxable) * 100).toFixed(1) : 0;

        setResult({
            taxableIncome: taxable,
            taxAmount: tax,
            taxPercentage: percentage
        });
    };

    const handleSubmit = () => {
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <div className="container page-wrapper flex-center">
                <motion.div
                    className="success-state"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div className="success-icon">
                        <Check size={64} />
                    </div>
                    <h2>ITR Submitted Successfully!</h2>
                    <p>Your return for AY 2026-27 has been filed.</p>
                    <NavLink to="/">
                        <Button>Return to Home</Button>
                    </NavLink>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="container page-wrapper">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <div className="itr-header">
                    <h2>File Income Tax Return</h2>
                    <p>Calculate and submit your final liability.</p>
                </div>

                <div className="itr-grid">
                    <Card title="Income Details">
                        <Input
                            label="Total Income"
                            type="number"
                            value={formData.income}
                            onChange={(e) => setFormData({ ...formData, income: Number(e.target.value) })}
                        />
                        <Input
                            label="Total Deductions"
                            type="number"
                            value={formData.deductions}
                            onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                        />
                        <Button onClick={handleCalculate} icon={Calculator} className="full-width">
                            Calculate Tax
                        </Button>
                    </Card>

                    <Card title="Tax Calculation" className="result-card">
                        <div className="result-row">
                            <span>Taxable Income:</span>
                            <span className="amount">₹ {result.taxableIncome.toLocaleString()}</span>
                        </div>
                        <div className="result-row">
                            <span>Effective Tax Rate:</span>
                            <span>{result.taxPercentage}%</span>
                        </div>

                        <div className="tax-highlight">
                            <p>Estimated Tax Liability</p>
                            <h3>₹ {result.taxAmount.toLocaleString()}</h3>
                        </div>

                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            icon={Send}
                            className="full-width submit-btn"
                        >
                            Submit ITR
                        </Button>
                    </Card>
                </div>
            </motion.div>
        </div>
    );
};

export default ITRFilingPage;
