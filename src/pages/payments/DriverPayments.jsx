import { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Calendar,
  Download,
  Search,
  Filter,
  Plus,
  Eye,
  Check,
  X,
  Clock,
  AlertTriangle,
  FileText,
  Banknote,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { formatDate, formatCurrency } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionGuard } from '../../components/guards/PermissionGuards';
import { PERMISSIONS } from '../../utils/permissions';
import toast from 'react-hot-toast';

export default function DriverPayments() {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('all');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [payments, setPayments] = useState([
    {
      id: 1,
      driverId: 'DR001',
      driverName: 'Rajesh Kumar',
      phone: '+91-9876543210',
      paymentType: 'weekly_earnings',
      amount: 15000,
      period: '2024-10-14 to 2024-10-20',
      totalTrips: 45,
      totalDistance: 850,
      commissionRate: 15,
      commissionAmount: 2250,
      netPayment: 12750,
      paymentDate: '2024-10-21',
      status: 'paid',
      paymentMethod: 'bank_transfer',
      transactionId: 'TXN12345',
      remarks: 'Regular weekly payment'
    },
    {
      id: 2,
      driverId: 'DR002',
      driverName: 'Priya Sharma',
      phone: '+91-9876543211',
      paymentType: 'bonus',
      amount: 5000,
      period: 'October 2024',
      totalTrips: 120,
      totalDistance: 2200,
      commissionRate: 0,
      commissionAmount: 0,
      netPayment: 5000,
      paymentDate: '2024-10-25',
      status: 'pending',
      paymentMethod: 'upi',
      transactionId: null,
      remarks: 'Performance bonus for excellent ratings'
    },
    {
      id: 3,
      driverId: 'DR003',
      driverName: 'Amit Singh',
      phone: '+91-9876543212',
      paymentType: 'weekly_earnings',
      amount: 22000,
      period: '2024-10-07 to 2024-10-13',
      totalTrips: 62,
      totalDistance: 1150,
      commissionRate: 15,
      commissionAmount: 3300,
      netPayment: 18700,
      paymentDate: '2024-10-14',
      status: 'paid',
      paymentMethod: 'bank_transfer',
      transactionId: 'TXN12346',
      remarks: 'Regular weekly payment'
    },
    {
      id: 4,
      driverId: 'DR004',
      driverName: 'Sunita Patel',
      phone: '+91-9876543213',
      paymentType: 'incentive',
      amount: 3000,
      period: 'October 2024',
      totalTrips: 80,
      totalDistance: 1500,
      commissionRate: 0,
      commissionAmount: 0,
      netPayment: 3000,
      paymentDate: '2024-10-28',
      status: 'processing',
      paymentMethod: 'bank_transfer',
      transactionId: 'TXN12347',
      remarks: 'Night shift incentive'
    },
    {
      id: 5,
      driverId: 'DR005',
      driverName: 'Rohit Verma',
      phone: '+91-9876543214',
      paymentType: 'weekly_earnings',
      amount: 18500,
      period: '2024-10-21 to 2024-10-27',
      totalTrips: 55,
      totalDistance: 950,
      commissionRate: 15,
      commissionAmount: 2775,
      netPayment: 15725,
      paymentDate: '2024-10-28',
      status: 'failed',
      paymentMethod: 'bank_transfer',
      transactionId: null,
      remarks: 'Bank account verification failed'
    }
  ]);

  const [driverEarnings, setDriverEarnings] = useState([
    {
      driverId: 'DR001',
      driverName: 'Rajesh Kumar',
      monthlyEarnings: 52000,
      totalTrips: 180,
      averageRating: 4.8,
      totalDistance: 3200,
      pendingAmount: 0,
      lastPayment: '2024-10-21'
    },
    {
      driverId: 'DR002',
      driverName: 'Priya Sharma',
      monthlyEarnings: 48000,
      totalTrips: 165,
      averageRating: 4.9,
      totalDistance: 2950,
      pendingAmount: 5000,
      lastPayment: '2024-10-20'
    },
    {
      driverId: 'DR003',
      driverName: 'Amit Singh',
      monthlyEarnings: 65000,
      totalTrips: 220,
      averageRating: 4.7,
      totalDistance: 4100,
      pendingAmount: 0,
      lastPayment: '2024-10-21'
    }
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" className="flex items-center"><Check className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'processing':
        return <Badge variant="info" className="flex items-center"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      case 'failed':
        return <Badge variant="danger" className="flex items-center"><X className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="flex items-center"><X className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const getPaymentTypeBadge = (type) => {
    switch (type) {
      case 'weekly_earnings':
        return <Badge variant="primary">Weekly Earnings</Badge>;
      case 'bonus':
        return <Badge variant="success">Bonus</Badge>;
      case 'incentive':
        return <Badge variant="info">Incentive</Badge>;
      case 'penalty':
        return <Badge variant="danger">Penalty</Badge>;
      case 'refund':
        return <Badge variant="warning">Refund</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.driverId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesType = paymentTypeFilter === 'all' || payment.paymentType === paymentTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const calculateMetrics = () => {
    const totalPayments = payments.reduce((sum, payment) => sum + payment.netPayment, 0);
    const totalCommissions = payments.reduce((sum, payment) => sum + payment.commissionAmount, 0);
    const pendingPayments = payments.filter(p => p.status === 'pending' || p.status === 'processing').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    const totalEarnings = driverEarnings.reduce((sum, driver) => sum + driver.monthlyEarnings, 0);
    const totalPendingAmount = driverEarnings.reduce((sum, driver) => sum + driver.pendingAmount, 0);

    return {
      totalPayments,
      totalCommissions,
      pendingPayments,
      failedPayments,
      totalEarnings,
      totalPendingAmount,
      activeDrivers: driverEarnings.length
    };
  };

  const metrics = calculateMetrics();

  const handlePaymentAction = (paymentId, action) => {
    setPayments(prev => prev.map(payment => {
      if (payment.id === paymentId) {
        let newStatus = payment.status;
        let transactionId = payment.transactionId;
        
        switch (action) {
          case 'approve':
            newStatus = 'processing';
            transactionId = `TXN${Math.random().toString(36).substr(2, 9)}`;
            break;
          case 'reject':
            newStatus = 'failed';
            break;
          case 'retry':
            newStatus = 'processing';
            transactionId = `TXN${Math.random().toString(36).substr(2, 9)}`;
            break;
        }
        
        return { ...payment, status: newStatus, transactionId };
      }
      return payment;
    }));
    
    toast.success(`Payment ${action}ed successfully`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Driver Payments</h1>
          <p className="text-gray-600">Manage driver earnings, payments, and financial reports</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <PermissionGuard permission={PERMISSIONS.PAYMENTS_CREATE}>
            <button 
              onClick={() => setShowPaymentModal(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Process Payment
            </button>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.REPORTS_EXPORT}>
            <button className="btn btn-outline flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalPayments)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalEarnings)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Failed Payments</p>
                <p className="text-2xl font-bold text-red-600">{metrics.failedPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Driver Earnings Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Driver Earnings Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {driverEarnings.map(driver => (
              <div key={driver.driverId} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{driver.driverName}</h3>
                    <p className="text-sm text-gray-500">{driver.driverId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">{formatCurrency(driver.monthlyEarnings)}</p>
                    <p className="text-xs text-gray-500">Monthly Earnings</p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Trips:</span>
                    <span className="font-medium">{driver.totalTrips}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Rating:</span>
                    <span className="font-medium">⭐ {driver.averageRating}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{driver.totalDistance} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pending Amount:</span>
                    <span className={`font-medium ${driver.pendingAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(driver.pendingAmount)}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  Last Payment: {formatDate(driver.lastPayment)}
                </div>

                <PermissionGuard permission={PERMISSIONS.PAYMENTS_CREATE}>
                  {driver.pendingAmount > 0 && (
                    <button className="btn btn-sm btn-primary w-full">
                      <Banknote className="h-3 w-3 mr-1" />
                      Process Payment
                    </button>
                  )}
                </PermissionGuard>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
              <select
                value={paymentTypeFilter}
                onChange={(e) => setPaymentTypeFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Types</option>
                <option value="weekly_earnings">Weekly Earnings</option>
                <option value="bonus">Bonus</option>
                <option value="incentive">Incentive</option>
                <option value="penalty">Penalty</option>
                <option value="refund">Refund</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="input"
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            <div className="flex items-end">
              <button className="btn btn-outline w-full">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions ({filteredPayments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Driver Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Statistics
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{payment.driverName}</div>
                          <div className="text-sm text-gray-500">{payment.driverId}</div>
                          <div className="text-sm text-gray-500">{payment.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getPaymentTypeBadge(payment.paymentType)}
                        <div className="text-sm text-gray-900">{payment.period}</div>
                        <div className="text-sm text-gray-500">{payment.paymentMethod}</div>
                        {payment.transactionId && (
                          <div className="text-xs text-gray-400">TXN: {payment.transactionId}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          Gross: {formatCurrency(payment.amount)}
                        </div>
                        {payment.commissionAmount > 0 && (
                          <div className="text-sm text-red-600">
                            Commission: -{formatCurrency(payment.commissionAmount)} ({payment.commissionRate}%)
                          </div>
                        )}
                        <div className="text-sm font-medium text-green-600">
                          Net: {formatCurrency(payment.netPayment)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm text-gray-900">Trips: {payment.totalTrips}</div>
                        <div className="text-sm text-gray-500">Distance: {payment.totalDistance} km</div>
                        <div className="text-sm text-gray-500">
                          Avg: {formatCurrency(payment.amount / payment.totalTrips)}/trip
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.paymentDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <PermissionGuard permission={PERMISSIONS.PAYMENTS_EDIT}>
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handlePaymentAction(payment.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve Payment"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handlePaymentAction(payment.id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                                title="Reject Payment"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {payment.status === 'failed' && (
                            <button
                              onClick={() => handlePaymentAction(payment.id, 'retry')}
                              className="text-blue-600 hover:text-blue-900"
                              title="Retry Payment"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </button>
                          )}
                        </PermissionGuard>
                        <button
                          className="text-gray-600 hover:text-gray-900"
                          title="Download Receipt"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}