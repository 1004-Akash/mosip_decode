import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import './ValidationStatus.css';

const ValidationStatus = ({ score = 95, status = 'Passed' }) => {
    const getStatusColor = () => {
        if (status === 'Passed') return '#28a745';
        if (status === 'Warning') return '#ffc107';
        return '#dc3545';
    };

    const getStatusIcon = () => {
        if (status === 'Passed') return <CheckCircle size={48} />;
        if (status === 'Warning') return <AlertTriangle size={48} />;
        return <XCircle size={48} />;
    };

    const color = getStatusColor();

    return (
        <div className="validation-status-container">
            <motion.div
                className="score-circle"
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={{ borderColor: color, color: color }}
            >
                <span className="score-value">{score}%</span>
                <span className="score-label">Confidence</span>
            </motion.div>

            <motion.div
                className="status-details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="status-icon" style={{ color: color }}>
                    {getStatusIcon()}
                </div>
                <div>
                    <h3 className="status-title" style={{ color: color }}>Validation {status}</h3>
                    <p className="status-desc">Document verified against MOSIP standards.</p>
                </div>
            </motion.div>
        </div>
    );
};

export default ValidationStatus;
