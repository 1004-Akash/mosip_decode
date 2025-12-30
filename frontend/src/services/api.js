import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 minutes for large files
})

// Health check
export const checkHealth = async () => {
  try {
    const response = await api.get('/health')
    return response.data
  } catch (error) {
    throw new Error('API server is not available')
  }
}

// OCR Extraction
export const extractOCR = async (file) => {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await api.post('/api/ocr/extract', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        // Progress can be handled via callback if needed
      },
    })
    return response.data
  } catch (error) {
    if (error.response) {
      // FastAPI uses 'detail' for errors, but we also check 'error' for compatibility
      throw new Error(error.response.data.detail || error.response.data.error || 'OCR extraction failed')
    } else if (error.request) {
      throw new Error('No response from server. Is the API running?')
    } else {
      throw new Error(error.message || 'An error occurred')
    }
  }
}

// Data Verification
export const verifyData = async (file, formData) => {
  const formDataObj = new FormData()
  formDataObj.append('file', file)
  formDataObj.append('form_data', JSON.stringify(formData))

  try {
    const response = await api.post('/api/verify/check', formDataObj, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    if (error.response) {
      // FastAPI uses 'detail' for errors, but we also check 'error' for compatibility
      throw new Error(error.response.data.detail || error.response.data.error || 'Verification failed')
    } else if (error.request) {
      throw new Error('No response from server. Is the API running?')
    } else {
      throw new Error(error.message || 'An error occurred')
    }
  }
}

export default api


