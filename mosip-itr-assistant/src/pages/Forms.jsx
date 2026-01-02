import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Save, ArrowRight, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import nerExtractor from '../utils/nerExtractor';
import './Forms.css';

const FormsPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('pre-reg');
    const [isLoading, setIsLoading] = useState(true);
    const [nerResults, setNerResults] = useState(null);

    // Get extracted data from backend
    const extractedData = location.state?.extractedData?.extracted_data?.structured_data || {};
    const rawText = location.state?.extractedData?.extracted_data?.raw_text || '';
    const fieldConfidenceScores = location.state?.extractedData?.extracted_data?.field_confidence_scores || {};
    const processingDetails = location.state?.processingDetails;

    // Enhanced form data with NER extraction
    const [formData, setFormData] = useState({
        // Personal Information
        name: extractedData.name || '',
        pan: extractedData.pan || '',
        aadhaar: extractedData.aadhaar || '',
        date_of_birth: extractedData.date_of_birth || '',
        
        // Financial Information
        gross_salary: extractedData.gross_salary || '',
        tds_deducted: extractedData.tds_deducted || '',
        total_income: extractedData.total_income || '',
        
        // Bank Information
        account_number: extractedData.account_number || '',
        ifsc: extractedData.ifsc || '',
        bank_name: extractedData.bank_name || '',
        
        // Employer Information
        employer: extractedData.employer || '',
        tan: extractedData.tan || '',
        
        // Contact Information
        mobile: extractedData.mobile || '',
        email: extractedData.email || '',
        address: extractedData.address || '',
        pincode: extractedData.pincode || '',
        
        // Assessment Information
        assessment_year: extractedData.assessment_year || '',
        financial_year: extractedData.financial_year || ''
    });

    const tabs = [
        { id: 'pre-reg', label: 'Pre-Registration', icon: CheckCircle },
        { id: 'bank', label: 'Bank Details', icon: CheckCircle },
        { id: 'form16', label: 'Form 16', icon: CheckCircle },
        { id: 'income', label: 'Income Details', icon: CheckCircle }
    ];

    useEffect(() => {
        // Process raw text with client-side NER if no structured data from backend
        if (rawText && Object.keys(extractedData).length === 0) {
            setIsLoading(true);
            const clientNerResults = nerExtractor.extractFields(rawText, 'ITR');
            setNerResults(clientNerResults);
            
            // Update form data with client-side NER results
            setFormData(prev => ({
                ...prev,
                ...clientNerResults.fields
            }));
        }
        setIsLoading(false);
    }, [rawText, extractedData]);

    const getFieldConfidence = (fieldName) => {
        return fieldConfidenceScores[fieldName] || nerResults?.confidenceScores?.[fieldName] || 0;
    };

    const getConfidenceColor = (confidence) => {
        if (confidence >= 0.8) return '#10b981'; // Green
        if (confidence >= 0.6) return '#f59e0b'; // Yellow
        return '#ef4444'; // Red
    };

    const getConfidenceIcon = (confidence) => {
        if (confidence >= 0.8) return CheckCircle;
        if (confidence >= 0.6) return AlertCircle;
        return AlertCircle;
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const renderFieldWithConfidence = (field, label, type = 'text', readOnly = false) => {
        const confidence = getFieldConfidence(field);
        const ConfidenceIcon = getConfidenceIcon(confidence);
        
        return (
            <div key={field} className="field-with-confidence">
                <Input
                    label={label}
                    value={formData[field]}
                    type={type}
                    readOnly={readOnly}
                    onChange={(e) => handleInputChange(field, e.target.value)}
                    className={confidence >= 0.8 ? 'high-confidence' : confidence >= 0.6 ? 'medium-confidence' : 'low-confidence'}
                />
                {confidence > 0 && (
                    <div className="confidence-indicator" style={{ color: getConfidenceColor(confidence) }}>
                        <ConfidenceIcon size={16} />
                        <span>{Math.round(confidence * 100)}%</span>
                    </div>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="container page-wrapper">
                <div className="loading-container">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                        <Zap size={40} />
                    </motion.div>
                    <p>Processing extracted data with NER...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container page-wrapper">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="forms-header">
                    <h2>🤖 AI Auto-Filled Forms</h2>
                    <p>Review and edit the data extracted using advanced NER techniques.</p>
                    
                    {/* Extraction Summary */}
                    <motion.div
                        className="extraction-summary"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="summary-stats">
                            <div className="stat">
                                <span className="stat-value">{Object.keys(formData).filter(key => formData[key]).length}</span>
                                <span className="stat-label">Fields Extracted</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">
                                    {Math.round((nerResults?.confidence || 
                                        (Object.keys(fieldConfidenceScores).length > 0 ? 
                                            Object.values(fieldConfidenceScores).reduce((a, b) => a + b, 0) / Object.values(fieldConfidenceScores).length : 
                                            0.85)) * 100)}%
                                </span>
                                <span className="stat-label">Avg Confidence</span>
                            </div>
                            <div className="stat">
                                <span className="stat-value">{processingDetails?.engines_used?.length || 3}</span>
                                <span className="stat-label">OCR Engines</span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="tabs-container">
                    <div className="tabs-header">
                        {tabs.map((tab) => {
                            const fieldsForTab = getFieldsForTab(tab.id);
                            const filledFields = fieldsForTab.filter(field => formData[field]);
                            const TabIcon = tab.icon;
                            
                            return (
                                <button
                                    key={tab.id}
                                    className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <TabIcon size={16} />
                                    {tab.label}
                                    <span className="field-count">
                                        {filledFields.length}/{fieldsForTab.length}
                                    </span>
                                    {activeTab === tab.id && (
                                        <motion.div className="tab-indicator" layoutId="tabIndicator" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <motion.div
                        className="tab-content"
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Card>
                            {activeTab === 'pre-reg' && (
                                <div className="form-grid">
                                    {renderFieldWithConfidence('name', 'Full Name')}
                                    {renderFieldWithConfidence('pan', 'PAN Number')}
                                    {renderFieldWithConfidence('aadhaar', 'Aadhaar Number')}
                                    {renderFieldWithConfidence('date_of_birth', 'Date of Birth', 'date')}
                                    {renderFieldWithConfidence('mobile', 'Mobile Number', 'tel')}
                                    {renderFieldWithConfidence('email', 'Email Address', 'email')}
                                </div>
                            )}
                            
                            {activeTab === 'bank' && (
                                <div className="form-grid">
                                    {renderFieldWithConfidence('account_number', 'Account Number')}
                                    {renderFieldWithConfidence('ifsc', 'IFSC Code')}
                                    {renderFieldWithConfidence('bank_name', 'Bank Name')}
                                    {renderFieldWithConfidence('address', 'Address')}
                                    {renderFieldWithConfidence('pincode', 'PIN Code')}
                                </div>
                            )}
                            
                            {activeTab === 'form16' && (
                                <div className="form-grid">
                                    {renderFieldWithConfidence('employer', 'Employer Name')}
                                    {renderFieldWithConfidence('tan', 'TAN Number')}
                                    {renderFieldWithConfidence('assessment_year', 'Assessment Year')}
                                    {renderFieldWithConfidence('financial_year', 'Financial Year')}
                                    {renderFieldWithConfidence('gross_salary', 'Gross Salary', 'number')}
                                    {renderFieldWithConfidence('tds_deducted', 'TDS Deducted', 'number')}
                                </div>
                            )}
                            
                            {activeTab === 'income' && (
                                <div className="form-grid">
                                    {renderFieldWithConfidence('total_income', 'Total Income', 'number')}
                                    {renderFieldWithConfidence('gross_salary', 'Gross Salary', 'number')}
                                    {renderFieldWithConfidence('tds_deducted', 'TDS Deducted', 'number')}
                                    <div className="income-summary">
                                        <h4>Income Summary</h4>
                                        <div className="summary-row">
                                            <span>Gross Income:</span>
                                            <span>₹{formData.gross_salary ? parseInt(formData.gross_salary).toLocaleString() : '0'}</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>TDS Deducted:</span>
                                            <span>₹{formData.tds_deducted ? parseInt(formData.tds_deducted).toLocaleString() : '0'}</span>
                                        </div>
                                        <div className="summary-row total">
                                            <span>Net Income:</span>
                                            <span>₹{formData.gross_salary && formData.tds_deducted ? 
                                                (parseInt(formData.gross_salary) - parseInt(formData.tds_deducted)).toLocaleString() : '0'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-actions">
                                <Button variant="secondary" icon={Save}>Save Draft</Button>
                                <Button 
                                    variant="outline" 
                                    onClick={() => {
                                        // Re-run NER extraction
                                        if (rawText) {
                                            const newResults = nerExtractor.extractFields(rawText, 'ITR');
                                            setNerResults(newResults);
                                            setFormData(prev => ({
                                                ...prev,
                                                ...newResults.fields
                                            }));
                                        }
                                    }}
                                >
                                    <Zap size={16} />
                                    Re-extract Fields
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                <div className="page-actions-right">
                    <Button
                        variant="primary"
                        size="large"
                        onClick={() => navigate('/validation', {
                            state: {
                                extractedData: {
                                    extracted_data: {
                                        structured_data: formData,
                                        raw_text: rawText
                                    }
                                },
                                processingDetails,
                                usedEnhancedOCR: true
                            }
                        })}
                        icon={ArrowRight}
                    >
                        Proceed to Validation
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

// Helper function to get fields for each tab
const getFieldsForTab = (tabId) => {
    const fieldMappings = {
        'pre-reg': ['name', 'pan', 'aadhaar', 'date_of_birth', 'mobile', 'email'],
        'bank': ['account_number', 'ifsc', 'bank_name', 'address', 'pincode'],
        'form16': ['employer', 'tan', 'assessment_year', 'financial_year', 'gross_salary', 'tds_deducted'],
        'income': ['total_income', 'gross_salary', 'tds_deducted']
    };
    
    return fieldMappings[tabId] || [];
};

export default FormsPage;
