import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import './Header.css';

const Header = () => {
    const navLinks = [
        { label: "Home", route: "/" },
        { label: "Upload Documents", route: "/upload" },
        { label: "Forms", route: "/forms" },
        { label: "Validation", route: "/validation" },
        { label: "Wallet", route: "/wallet" },
        { label: "ITR Filing", route: "/itr" }
    ];

    return (
        <motion.header
            className="app-header"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="container header-container">
                <div className="logo-section">
                    <ShieldCheck size={32} className="logo-icon" />
                    <div className="logo-text">
                        <span>Government of India</span>
                        <span className="logo-subtitle">ITR Filing Portal</span>
                    </div>
                </div>

                <nav className="main-nav">
                    <ul className="nav-list">
                        {navLinks.map((link) => (
                            <li key={link.route}>
                                <NavLink
                                    to={link.route}
                                    className={({ isActive }) =>
                                        `nav-link ${isActive ? 'active' : ''}`
                                    }
                                >
                                    {link.label}
                                    <motion.div className="nav-indicator" layoutId="navIndicator" />
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </motion.header>
    );
};

export default Header;
