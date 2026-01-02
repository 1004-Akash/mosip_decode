import React from 'react';
import { motion } from 'framer-motion';
import './Card.css';

const Card = ({
    children,
    title,
    subtitle,
    className = '',
    glass = false,
    actions
}) => {
    return (
        <motion.div
            className={`card ${glass ? 'glass-panel' : ''} ${className}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            {(title || subtitle) && (
                <div className="card-header">
                    {title && <h3 className="card-title">{title}</h3>}
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
            )}
            <div className="card-content">
                {children}
            </div>
            {actions && (
                <div className="card-actions">
                    {actions}
                </div>
            )}
        </motion.div>
    );
};

export default Card;
