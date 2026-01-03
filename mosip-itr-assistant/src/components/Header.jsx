import React from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2 } from 'lucide-react';
import './Header.css';

const Header = () => {
    const navLinks = [
        { label: "How It Works", anchor: "#how-it-works" },
        { label: "Verify Document", anchor: "#verification" },
        { label: "About", anchor: "#about" }
    ];

    const scrollToSection = (anchor) => {
        const element = document.querySelector(anchor);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <motion.header
            className="app-header"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container header-container">
                <div className="logo-section">
                    <Building2 size={32} className="logo-icon" />
                    <div className="logo-text">
                        <span>DocVerify</span>
                        <span className="logo-subtitle">Government Portal</span>
                    </div>
                </div>

                <nav className="main-nav">
                    <ul className="nav-list">
                        {navLinks.map((link) => (
                            <li key={link.anchor}>
                                <a
                                    href={link.anchor}
                                    className="nav-link"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection(link.anchor);
                                    }}
                                >
                                    {link.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <button 
                    className="verify-now-button"
                    onClick={() => scrollToSection('#verification')}
                >
                    <CheckCircle2 size={18} />
                    Verify Now
                </button>
            </div>
        </motion.header>
    );
};

export default Header;
