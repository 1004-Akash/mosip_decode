import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import OCRPage from './pages/OCRPage'
import VerificationPage from './pages/VerificationPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="container">
            <div className="nav-content">
              <Link to="/" className="logo">
                <h1>OCR & Verification Platform</h1>
              </Link>
              <div className="nav-links">
                <Link to="/" className="nav-link">OCR Extraction</Link>
                <Link to="/verify" className="nav-link">Data Verification</Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<OCRPage />} />
            <Route path="/verify" element={<VerificationPage />} />
          </Routes>
        </main>

        <footer className="footer">
          <div className="container">
            <p>Offline OCR & Data Verification Platform v1.0.0</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App


