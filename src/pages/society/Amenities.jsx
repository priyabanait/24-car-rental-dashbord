import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import BookAmenityModal from '../../components/societymanagment/BookAmenityModal';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

export default function Amenities() {
  const { user } = useAuth();
  const [amenities, setAmenities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('amenities'); // 'amenities' or 'bookings'

  // Default societyId for testing (in production, this should come from user context)
  const societyId = user?.societyId || '507f1f77bcf86cd799439011';

  useEffect(() => {
    fetchAmenities();
    fetchBookings();
  }, []);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/amenities?societyId=${societyId}`);
      if (response.success) {
        setAmenities(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching amenities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/api/amenity-bookings?societyId=${societyId}`);
      if (response.success) {
        setBookings(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookAmenity = (amenity) => {
    setSelectedAmenity(amenity);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    fetchBookings();
    alert('Booking created successfully!');
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const response = await api.put(`/api/amenity-bookings/${bookingId}/cancel`, {
        cancellationReason: 'Cancelled by user'
      });
      
      if (response.success) {
        alert('Booking cancelled successfully');
        fetchBookings();
      }
    } catch (error) {
      alert(error.message || 'Failed to cancel booking');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-800',
      Completed: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const amenityColumns = [
    { key: 'name', header: 'Amenity' },
    { key: 'type', header: 'Type' },
    { key: 'location', header: 'Location' },
    { 
      key: 'timings', 
      header: 'Timings',
      render: (amenity) => amenity.timings ? `${amenity.timings.openTime} - ${amenity.timings.closeTime}` : 'N/A'
    },
    { 
      key: 'bookingRequired', 
      header: 'Booking',
      render: (amenity) => amenity.bookingRequired ? (
        <span className="text-green-600 font-medium">Required</span>
      ) : (
        <span className="text-gray-500">Not Required</span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (amenity) => amenity.bookingRequired ? (
        <button
          onClick={() => handleBookAmenity(amenity)}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
        >
          Book Now
        </button>
      ) : null
    }
  ];

  const bookingColumns = [
    { 
      key: 'amenity', 
      header: 'Amenity',
      render: (booking) => booking.amenity?.name || 'N/A'
    },
    {
      key: 'bookingDate',
      header: 'Date',
      render: (booking) => formatDate(booking.bookingDate)
    },
    {
      key: 'time',
      header: 'Time',
      render: (booking) => `${booking.startTime} - ${booking.endTime}`
    },
    {
      key: 'bookedBy',
      header: 'Booked By',
      render: (booking) => (
        <div>
          <div className="font-medium">{booking.bookedBy?.name}</div>
          <div className="text-xs text-gray-500">{booking.bookedBy?.userType}</div>
        </div>
      )
    },
    {
      key: 'flat',
      header: 'Flat',
      render: (booking) => booking.flat ? `${booking.flat.flatNo}` : 'N/A'
    },
    {
      key: 'charges',
      header: 'Charges',
      render: (booking) => `₹${booking.charges || 0}`
    },
    {
      key: 'status',
      header: 'Status',
      render: (booking) => getStatusBadge(booking.status)
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (booking) => ['Pending', 'Approved'].includes(booking.status) ? (
        <button
          onClick={() => handleCancelBooking(booking._id)}
          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
        >
          Cancel
        </button>
      ) : null
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Amenities</h1>
          <p className="mt-1 text-sm text-gray-500">
            View amenities and manage your bookings.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('amenities')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'amenities'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Available Amenities
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bookings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Bookings
          </button>
        </nav>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : activeTab === 'amenities' ? (
          amenities.length > 0 ? (
            <Table columns={amenityColumns} data={amenities} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No amenities available</p>
            </div>
          )
        ) : (
          bookings.length > 0 ? (
            <Table columns={bookingColumns} data={bookings} />
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found</p>
            </div>
          )
        )}
      </Card>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookAmenityModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          amenity={selectedAmenity}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}

