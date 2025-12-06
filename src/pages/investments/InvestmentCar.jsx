import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Download,
  IndianRupee,
  Calendar,
  CreditCard,
  User,
  Mail,
  Phone,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatDate, formatCurrency } from '../../utils';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { PermissionGuard } from '../../components/guards/PermissionGuards';
import { PERMISSIONS } from '../../utils/permissions';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://udrive-backend-1igb.vercel.app';

const InvestmentCar = () => {
  const { hasPermission } = useAuth();
  const [carInvestments, setCarInvestments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    loadCarInvestments();
    loadVehicles();
  }, []);

  const loadCarInvestments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/api/car-investment-entries`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to load car investments');
      const data = await response.json();
      setCarInvestments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load car investments:', err);
      setCarInvestments([]);
    } finally {
      setLoading(false);
    }
  };


  const loadVehicles = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/vehicles`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to load vehicles');
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load vehicles:', err);
      setVehicles([]);
    }
  };

  // Update vehicle status in backend
  const updateVehicleStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`${API_BASE}/api/vehicles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Failed to update status');
      // Refresh vehicles after update
      await loadVehicles();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };



  // Match vehicles with car investment entries by car category and investment name
  const matchedVehiclesRaw = vehicles.map(vehicle => {
    const category = (vehicle.category || vehicle.carCategory || '').toLowerCase();
    const matchedInvestment = carInvestments.find(entry => entry.name?.toLowerCase() === category);
    return {
      ...vehicle,
      matchedInvestment
    };
  }).filter(v => v.matchedInvestment);

  // Search filter: match on vehicle, brand, model, car invest name, etc.
  const search = searchTerm.toLowerCase();
  const matchedVehicles = matchedVehiclesRaw.filter(v => {
    return (
      (v.registrationNumber || '').toLowerCase().includes(search) ||
      (v.brand || v.make || '').toLowerCase().includes(search) ||
      (v.model || '').toLowerCase().includes(search) ||
      (v.matchedInvestment?.name || '').toLowerCase().includes(search)
    );
  });

  // Metrics based on filtered matched vehicles
  const totalInvestment = matchedVehicles.reduce((sum, v) => sum + parseFloat(v.matchedInvestment?.minAmount || 0), 0);
  const avgROI = matchedVehicles.length > 0
    ? matchedVehicles.reduce((sum, v) => sum + parseFloat(v.matchedInvestment?.expectedROI || 0), 0) / matchedVehicles.length
    : 0;
  const totalCarInvestmentPlans = [...new Set(matchedVehicles.map(v => v.matchedInvestment?.name))].length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading investments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Car Investment Management</h1>
          <p className="text-gray-600">Manage car-based investments and see monthly profit</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <IndianRupee className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Investment (Min)</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalInvestment)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average ROI</p>
                <p className="text-2xl font-bold text-green-600">{avgROI.toFixed(2)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Car Investment Plans</p>
                <p className="text-2xl font-bold text-purple-600">{totalCarInvestmentPlans}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by car investment name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Matched Vehicles with Car Investment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicles Matched with Car Investment Entries ({matchedVehicles.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Car Invest Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"> Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expected ROI (%)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monthly Profit (Min)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Months</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matchedVehicles.map((v) => {
                  const entry = v.matchedInvestment;
                  const id = v.vehicleId || v._id;
                  const status = v.status || 'active';
                  // Sum months from all rentPeriods
                  let showMonth = '-';
                  let months = 0;
                  let activeMonths = 0;
                  let isPaused = false;
                  if (Array.isArray(v.rentPeriods) && v.rentPeriods.length > 0) {
                    v.rentPeriods.forEach(period => {
                      const start = new Date(period.start);
                      const end = period.end ? new Date(period.end) : new Date();
                      const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));
                      months += Math.floor(diffDays / 30) + 1;
                      activeMonths += Math.floor(diffDays / 30) + 1;
                    });
                    showMonth = `Month ${months}`;
                    // If last period is closed and status is inactive/suspended, show paused
                    const lastPeriod = v.rentPeriods[v.rentPeriods.length - 1];
                    if ((status === 'inactive' || status === 'suspended') && lastPeriod && lastPeriod.end) {
                      isPaused = true;
                    }
                  }
                  // Show cumulative profit month-wise
                  let monthlyProfit = '₹0';
                  let totalProfit = 0;
                  if (typeof v.monthlyProfitMin === 'number' && v.monthlyProfitMin > 0) {
                    monthlyProfit = formatCurrency(v.monthlyProfitMin);
                    totalProfit = v.monthlyProfitMin * activeMonths;
                  } else if (entry && entry.minAmount && entry.expectedROI) {
                    const calcProfit = entry.minAmount * (entry.expectedROI / 100) / 12;
                    monthlyProfit = formatCurrency(calcProfit);
                    totalProfit = calcProfit * activeMonths;
                  }
                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{v.registrationNumber || '-'}</td>
                      <td className="px-6 py-4">{v.brand || v.make || '-'}</td>
                      <td className="px-6 py-4">{v.model || '-'}</td>
                      <td className="px-6 py-4">{entry.name}</td>
                      <td className="px-6 py-4">{formatCurrency(entry.minAmount)}</td>
                      <td className="px-6 py-4">{entry.expectedROI}%</td>
                      <td className="px-6 py-4 text-green-700 font-bold">
                        {monthlyProfit}
                        <div className="text-xs text-gray-500">Total: {formatCurrency(totalProfit)}</div>
                      </td>
                      <td className="px-6 py-4">
                        {showMonth} {isPaused && <span className="text-xs text-yellow-600 ml-2">(Paused)</span>}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={status}
                          onChange={e => updateVehicleStatus(id, e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {matchedVehicles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No vehicles matched with car investment entries</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentCar;
