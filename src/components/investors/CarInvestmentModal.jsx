import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://udrive-backend-1igb.vercel.app';

export default function CarInvestmentModal({ isOpen, onClose, onSuccess, carInvestment }) {
  const [form, setForm] = useState({
    name: carInvestment?.name || '',
    minAmount: carInvestment?.minAmount || '',
    maxAmount: carInvestment?.maxAmount || '',
    expectedROI: carInvestment?.expectedROI || '',
    features: carInvestment?.features || [],
    active: carInvestment?.active ?? true,
    returnRate: carInvestment?.returnRate || '',
    description: carInvestment?.description || '',
    status: carInvestment?.status || 'pending',
    investorsCount: carInvestment?.investorsCount || '',
    totalInvested: carInvestment?.totalInvested || '',
  });

  // Autofill form when carInvestment changes
  React.useEffect(() => {
    setForm({
      name: carInvestment?.name || '',
      minAmount: carInvestment?.minAmount || '',
      maxAmount: carInvestment?.maxAmount || '',
      expectedROI: carInvestment?.expectedROI || '',
      features: carInvestment?.features || [],
      active: carInvestment?.active ?? true,
      returnRate: carInvestment?.returnRate || '',
      description: carInvestment?.description || '',
      status: carInvestment?.status || 'pending',
      investorsCount: carInvestment?.investorsCount || '',
      totalInvested: carInvestment?.totalInvested || '',
    });
  }, [carInvestment, isOpen]);
  const [featureInput, setFeatureInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const method = carInvestment ? 'PUT' : 'POST';
      const url = carInvestment
        ? `${API_BASE}/api/car-investment-entries/${carInvestment._id}`
        : `${API_BASE}/api/car-investment-entries`;
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to save car investment');
      const data = await res.json();
      toast.success('Car investment saved');
      onSuccess && onSuccess(data);
      onClose();
    } catch (err) {
      toast.error(err.message || 'Error saving car investment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4">{carInvestment ? 'Edit Car Investment' : 'Add New Car Investment'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
              <input name="name" value={form.name} onChange={handleChange} required placeholder="e.g., Premium Fleet Package" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"> Amount (₹) *</label>
              <input name="minAmount" value={form.minAmount} onChange={handleChange} required type="number" placeholder="Minimum Amount" className="input w-full" />
            </div>
            
           
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expected ROI (%) *</label>
              <input name="expectedROI" value={form.expectedROI} onChange={handleChange} required type="number" placeholder="Expected ROI (%)" className="input w-full" />
            </div>
           
            
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={e => setFeatureInput(e.target.value)}
                placeholder="Add a feature"
                className="input w-full"
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (featureInput.trim()) {
                    setForm({ ...form, features: [...form.features, featureInput.trim()] });
                    setFeatureInput('');
                  }
                }}
              >+ Add</button>
            </div>
            <ul className="space-y-2">
              {form.features.map((feature, idx) => (
                <li key={idx} className="flex items-center justify-between bg-gray-100 rounded px-3 py-2">
                  <span>{feature}</span>
                  <button type="button" className="text-red-500 ml-2" onClick={() => {
                    setForm({ ...form, features: form.features.filter((_, i) => i !== idx) });
                  }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <label className="text-sm">Active Plan</label>
            <input
              type="checkbox"
              name="active"
              checked={form.active}
              onChange={e => setForm({ ...form, active: e.target.checked })}
            />
            <label className="text-sm ml-4">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="input">
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="matured">Matured</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 mt-6">
            <button type="button" onClick={onClose} className="btn btn-secondary">Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? (carInvestment ? 'Updating...' : 'Saving...') : carInvestment ? 'Update Car Investment' : 'Add Car Investment'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
