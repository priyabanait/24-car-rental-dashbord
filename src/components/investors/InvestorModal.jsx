import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, FileText, Upload, CreditCard } from 'lucide-react';
import { Modal } from '../ui/Modal';
import toast from 'react-hot-toast';

export default function InvestorModal({ isOpen, onClose, onSuccess, investor }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    investorName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    
    // Identity Documents
    aadharNumber: '',
    panNumber: '',
    
    // Bank Details
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    accountBranchName: '',
    
    // Documents
    profilePhoto: null,
    aadharDocument: null,
    aadharDocumentBack: null,
    panDocument: null,
    bankDocument: null
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [documentPreviews, setDocumentPreviews] = useState({});

  const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Documents', icon: FileText },
    { id: 3, title: 'Banking', icon: CreditCard }
  ];

  // Populate form when editing
  useEffect(() => {
    if (investor) {
      setFormData({
        investorName: investor.investorName || '',
        email: investor.email || '',
        phone: investor.phone || '',
        address: investor.address || '',
        city: investor.city || '',
        state: investor.state || '',
        pincode: investor.pincode || '',
        aadharNumber: investor.aadharNumber || '',
        panNumber: investor.panNumber || '',
        bankName: investor.bankName || '',
        accountNumber: investor.accountNumber || '',
        ifscCode: investor.ifscCode || '',
        accountHolderName: investor.accountHolderName || '',
        accountBranchName: investor.accountBranchName || '',
        profilePhoto: investor.profilePhoto || null,
        aadharDocument: investor.aadharDocument || null,
        aadharDocumentBack: investor.aadharDocumentBack || null,
        panDocument: investor.panDocument || null,
        bankDocument: investor.bankDocument || null
      });
      
      // Set document previews
      const previews = {};
      ['profilePhoto', 'aadharDocument', 'aadharDocumentBack', 'panDocument', 'bankDocument'].forEach(key => {
        if (investor[key]) {
          previews[key] = investor[key];
        }
      });
      setDocumentPreviews(previews);
      setCurrentStep(1);
    } else {
      setFormData({
        investorName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        aadharNumber: '',
        panNumber: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        accountBranchName: '',
        profilePhoto: null,
        aadharDocument: null,
        aadharDocumentBack: null,
        panDocument: null,
        bankDocument: null
      });
      setCurrentStep(1);
      setDocumentPreviews({});
    }
    setErrors({});
  }, [investor, isOpen]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = (field, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target.result;
        setFormData(prev => ({ ...prev, [field]: base64String }));
        setDocumentPreviews(prev => ({ ...prev, [field]: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateField = (field, value) => {
    if (field === 'investorName') {
      if (!value || !value.trim()) return 'Name is required';
      if (!/^[a-zA-Z\s]{2,50}$/.test(value.trim())) return 'Name should only contain letters (2-50 characters)';
      return '';
    }
    if (field === 'email') {
      // Email is optional, but if provided, must be valid
      if (value && value.trim() && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
        return 'Enter a valid email address';
      }
      return '';
    }
    if (field === 'phone') {
      if (!value || !value.trim()) return 'Phone is required';
      const digits = String(value).replace(/\D/g, '');
      if (digits.length !== 10) return 'Phone number must be 10 digits';
      if (!/^[6789]\d{9}$/.test(digits)) return 'Enter a valid Indian mobile number';
      return '';
    }
    if (field === 'address') {
      if (!value || !value.trim()) return 'Address is required';
      if (value.trim().length < 10) return 'Enter complete address (min 10 characters)';
      return '';
    }
    if (field === 'aadharNumber') {
      if (!value || !value.trim()) return 'Aadhar number is required';
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 12) return 'Aadhar must be 12 digits';
      return '';
    }
    if (field === 'panNumber') {
      if (!value || !value.trim()) return 'PAN number is required';
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(value.toUpperCase())) return 'Enter valid PAN (e.g., ABCDE1234F)';
      return '';
    }
    if (field === 'bankName') {
      if (!value || !value.trim()) return 'Bank name is required';
      return '';
    }
    if (field === 'accountNumber') {
      if (!value || !value.trim()) return 'Account number is required';
      const digits = value.replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 18) return 'Account number should be 9-18 digits';
      return '';
    }
    if (field === 'ifscCode') {
      if (!value || !value.trim()) return 'IFSC code is required';
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(value.toUpperCase())) return 'Enter valid IFSC (e.g., SBIN0123456)';
      return '';
    }
    if (field === 'accountHolderName') {
      if (!value || !value.trim()) return 'Account holder name is required';
      return '';
    }
    if (field === 'accountBranchName') {
      if (!value || !value.trim()) return 'Branch name is required';
      return '';
    }
    return '';
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 1: // Personal Information
        ['investorName', 'phone', 'address'].forEach(f => {
          const err = validateField(f, formData[f]);
          if (err) newErrors[f] = err;
        });
        // Validate email only if provided
        if (formData.email) {
          const emailErr = validateField('email', formData.email);
          if (emailErr) newErrors.email = emailErr;
        }
        break;
      
      case 2: // Documents
        ['aadharNumber', 'panNumber'].forEach(f => {
          const err = validateField(f, formData[f]);
          if (err) newErrors[f] = err;
        });
        break;
      
      case 3: // Banking
        ['bankName', 'accountNumber', 'ifscCode', 'accountHolderName', 'accountBranchName'].forEach(f => {
          const err = validateField(f, formData[f]);
          if (err) newErrors[f] = err;
        });
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      toast.error('Please fix the errors before continuing');
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validate all steps
    for (let step = 1; step <= 3; step++) {
      const ok = validateStep(step);
      if (!ok) {
        setCurrentStep(step);
        toast.error('Please complete all required fields');
        return;
      }
    }

    try {
      setLoading(true);

      const investorData = {
        investorName: formData.investorName,
        email: formData.email || '',
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pincode: formData.pincode,
        aadharNumber: formData.aadharNumber,
        panNumber: formData.panNumber,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber,
        ifscCode: formData.ifscCode,
        accountHolderName: formData.accountHolderName,
        accountBranchName: formData.accountBranchName,
        profilePhoto: formData.profilePhoto || investor?.profilePhoto,
        aadharDocument: formData.aadharDocument || investor?.aadharDocument,
        aadharDocumentBack: formData.aadharDocumentBack || investor?.aadharDocumentBack,
        panDocument: formData.panDocument || investor?.panDocument,
        bankDocument: formData.bankDocument || investor?.bankDocument
      };

      console.log('Submitting investor data:', { ...investorData, profilePhoto: investorData.profilePhoto ? 'base64...' : null });

      // Pass data to parent which will handle the API call
      await onSuccess(investorData);
      handleClose();
    } catch (error) {
      console.error('Error saving investor:', error);
      toast.error(investor ? 'Failed to update investor. Please try again.' : 'Failed to add investor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      investorName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      aadharNumber: '',
      panNumber: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      accountBranchName: '',
      profilePhoto: null,
      aadharDocument: null,
      aadharDocumentBack: null,
      panDocument: null,
      bankDocument: null
    });
    setCurrentStep(1);
    setErrors({});
    setDocumentPreviews({});
    onClose();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.investorName}
                  onChange={(e) => handleChange('investorName', e.target.value)}
                  className={`input w-full ${errors.investorName ? 'border-red-300' : ''}`}
                  placeholder="Enter full name"
                />
                {errors.investorName && <p className="mt-1 text-sm text-red-600">{errors.investorName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`input w-full ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="investor@example.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`input w-full ${errors.phone ? 'border-red-300' : ''}`}
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={`input w-full ${errors.address ? 'border-red-300' : ''}`}
                  rows={3}
                  placeholder="Enter complete address"
                />
                {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="input w-full"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="input w-full"
                >
                  <option value="">Select State</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className="input w-full"
                  placeholder="Enter pincode"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Identity Documents</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aadhar Number *
                </label>
                <input
                  type="text"
                  value={formData.aadharNumber}
                  onChange={(e) => handleChange('aadharNumber', e.target.value)}
                  className={`input w-full ${errors.aadharNumber ? 'border-red-300' : ''}`}
                  placeholder="1234 5678 9012"
                />
                {errors.aadharNumber && <p className="mt-1 text-sm text-red-600">{errors.aadharNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PAN Number *
                </label>
                <input
                  type="text"
                  value={formData.panNumber}
                  onChange={(e) => handleChange('panNumber', e.target.value)}
                  className={`input w-full ${errors.panNumber ? 'border-red-300' : ''}`}
                  placeholder="ABCDE1234F"
                />
                {errors.panNumber && <p className="mt-1 text-sm text-red-600">{errors.panNumber}</p>}
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <h4 className="text-md font-medium text-gray-900">Upload Documents</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { key: 'profilePhoto', label: 'Profile Photo' },
                  { key: 'aadharDocument', label: 'Aadhar Front Side' },
                  { key: 'aadharDocumentBack', label: 'Aadhar Back Side' },
                  { key: 'panDocument', label: 'PAN Card' },
                  { key: 'bankDocument', label: 'Bank Document' }
                ].map(({ key, label }) => (
                  <div key={key} className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <div className="text-center">
                      {documentPreviews[key] ? (
                        <img 
                          src={documentPreviews[key].startsWith('data:') ? documentPreviews[key] : documentPreviews[key] + '?t=' + new Date().getTime()} 
                          alt={label} 
                          className="mx-auto h-20 w-20 object-cover rounded" 
                        />
                      ) : (
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      )}
                      <div className="mt-2">
                        <label className="cursor-pointer">
                          <span className="text-sm font-medium text-primary-600 hover:text-primary-500">
                            Upload {label}
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload(key, e.target.files[0])}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Banking Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => handleChange('bankName', e.target.value)}
                  className={`input w-full ${errors.bankName ? 'border-red-300' : ''}`}
                  placeholder="State Bank of India"
                />
                {errors.bankName && <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch Name *
                </label>
                <input
                  type="text"
                  value={formData.accountBranchName}
                  onChange={(e) => handleChange('accountBranchName', e.target.value)}
                  className={`input w-full ${errors.accountBranchName ? 'border-red-300' : ''}`}
                  placeholder="Enter branch name"
                />
                {errors.accountBranchName && <p className="mt-1 text-sm text-red-600">{errors.accountBranchName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => handleChange('accountNumber', e.target.value)}
                  className={`input w-full ${errors.accountNumber ? 'border-red-300' : ''}`}
                  placeholder="1234567890123456"
                />
                {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  value={formData.ifscCode}
                  onChange={(e) => handleChange('ifscCode', e.target.value)}
                  className={`input w-full ${errors.ifscCode ? 'border-red-300' : ''}`}
                  placeholder="SBIN0001234"
                />
                {errors.ifscCode && <p className="mt-1 text-sm text-red-600">{errors.ifscCode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Holder Name *
                </label>
                <input
                  type="text"
                  value={formData.accountHolderName}
                  onChange={(e) => handleChange('accountHolderName', e.target.value)}
                  className={`input w-full ${errors.accountHolderName ? 'border-red-300' : ''}`}
                  placeholder="Account holder name"
                />
                {errors.accountHolderName && <p className="mt-1 text-sm text-red-600">{errors.accountHolderName}</p>}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {investor ? 'Edit Investor' : 'Add New Investor'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Step {currentStep} of {steps.length}: {steps.find(s => s.id === currentStep)?.title}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      isActive 
                        ? 'border-primary-600 bg-primary-600 text-white' 
                        : isCompleted 
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`ml-4 w-8 h-0.5 ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            {renderStepContent()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="btn btn-secondary"
                  disabled={loading}
                >
                  Previous
                </button>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {investor ? 'Updating...' : 'Adding...'}
                    </div>
                  ) : (
                    investor ? 'Update Investor' : 'Add Investor'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
