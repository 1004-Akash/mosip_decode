import React from 'react';
import SimpleQR from '../components/SimpleQR';

const QRTest = () => {
    const testData = "Test QR Code Data";
    const testImageData = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPgogIDx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE0Ij5URVNUIFFSPC90ZXh0Pgo8L3N2Zz4K";

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <h1>🎯 QR Code Animation Showcase</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem', marginTop: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <h3>📱 Animated Placeholder QR</h3>
                    <SimpleQR 
                        data={testData} 
                        size="280px" 
                        label="Injinet Credential QR" 
                    />
                </div>
                
                <div style={{ textAlign: 'center' }}>
                    <h3>✅ Ready QR Code</h3>
                    <SimpleQR 
                        data={testImageData} 
                        size="280px" 
                        label="Verified Document QR" 
                    />
                </div>
                
                <div style={{ textAlign: 'center' }}>
                    <h3>🔄 Processing QR</h3>
                    <SimpleQR 
                        data="Processing large document with enhanced OCR validation and signature verification..." 
                        size="280px" 
                        label="Enhanced OCR QR" 
                    />
                </div>
            </div>

            <div style={{ 
                marginTop: '3rem', 
                padding: '2rem', 
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                borderRadius: '16px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                textAlign: 'center'
            }}>
                <h2>🎨 Animation Features</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    <div>⚡ Rotating QR Icons</div>
                    <div>📱 Scanning Line Effect</div>
                    <div>💫 Pulse Ring Animation</div>
                    <div>🌈 Gradient Borders</div>
                    <div>✨ Status Indicators</div>
                    <div>🔄 Smooth Transitions</div>
                </div>
            </div>
        </div>
    );
};

export default QRTest;