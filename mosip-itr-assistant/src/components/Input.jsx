import React from 'react';
import './Input.css';

const Input = ({
    label,
    type = 'text',
    value,
    onChange,
    placeholder = '',
    readOnly = false,
    className = '',
    name
}) => {
    return (
        <div className={`input-group ${className}`}>
            {label && <label className="input-label">{label}</label>}
            <input
                type={type}
                className="form-input"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                readOnly={readOnly}
                name={name}
            />
        </div>
    );
};

export default Input;
