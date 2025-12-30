import React from 'react'
import './VerificationResults.css'

const VerificationResults = ({ results, loading }) => {
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Verifying data...</p>
      </div>
    )
  }

  if (!results) {
    return null
  }

  const { verification_results, summary, ocr_metadata } = results

  const getStatusIcon = (status) => {
    switch (status) {
      case 'MATCH':
        return '✓'
      case 'PARTIAL_MATCH':
        return '⚠'
      case 'MISMATCH':
        return '✗'
      default:
        return '?'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'MATCH':
        return 'match'
      case 'PARTIAL_MATCH':
        return 'partial'
      case 'MISMATCH':
        return 'mismatch'
      default:
        return ''
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'high'
    if (confidence >= 0.6) return 'medium'
    return 'low'
  }

  return (
    <div className="verification-results">
      <div className="verification-header">
        <h2>Verification Results</h2>
      </div>

      {/* Summary Card */}
      <div className="summary-card">
        <h3>Summary</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <div className="stat-value">{summary.total_fields}</div>
            <div className="stat-label">Total Fields</div>
          </div>
          <div className="stat-item success">
            <div className="stat-value">{summary.matches}</div>
            <div className="stat-label">Matches</div>
          </div>
          <div className="stat-item warning">
            <div className="stat-value">{summary.partial_matches}</div>
            <div className="stat-label">Partial Matches</div>
          </div>
          <div className="stat-item error">
            <div className="stat-value">{summary.mismatches}</div>
            <div className="stat-label">Mismatches</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{(summary.match_rate * 100).toFixed(1)}%</div>
            <div className="stat-label">Match Rate</div>
          </div>
          <div className="stat-item">
            <div className={`stat-value confidence-${getConfidenceColor(summary.overall_confidence)}`}>
              {(summary.overall_confidence * 100).toFixed(1)}%
            </div>
            <div className="stat-label">Overall Confidence</div>
          </div>
        </div>
      </div>

      {/* Field Results */}
      <div className="fields-section">
        <h3>Field-Level Results</h3>
        <div className="fields-list">
          {Object.entries(verification_results).map(([fieldName, result]) => (
            <div
              key={fieldName}
              className={`field-result ${getStatusColor(result.match_status)}`}
            >
              <div className="field-header">
                <div className="field-name-section">
                  <span className="status-icon">{getStatusIcon(result.match_status)}</span>
                  <h4 className="field-name">{fieldName}</h4>
                  <span className={`status-badge ${getStatusColor(result.match_status)}`}>
                    {result.match_status}
                  </span>
                </div>
                <div className="field-confidence">
                  <span className="confidence-label">Confidence:</span>
                  <span className={`confidence-value ${getConfidenceColor(result.confidence)}`}>
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="field-comparison">
                <div className="comparison-item">
                  <div className="comparison-label">User Value:</div>
                  <div className="comparison-value user-value">{result.field_value}</div>
                </div>
                <div className="comparison-item">
                  <div className="comparison-label">OCR Value:</div>
                  <div className="comparison-value ocr-value">{result.ocr_value}</div>
                </div>
              </div>

              <div className="field-details">
                <div className="detail-item">
                  <strong>Similarity:</strong> {(result.similarity * 100).toFixed(1)}%
                </div>
                <div className="detail-item">
                  <strong>Exact Match:</strong> {result.exact_match ? 'Yes' : 'No'}
                </div>
                <div className="detail-item">
                  <strong>Partial Match:</strong> {result.partial_match ? 'Yes' : 'No'}
                </div>
                {result.similarity_scores && (
                  <div className="similarity-scores">
                    <strong>Similarity Scores:</strong>
                    <div className="scores-grid">
                      <span>Levenshtein: {(result.similarity_scores.levenshtein * 100).toFixed(1)}%</span>
                      <span>Fuzzy Ratio: {(result.similarity_scores.fuzzy_ratio * 100).toFixed(1)}%</span>
                      <span>Fuzzy Partial: {(result.similarity_scores.fuzzy_partial * 100).toFixed(1)}%</span>
                      <span>Fuzzy Token: {(result.similarity_scores.fuzzy_token * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* OCR Metadata */}
      {ocr_metadata && (
        <div className="ocr-metadata-section">
          <h3>OCR Metadata</h3>
          <div className="metadata-grid">
            <div className="metadata-item">
              <strong>OCR Confidence:</strong> {(ocr_metadata.ocr_confidence * 100).toFixed(1)}%
            </div>
            <div className="metadata-item">
              <strong>Text Length:</strong> {ocr_metadata.text_length} characters
            </div>
            <div className="metadata-item">
              <strong>Text Boxes:</strong> {ocr_metadata.boxes_count}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VerificationResults


