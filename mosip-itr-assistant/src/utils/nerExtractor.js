/**
 * NER-based Field Extractor for ITR Documents
 * Extracts structured data from OCR text using pattern matching and NER techniques
 */

class NERExtractor {
    constructor() {
        // ITR-specific field patterns
        this.patterns = {
            // Personal Information
            name: [
                /name[:\s]*([A-Za-z\s]+)/i,
                /applicant[:\s]*([A-Za-z\s]+)/i,
                /full\s*name[:\s]*([A-Za-z\s]+)/i,
                /taxpayer[:\s]*([A-Za-z\s]+)/i
            ],
            
            pan: [
                /pan[:\s]*([A-Z]{5}[0-9]{4}[A-Z]{1})/i,
                /permanent\s*account\s*number[:\s]*([A-Z]{5}[0-9]{4}[A-Z]{1})/i,
                /\b([A-Z]{5}[0-9]{4}[A-Z]{1})\b/g
            ],
            
            aadhaar: [
                /aadhaar[:\s]*(\d{4}\s*\d{4}\s*\d{4})/i,
                /aadhar[:\s]*(\d{4}\s*\d{4}\s*\d{4})/i,
                /\b(\d{4}\s*\d{4}\s*\d{4})\b/g
            ],
            
            date_of_birth: [
                /date\s*of\s*birth[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
                /dob[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i,
                /birth\s*date[:\s]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/i
            ],
            
            // Financial Information
            gross_salary: [
                /gross\s*salary[:\s]*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
                /total\s*salary[:\s]*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
                /annual\s*salary[:\s]*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
                /salary[:\s]*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i
            ],
            
            tds_deducted: [
                /tds\s*deducted[:\s]*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
                /tax\s*deducted[:\s]*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
                /tds[:\s]*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i
            ],
            
            total_income: [
                /total\s*income[:\s]*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
                /gross\s*total\s*income[:\s]*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i,
                /annual\s*income[:\s]*₹?\s*(\d+(?:,\d+)*(?:\.\d{2})?)/i
            ],
            
            // Bank Information
            account_number: [
                /account\s*number[:\s]*(\d{9,18})/i,
                /bank\s*account[:\s]*(\d{9,18})/i,
                /a\/c\s*no[:\s]*(\d{9,18})/i
            ],
            
            ifsc: [
                /ifsc[:\s]*([A-Z]{4}0[A-Z0-9]{6})/i,
                /ifsc\s*code[:\s]*([A-Z]{4}0[A-Z0-9]{6})/i,
                /\b([A-Z]{4}0[A-Z0-9]{6})\b/g
            ],
            
            bank_name: [
                /bank\s*name[:\s]*([A-Za-z\s&]+)/i,
                /bank[:\s]*([A-Za-z\s&]+)/i
            ],
            
            // Employer Information
            employer: [
                /employer[:\s]*([A-Za-z\s&\.]+)/i,
                /company[:\s]*([A-Za-z\s&\.]+)/i,
                /organization[:\s]*([A-Za-z\s&\.]+)/i,
                /firm[:\s]*([A-Za-z\s&\.]+)/i
            ],
            
            // Address Information
            address: [
                /address[:\s]*([A-Za-z0-9\s,\-\.]+)/i,
                /residential\s*address[:\s]*([A-Za-z0-9\s,\-\.]+)/i,
                /permanent\s*address[:\s]*([A-Za-z0-9\s,\-\.]+)/i
            ],
            
            pincode: [
                /pin\s*code[:\s]*(\d{6})/i,
                /pincode[:\s]*(\d{6})/i,
                /postal\s*code[:\s]*(\d{6})/i,
                /\b(\d{6})\b/g
            ],
            
            // Contact Information
            mobile: [
                /mobile[:\s]*(\+?91\s*\d{10})/i,
                /phone[:\s]*(\+?91\s*\d{10})/i,
                /contact[:\s]*(\+?91\s*\d{10})/i,
                /\b(\+?91\s*\d{10})\b/g
            ],
            
            email: [
                /email[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
                /e-mail[:\s]*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i,
                /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g
            ],
            
            // Assessment Year
            assessment_year: [
                /assessment\s*year[:\s]*(\d{4}-\d{2})/i,
                /ay[:\s]*(\d{4}-\d{2})/i,
                /a\.y[:\s]*(\d{4}-\d{2})/i
            ],
            
            financial_year: [
                /financial\s*year[:\s]*(\d{4}-\d{2})/i,
                /fy[:\s]*(\d{4}-\d{2})/i,
                /f\.y[:\s]*(\d{4}-\d{2})/i
            ]
        };
        
        // Field confidence scoring
        this.confidenceWeights = {
            exact_match: 1.0,
            pattern_match: 0.8,
            context_match: 0.6,
            fuzzy_match: 0.4
        };
    }
    
    /**
     * Extract structured data from OCR text
     * @param {string} text - Raw OCR text
     * @param {string} documentType - Type of document (ITR, Form16, etc.)
     * @returns {object} Extracted structured data with confidence scores
     */
    extractFields(text, documentType = 'ITR') {
        if (!text || typeof text !== 'string') {
            return { fields: {}, confidence: 0, metadata: { error: 'Invalid input text' } };
        }
        
        const extractedFields = {};
        const confidenceScores = {};
        const metadata = {
            documentType,
            textLength: text.length,
            extractionTimestamp: new Date().toISOString(),
            patternsMatched: []
        };
        
        // Clean and normalize text
        const cleanText = this.cleanText(text);
        
        // Extract each field type
        for (const [fieldName, patterns] of Object.entries(this.patterns)) {
            const result = this.extractField(cleanText, fieldName, patterns);
            if (result.value) {
                extractedFields[fieldName] = result.value;
                confidenceScores[fieldName] = result.confidence;
                metadata.patternsMatched.push({
                    field: fieldName,
                    pattern: result.matchedPattern,
                    confidence: result.confidence
                });
            }
        }
        
        // Calculate overall confidence
        const overallConfidence = this.calculateOverallConfidence(confidenceScores);
        
        // Post-process and validate fields
        const validatedFields = this.validateAndCleanFields(extractedFields);
        
        return {
            fields: validatedFields,
            confidence: overallConfidence,
            confidenceScores,
            metadata
        };
    }
    
    /**
     * Extract a specific field using multiple patterns
     */
    extractField(text, fieldName, patterns) {
        let bestMatch = null;
        let highestConfidence = 0;
        let matchedPattern = null;
        
        for (const pattern of patterns) {
            const matches = text.match(pattern);
            if (matches) {
                const value = matches[1] || matches[0];
                const confidence = this.calculateFieldConfidence(fieldName, value, pattern);
                
                if (confidence > highestConfidence) {
                    bestMatch = value;
                    highestConfidence = confidence;
                    matchedPattern = pattern.toString();
                }
            }
        }
        
        return {
            value: bestMatch ? this.cleanFieldValue(fieldName, bestMatch) : null,
            confidence: highestConfidence,
            matchedPattern
        };
    }
    
    /**
     * Clean and normalize text for better pattern matching
     */
    cleanText(text) {
        return text
            .replace(/\s+/g, ' ')  // Normalize whitespace
            .replace(/[^\w\s@.\-\/₹,]/g, ' ')  // Remove special chars except important ones
            .trim();
    }
    
    /**
     * Clean and format field values
     */
    cleanFieldValue(fieldName, value) {
        if (!value) return null;
        
        value = value.trim();
        
        switch (fieldName) {
            case 'name':
            case 'employer':
            case 'bank_name':
                return value.replace(/\s+/g, ' ').replace(/[^\w\s&\.]/g, '');
                
            case 'pan':
                return value.toUpperCase().replace(/\s/g, '');
                
            case 'aadhaar':
                return value.replace(/\s/g, '').replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3');
                
            case 'ifsc':
                return value.toUpperCase().replace(/\s/g, '');
                
            case 'mobile':
                return value.replace(/\D/g, '').replace(/^91/, '+91 ');
                
            case 'email':
                return value.toLowerCase();
                
            case 'gross_salary':
            case 'tds_deducted':
            case 'total_income':
                return value.replace(/[₹,\s]/g, '');
                
            case 'account_number':
                return value.replace(/\D/g, '');
                
            case 'pincode':
                return value.replace(/\D/g, '');
                
            default:
                return value;
        }
    }
    
    /**
     * Calculate confidence score for a field match
     */
    calculateFieldConfidence(fieldName, value, pattern) {
        let confidence = this.confidenceWeights.pattern_match;
        
        // Boost confidence for well-formatted values
        switch (fieldName) {
            case 'pan':
                confidence = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value) ? 0.95 : 0.7;
                break;
            case 'aadhaar':
                confidence = /^\d{4}\s*\d{4}\s*\d{4}$/.test(value) ? 0.9 : 0.6;
                break;
            case 'ifsc':
                confidence = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value) ? 0.9 : 0.6;
                break;
            case 'email':
                confidence = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 0.9 : 0.5;
                break;
            case 'mobile':
                confidence = /^\+?91\s*\d{10}$/.test(value) ? 0.9 : 0.6;
                break;
            case 'pincode':
                confidence = /^\d{6}$/.test(value) ? 0.9 : 0.6;
                break;
        }
        
        return Math.min(confidence, 1.0);
    }
    
    /**
     * Calculate overall extraction confidence
     */
    calculateOverallConfidence(confidenceScores) {
        const scores = Object.values(confidenceScores);
        if (scores.length === 0) return 0;
        
        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const weightedScore = Math.min(average * (scores.length / 10), 1.0); // Boost for more fields
        
        return Math.round(weightedScore * 100) / 100;
    }
    
    /**
     * Validate and clean extracted fields
     */
    validateAndCleanFields(fields) {
        const validated = {};
        
        for (const [key, value] of Object.entries(fields)) {
            if (value && this.isValidField(key, value)) {
                validated[key] = value;
            }
        }
        
        return validated;
    }
    
    /**
     * Validate individual field values
     */
    isValidField(fieldName, value) {
        if (!value || typeof value !== 'string') return false;
        
        switch (fieldName) {
            case 'pan':
                return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value);
            case 'aadhaar':
                return /^\d{4}\s\d{4}\s\d{4}$/.test(value);
            case 'ifsc':
                return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(value);
            case 'email':
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            case 'mobile':
                return /^\+?91\s*\d{10}$/.test(value);
            case 'pincode':
                return /^\d{6}$/.test(value);
            case 'account_number':
                return /^\d{9,18}$/.test(value);
            default:
                return value.length > 0 && value.length < 200;
        }
    }
    
    /**
     * Get field mapping for different form types
     */
    getFieldMapping(formType) {
        const mappings = {
            'pre-registration': ['name', 'pan', 'date_of_birth', 'aadhaar', 'mobile', 'email', 'address', 'pincode'],
            'bank-details': ['account_number', 'ifsc', 'bank_name'],
            'form16': ['employer', 'gross_salary', 'tds_deducted', 'assessment_year', 'financial_year'],
            'income-details': ['total_income', 'gross_salary', 'tds_deducted'],
            'contact-info': ['mobile', 'email', 'address', 'pincode']
        };
        
        return mappings[formType] || Object.keys(this.patterns);
    }
}

// Export singleton instance
export default new NERExtractor();