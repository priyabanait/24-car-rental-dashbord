import { useState } from 'react';
import { X, CreditCard, Wallet, CheckCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import toast from 'react-hot-toast';

export default function PaymentConfirmationModal({ isOpen, onClose, fdData, onPaymentComplete, labels }) {
  const [selectedPaymentMode, setSelectedPaymentMode] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [manualAmount, setManualAmount] = useState('');
  const [paymentType, setPaymentType] = useState('rent'); // 'rent' or 'security'

  const handlePayment = async () => {
    if (!selectedPaymentMode) {
      toast.error('Please select a payment mode');
      return;
    }

    // Validate manual amount if provided
    if (labels?.isDriver && manualAmount) {
      const amount = parseFloat(manualAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
    }

    console.log('PaymentConfirmationModal: Sending payment mode:', selectedPaymentMode);
    console.log('PaymentConfirmationModal: FD Data:', fdData);
    console.log('PaymentConfirmationModal: Manual Amount:', manualAmount);
    console.log('PaymentConfirmationModal: Payment Type:', paymentType);

    setIsProcessing(true);
    try {
      // Call parent callback with payment mode, manual amount, and payment type
      await onPaymentComplete(selectedPaymentMode, manualAmount ? parseFloat(manualAmount) : null, paymentType);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setSelectedPaymentMode(null);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Complete Payment
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose your payment method
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Summary */}
        {fdData && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{labels?.nameLabel || 'Investor Name'}:</span>
                <span className="font-semibold text-gray-900">{fdData.investorName}</span>
              </div>
              
              {/* Show calculated amount only for reference */}
              {labels?.isDriver ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Calculated Rent Due:</span>
                    <span className="font-semibold text-gray-600 line-through">
                      ₹{Number(fdData.investmentAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  
                  {/* Payment Type Selection */}
                  <div className="pt-2 border-t border-blue-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment For
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentType('rent')}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all text-sm font-semibold ${
                          paymentType === 'rent'
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                        }`}
                      >
                        Rent Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentType('security')}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all text-sm font-semibold ${
                          paymentType === 'security'
                            ? 'bg-green-500 text-white border-green-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
                        }`}
                      >
                        Security Deposit
                      </button>
                    </div>
                  </div>

                  {/* Manual amount input for driver */}
                  <div className="pt-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount to Pay (Enter manually)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                      <input
                        type="number"
                        value={manualAmount}
                        onChange={(e) => setManualAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-8 pr-4 py-2.5 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Paying for: <span className="font-semibold">{paymentType === 'rent' ? 'Daily/Weekly Rent' : 'Security Deposit'}</span>
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{labels?.amountLabel || 'Investment Amount'}:</span>
                  <span className="font-bold text-blue-600 text-lg">
                    ₹{Number(fdData.investmentAmount || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
              
              {typeof fdData.investmentRate !== 'undefined' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-semibold text-gray-900">{fdData.investmentRate}% p.a.</span>
                </div>
              )}
              {(fdData.termMonths || fdData.termYears) && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Term:</span>
                  <span className="font-semibold text-gray-900">
                    {fdData.fdType === 'monthly' && fdData.termMonths
                      ? `${fdData.termMonths} months`
                      : fdData.termYears
                      ? `${fdData.termYears} years`
                      : 'N/A'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Options */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Select Payment Method</h3>
          
          <div className="space-y-3">
            {/* Online Payment */}
            <button
              onClick={() => setSelectedPaymentMode('online')}
              disabled={isProcessing}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedPaymentMode === 'online'
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selectedPaymentMode === 'online' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <CreditCard className={`h-6 w-6 ${
                      selectedPaymentMode === 'online' ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Online Payment</p>
                    <p className="text-xs text-gray-500">UPI, Net Banking, Cards</p>
                  </div>
                </div>
                {selectedPaymentMode === 'online' && (
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                )}
              </div>
            </button>

            {/* Cash Payment */}
            <button
              onClick={() => setSelectedPaymentMode('cash')}
              disabled={isProcessing}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                selectedPaymentMode === 'cash'
                  ? 'border-green-500 bg-green-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    selectedPaymentMode === 'cash' ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Wallet className={`h-6 w-6 ${
                      selectedPaymentMode === 'cash' ? 'text-green-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">Cash Payment</p>
                    <p className="text-xs text-gray-500">Pay at office counter</p>
                  </div>
                </div>
                {selectedPaymentMode === 'cash' && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isProcessing}
            className="btn btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          
          <button
            onClick={handlePayment}
            disabled={!selectedPaymentMode || isProcessing}
            className={`px-6 py-2.5 rounded-lg font-semibold text-white transition-all ${
              !selectedPaymentMode || isProcessing
                ? 'bg-gray-400 cursor-not-allowed'
                : selectedPaymentMode === 'online'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isProcessing ? 'Processing...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
