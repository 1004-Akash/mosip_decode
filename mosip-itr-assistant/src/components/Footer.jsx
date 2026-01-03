import React from 'react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="container footer-container">
                <p className="copyright">©  DocVerify. All rights reserved.</p>
                <div className="footer-links">
                    <a href="#" className="footer-link">Privacy Policy</a>
                    <a href="#" className="footer-link">Terms of Use</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
