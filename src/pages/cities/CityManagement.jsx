import { useState, useEffect } from 'react';
import { 
  MapPin, 
  Plus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { formatDate } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionGuard } from '../../components/guards/PermissionGuards';
import { PERMISSIONS } from '../../utils/permissions';
import toast from 'react-hot-toast';

export default function CityManagement() {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [stats, setStats] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    state: '',
    country: 'India',
    addresses: [],
    latitude: '',
    longitude: '',
    isActive: true
  });

  const [newAddress, setNewAddress] = useState({
    address: '',
    label: '',
    isPrimary: false
  });

  useEffect(() => {
    fetchCities();
    fetchStats();
  }, []);

  const fetchCities = async () => {
    setLoading(true);
    setError(null);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://24-car-rental-backend.vercel.app';
      const res = await fetch(`${API_BASE}/api/cities`);
      if (!res.ok) throw new Error(`Failed to load cities: ${res.status}`);
      const data = await res.json();
      setCities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to load cities');
      setCities([]);
      toast.error('Failed to load cities');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://24-car-rental-backend.vercel.app';
      const res = await fetch(`${API_BASE}/api/cities/stats/summary`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const filteredCities = cities.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         city.state.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && city.isActive) ||
                         (statusFilter === 'inactive' && !city.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const handleAddAddress = () => {
    if (!newAddress.address.trim()) {
      toast.error('Please enter an address');
      return;
    }

    const addressToAdd = {
      address: newAddress.address.trim(),
      label: newAddress.label.trim(),
      isPrimary: newAddress.isPrimary || formData.addresses.length === 0
    };

    // If this is set as primary, unset all others
    const updatedAddresses = newAddress.isPrimary
      ? formData.addresses.map(addr => ({ ...addr, isPrimary: false }))
      : formData.addresses;

    setFormData({
      ...formData,
      addresses: [...updatedAddresses, addressToAdd]
    });

    setNewAddress({ address: '', label: '', isPrimary: false });
  };

  const handleRemoveAddress = (index) => {
    const updatedAddresses = formData.addresses.filter((_, i) => i !== index);
    
    // If we removed the primary and there are still addresses, make the first one primary
    const hasPrimary = updatedAddresses.some(addr => addr.isPrimary);
    if (!hasPrimary && updatedAddresses.length > 0) {
      updatedAddresses[0].isPrimary = true;
    }

    setFormData({
      ...formData,
      addresses: updatedAddresses
    });
  };

  const handleSetPrimary = (index) => {
    const updatedAddresses = formData.addresses.map((addr, i) => ({
      ...addr,
      isPrimary: i === index
    }));

    setFormData({
      ...formData,
      addresses: updatedAddresses
    });
  };

  const handleCreateCity = () => {
    setSelectedCity(null);
    setFormData({
      name: '',
      state: '',
      country: 'India',
      addresses: [],
      latitude: '',
      longitude: '',
      isActive: true
    });
    setNewAddress({ address: '', label: '', isPrimary: false });
    setShowModal(true);
  };

  const handleEditCity = (city) => {
    setSelectedCity(city);
    setFormData({
      name: city.name,
      state: city.state,
      country: city.country || 'India',
      addresses: city.addresses || [],
      latitude: city.coordinates?.latitude || '',
      longitude: city.coordinates?.longitude || '',
      isActive: city.isActive
    });
    setNewAddress({ address: '', label: '', isPrimary: false });
    setShowModal(true);
  };

  const handleSaveCity = async (e) => {
    e.preventDefault();
    
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://24-car-rental-backend.vercel.app';
      const token = localStorage.getItem('24cr_token');
      
      const payload = {
        name: formData.name.trim(),
        state: formData.state.trim(),
        country: formData.country.trim(),
        addresses: formData.addresses,
        coordinates: formData.latitude && formData.longitude ? {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        } : undefined,
        isActive: formData.isActive
      };

      let res;
      if (selectedCity) {
        // Update existing city
        res = await fetch(`${API_BASE}/api/cities/${selectedCity._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });
      } else {
        // Create new city
        res = await fetch(`${API_BASE}/api/cities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify(payload)
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save city');
      }

      const result = await res.json();
      toast.success(selectedCity ? 'City updated successfully' : 'City added successfully');
      setShowModal(false);
      fetchCities();
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to save city');
    }
  };

  const handleDeleteCity = async (cityId) => {
    if (!window.confirm('Are you sure you want to delete this city?')) return;
    
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://24-car-rental-backend.vercel.app';
      const res = await fetch(`${API_BASE}/api/cities/${cityId}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Failed to delete city');

      toast.success('City deleted successfully');
      fetchCities();
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to delete city');
    }
  };

  const handleToggleStatus = async (cityId, currentStatus) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'https://24-car-rental-backend.vercel.app';
      const token = localStorage.getItem('24cr_token');
      
      const endpoint = currentStatus 
        ? `${API_BASE}/api/cities/${cityId}`
        : `${API_BASE}/api/cities/${cityId}/activate`;
      
      const res = await fetch(endpoint, {
        method: currentStatus ? 'PUT' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: currentStatus ? JSON.stringify({ isActive: false }) : undefined
      });

      if (!res.ok) throw new Error('Failed to update city status');

      toast.success(`City ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchCities();
      fetchStats();
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to update city status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">City Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage cities where your car rental service is available
          </p>
        </div>
        <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW}>
          <button
            onClick={handleCreateCity}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add City
          </button>
        </PermissionGuard>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Cities</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCities || cities.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Cities</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeCities || cities.filter(c => c.isActive).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Inactive Cities</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.inactiveCities || cities.filter(c => !c.isActive).length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">States Covered</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(cities.map(c => c.state)).size}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search cities or states..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button
              onClick={fetchCities}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Refresh
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Cities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cities ({filteredCities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-600">Loading cities...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : filteredCities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No cities found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>City Name</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Address</TableHead>
                    {/* <TableHead>Vehicles</TableHead> */}
                    <TableHead>Status</TableHead>
                    <TableHead>Added On</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCities.map((city) => (
                    <TableRow key={city._id}>
                      <TableCell className="font-medium">{city.name}</TableCell>
                      <TableCell>{city.state}</TableCell>
                      <TableCell>{city.country}</TableCell>
                      <TableCell>
                        {city.addresses && city.addresses.length > 0 ? (
                          <div className="space-y-1">
                            {city.addresses.slice(0, 2).map((addr, idx) => (
                              <div key={idx} className="text-sm">
                                {addr.isPrimary && <span className="text-green-600 font-semibold">★ </span>}
                                {addr.label && <span className="text-gray-500">{addr.label}: </span>}
                                {addr.address}
                              </div>
                            ))}
                            {city.addresses.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{city.addresses.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      {/* <TableCell>{city.vehicleCount || 0}</TableCell> */}
                      <TableCell>
                        {city.isActive ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="default">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(city.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <PermissionGuard permission={PERMISSIONS.ADMIN_VIEW}>
                            <button
                              onClick={() => handleEditCity(city)}
                              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(city._id, city.isActive)}
                              className={`p-1 rounded ${
                                city.isActive
                                  ? 'text-gray-600 hover:bg-gray-50'
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={city.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {city.isActive ? (
                                <XCircle className="h-4 w-4" />
                              ) : (
                                <CheckCircle className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteCity(city._id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </PermissionGuard>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* City Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {selectedCity ? 'Edit City' : 'Add New City'}
              </h2>
              
              <form onSubmit={handleSaveCity} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Mumbai"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., Maharashtra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="e.g., India"
                  />
                </div>

                {/* Addresses Section */}
                <div className="border-t pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Addresses
                  </label>
                  
                  {/* Existing Addresses List */}
                  {formData.addresses.length > 0 && (
                    <div className="mb-3 space-y-2 max-h-40 overflow-y-auto">
                      {formData.addresses.map((addr, index) => (
                        <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded border">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {addr.isPrimary && (
                                <span className="text-green-600 text-xs font-semibold">★ Primary</span>
                              )}
                              {addr.label && (
                                <span className="text-xs text-gray-600 font-medium">{addr.label}</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-800">{addr.address}</p>
                          </div>
                          <div className="flex gap-1">
                            {!addr.isPrimary && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(index)}
                                className="text-xs text-green-600 hover:text-green-700 px-2 py-1"
                                title="Set as primary"
                              >
                                ★
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveAddress(index)}
                              className="text-red-600 hover:text-red-700 p-1"
                              title="Remove"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add New Address Form */}
                  <div className="space-y-2 p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        placeholder="Label (e.g., Office, Main)"
                      />
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="newAddressPrimary"
                          checked={newAddress.isPrimary}
                          onChange={(e) => setNewAddress({ ...newAddress, isPrimary: e.target.checked })}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="newAddressPrimary" className="ml-2 block text-sm text-gray-700">
                          Primary
                        </label>
                      </div>
                    </div>
                    <textarea
                      value={newAddress.address}
                      onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                      placeholder="Enter address..."
                      rows="2"
                    />
                    <button
                      type="button"
                      onClick={handleAddAddress}
                      className="w-full inline-flex items-center justify-center px-3 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Address
                    </button>
                  </div>
                </div>

                {/* <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="19.0760"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="72.8777"
                    />
                  </div>
                </div> */}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Active
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    {selectedCity ? 'Update City' : 'Add City'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
