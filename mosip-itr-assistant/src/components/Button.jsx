import React from 'react';
import { motion } from 'framer-motion';
import './Button.css';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    className = '',
    disabled = false,
    onClick,
    type = 'button',
    icon: Icon
}) => {
    const baseClass = `btn btn-${variant} btn-${size} ${className}`;

    return (
        <motion.button
            className={baseClass}
            onClick={onClick}
            disabled={disabled}
            type={type}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
        >
            {Icon && <Icon className="btn-icon" size={18} />}
            {children}
        </motion.button>
    );
};

export default Button;
