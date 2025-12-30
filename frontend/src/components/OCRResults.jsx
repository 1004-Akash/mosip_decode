import React from 'react'
import './OCRResults.css'

const OCRResults = ({ results, loading }) => {
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Processing document...</p>
      </div>
    )
  }

  if (!results) {
    return null
  }

  const { data, metadata } = results

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'high'
    if (confidence >= 0.6) return 'medium'
    return 'low'
  }

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.9) return 'Very High'
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  return (
    <div className="ocr-results">
      <div className="results-header">
        <h2>OCR Extraction Results</h2>
        <div className="results-meta">
          <span className="meta-item">
            <strong>Pages:</strong> {data.page_count || 1}
          </span>
          <span className="meta-item">
            <strong>Language:</strong> {data.detected_language || 'Unknown'}
          </span>
          <span className="meta-item">
            <strong>Engines:</strong> {data.engines_used?.join(', ') || 'N/A'}
          </span>
        </div>
      </div>

      <div className="confidence-badge">
        <span className="confidence-label">Confidence:</span>
        <span className={`confidence-value ${getConfidenceColor(data.confidence)}`}>
          {(data.confidence * 100).toFixed(1)}% ({getConfidenceLabel(data.confidence)})
        </span>
      </div>

      <div className="extracted-text-section">
        <h3>Extracted Text</h3>
        <div className="text-container">
          <pre className="extracted-text">{data.text || 'No text extracted'}</pre>
        </div>
        <div className="text-stats">
          <span>Characters: {data.text?.length || 0}</span>
          <span>Text Boxes: {data.boxes?.length || 0}</span>
        </div>
      </div>

      {data.boxes && data.boxes.length > 0 && (
        <div className="boxes-section">
          <h3>Text Boxes ({data.boxes.length})</h3>
          <div className="boxes-grid">
            {data.boxes.slice(0, 20).map((box, index) => (
              <div key={index} className="box-item">
                <div className="box-header">
                  <span className="box-text">{box.text}</span>
                  <span className={`box-confidence ${getConfidenceColor(box.confidence)}`}>
                    {(box.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="box-details">
                  <span>Page {box.page_num || 1}</span>
                  <span>BBox: [{box.bbox?.join(', ') || 'N/A'}]</span>
                </div>
              </div>
            ))}
          </div>
          {data.boxes.length > 20 && (
            <p className="boxes-more">
              ... and {data.boxes.length - 20} more boxes
            </p>
          )}
        </div>
      )}

      {metadata && (
        <div className="metadata-section">
          <h3>File Metadata</h3>
          <div className="metadata-grid">
            <div className="metadata-item">
              <strong>Filename:</strong> {metadata.filename}
            </div>
            <div className="metadata-item">
              <strong>File Size:</strong> {(metadata.file_size / 1024 / 1024).toFixed(2)} MB
            </div>
            <div className="metadata-item">
              <strong>Total Boxes:</strong> {metadata.total_boxes}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OCRResults


