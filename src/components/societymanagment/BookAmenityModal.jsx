import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import api from '../../utils/api';

export default function BookAmenityModal({ isOpen, onClose, amenity, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [residents, setResidents] = useState([]);
  const [formData, setFormData] = useState({
    bookingDate: '',
    startTime: '',
    endTime: '',
    purpose: '',
    numberOfGuests: 0,
    bookedByType: 'Resident',
    bookedById: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && amenity) {
      fetchBookingOptions();
      resetForm();
    }
  }, [isOpen, amenity]);

  const fetchBookingOptions = async () => {
    try {
      // Fetch residents and family members for the logged-in user's flat
      const [residentsRes, familyRes] = await Promise.all([
        api.get('/api/members'),
        api.get('/api/family-members')
      ]);

      if (residentsRes.success) {
        setResidents(residentsRes.data || []);
      }

      if (familyRes.success) {
        // Filter only approved family members
        const approved = (familyRes.data || []).filter(fm => fm.isApproved);
        setFamilyMembers(approved);
      }
    } catch (err) {
      console.error('Error fetching booking options:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      bookingDate: '',
      startTime: '',
      endTime: '',
      purpose: '',
      numberOfGuests: 0,
      bookedByType: 'Resident',
      bookedById: ''
    });
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset bookedById when type changes
    if (name === 'bookedByType') {
      setFormData(prev => ({ ...prev, bookedById: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.bookingDate || !formData.startTime || !formData.endTime) {
      setError('Please fill in all required fields');
      return;
    }

    if (!formData.bookedById) {
      setError('Please select who is booking this amenity');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/api/amenity-bookings', {
        amenityId: amenity._id,
        ...formData
      });

      if (response.success) {
        onSuccess && onSuccess(response.data);
        onClose();
      }
    } catch (err) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const bookerOptions = formData.bookedByType === 'Resident' ? residents : familyMembers;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Book ${amenity?.name || 'Amenity'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Amenity Details */}
        <div className="bg-gray-50 p-3 rounded-md">
          <h4 className="font-medium text-gray-900">{amenity?.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{amenity?.description}</p>
          {amenity?.timings && (
            <p className="text-sm text-gray-600 mt-1">
              Timings: {amenity.timings.openTime} - {amenity.timings.closeTime}
            </p>
          )}
          {amenity?.bookingRules?.charges > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              Charges: ₹{amenity.bookingRules.charges}/hour
            </p>
          )}
        </div>

        {/* Booking Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Booking Date *
          </label>
          <input
            type="date"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Time Slots */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* Booked By Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Booking For *
          </label>
          <select
            name="bookedByType"
            value={formData.bookedByType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="Resident">Resident</option>
            <option value="FamilyMember">Family Member</option>
          </select>
        </div>

        {/* Booker Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select {formData.bookedByType === 'Resident' ? 'Resident' : 'Family Member'} *
          </label>
          <select
            name="bookedById"
            value={formData.bookedById}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">-- Select --</option>
            {bookerOptions.map((option) => (
              <option key={option._id} value={option._id}>
                {formData.bookedByType === 'Resident' 
                  ? option.fullName || option.name 
                  : `${option.name} (${option.relation})`
                }
              </option>
            ))}
          </select>
          {formData.bookedByType === 'FamilyMember' && familyMembers.length === 0 && (
            <p className="text-sm text-amber-600 mt-1">
              No approved family members found. Please add and get them approved first.
            </p>
          )}
        </div>

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Purpose
          </label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Purpose of booking (optional)"
          />
        </div>

        {/* Number of Guests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Guests
          </label>
          <input
            type="number"
            name="numberOfGuests"
            value={formData.numberOfGuests}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
