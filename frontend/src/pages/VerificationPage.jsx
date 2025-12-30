import React, { useState } from 'react'
import FileUpload from '../components/FileUpload'
import VerificationResults from '../components/VerificationResults'
import { verifyData } from '../services/api'
import './VerificationPage.css'

const VerificationPage = () => {
  const [selectedFile, setSelectedFile] = useState(null)
  const [formFields, setFormFields] = useState([
    { name: 'name', value: '', label: 'Name' },
    { name: 'email', value: '', label: 'Email' },
    { name: 'phone', value: '', label: 'Phone' },
    { name: 'address', value: '', label: 'Address' },
  ])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileSelect = (file) => {
    setSelectedFile(file)
    setResults(null)
    setError(null)
  }

  const handleFieldChange = (index, value) => {
    const updated = [...formFields]
    updated[index].value = value
    setFormFields(updated)
  }

  const addField = () => {
    setFormFields([...formFields, { name: '', value: '', label: '' }])
  }

  const removeField = (index) => {
    if (formFields.length > 1) {
      setFormFields(formFields.filter((_, i) => i !== index))
    }
  }

  const handleVerify = async () => {
    if (!selectedFile) {
      setError('Please select a document file first')
      return
    }

    // Build form data object
    const formData = {}
    formFields.forEach((field) => {
      if (field.name && field.value) {
        const fieldName = field.name.trim() || field.label.trim().toLowerCase().replace(/\s+/g, '_')
        formData[fieldName] = field.value.trim()
      }
    })

    if (Object.keys(formData).length === 0) {
      setError('Please fill in at least one field')
      return
    }

    setLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await verifyData(selectedFile, formData)
      setResults(response.data)
    } catch (err) {
      setError(err.message || 'Failed to verify data')
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
    <div className="verification-page">
      <div className="container">
        <div className="page-header">
          <h1>Data Verification</h1>
          <p>Upload a document and enter form data to verify against the original document</p>
        </div>

        <div className="card">
          <div className="upload-section">
            <h2>1. Select Document</h2>
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

          <div className="form-section">
            <div className="form-header">
              <h2>2. Enter Form Data</h2>
              <button className="btn btn-secondary btn-small" onClick={addField}>
                + Add Field
              </button>
            </div>
            <div className="form-fields">
              {formFields.map((field, index) => (
                <div key={index} className="form-field">
                  <div className="field-input-group">
                    <input
                      type="text"
                      placeholder="Field name (e.g., name, email)"
                      value={field.name}
                      onChange={(e) => {
                        const updated = [...formFields]
                        updated[index].name = e.target.value
                        setFormFields(updated)
                      }}
                      className="field-name-input"
                    />
                    <input
                      type="text"
                      placeholder="Field value"
                      value={field.value}
                      onChange={(e) => handleFieldChange(index, e.target.value)}
                      className="field-value-input"
                    />
                    {formFields.length > 1 && (
                      <button
                        className="btn-remove"
                        onClick={() => removeField(index)}
                        title="Remove field"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedFile && (
            <div className="action-section">
              <button
                className="btn btn-primary"
                onClick={handleVerify}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-small"></div>
                    Verifying...
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    Verify Data
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
          <VerificationResults results={results} loading={loading} />
        )}
      </div>
    </div>
  )
}

export default VerificationPage


