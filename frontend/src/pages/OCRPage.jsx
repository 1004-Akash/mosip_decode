import React, { useState } from 'react'
import FileUpload from '../components/FileUpload'
import OCRResults from '../components/OCRResults'
import { extractOCR } from '../services/api'
import './OCRPage.css'

const OCRPage = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setResults(null)
    setError(null)
  }

  const handleExtract = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await extractOCR(selectedFile)
      setResults(response)
    } catch (err) {
      setError(err.message || 'Failed to extract text from document')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setResults(null)
    setError(null)
  }

  return (
    <div className="ocr-page">
      <div className="container">
        <div className="page-header">
          <h1>OCR Text Extraction</h1>
          <p>Upload a document (PDF or image) to extract text using our multi-engine OCR system</p>
        </div>

        <div className="card">
          <div className="upload-section">
            <h2>Select Document</h2>
            {!selectedFile ? (
              <FileUpload onFileSelect={handleFileSelect} />
            ) : (
              <div className="selected-file">
                <div className="file-info">
                  <svg
                    className="file-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="file-details">
                    <div className="file-name">{selectedFile.name}</div>
                    <div className="file-size">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </div>
                  </div>
                </div>
                <button className="btn btn-secondary" onClick={handleReset}>
                  Change File
                </button>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="action-section">
              <button
                className="btn btn-primary"
                onClick={handleExtract}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Extract Text
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {results && (
          <OCRResults results={results} loading={loading} />
        )}
      </div>
    </div>
  )
}

export default OCRPage


