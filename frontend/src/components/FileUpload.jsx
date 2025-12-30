import React, { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import './FileUpload.css'

const FileUpload = ({ onFileSelect, acceptedTypes, maxSizeMB = 50 }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) {
      onFileSelect(acceptedFiles[0])
    }
  }, [onFileSelect])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections,
  } = useDropzone({
    onDrop,
    accept: acceptedTypes || {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.tiff', '.bmp'],
    },
    maxSize: maxSizeMB * 1024 * 1024,
    multiple: false,
  })

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="file-upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'active' : ''} ${
          isDragReject ? 'reject' : ''
        }`}
      >
        <input {...getInputProps()} />
        <div className="dropzone-content">
          {isDragActive ? (
            <p className="dropzone-text">Drop the file here...</p>
          ) : (
            <>
              <svg
                className="upload-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="dropzone-text">
                Drag & drop a file here, or click to select
              </p>
              <p className="dropzone-hint">
                Supported: PDF, PNG, JPG, JPEG, TIFF, BMP (Max {maxSizeMB}MB)
              </p>
            </>
          )}
        </div>
      </div>

      {fileRejections.length > 0 && (
        <div className="file-error">
          {fileRejections.map(({ file, errors }) => (
            <div key={file.name}>
              <strong>{file.name}</strong>
              <ul>
                {errors.map((e) => (
                  <li key={e.code}>
                    {e.code === 'file-too-large'
                      ? `File is larger than ${maxSizeMB}MB`
                      : e.code === 'file-invalid-type'
                      ? 'File type not supported'
                      : e.message}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileUpload


