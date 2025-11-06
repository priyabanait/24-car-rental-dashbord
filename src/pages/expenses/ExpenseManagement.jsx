import { useState } from 'react';
import { 
  Receipt, 
  DollarSign, 
  TrendingDown, 
  PieChart, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Search,
  Filter,
  Calendar,
  FileText,
  Car,
  Fuel,
  Wrench,
  Building,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { formatDate, formatCurrency } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionGuard } from '../../components/guards/PermissionGuards';
import { PERMISSIONS } from '../../utils/permissions';
import toast from 'react-hot-toast';

export default function ExpenseManagement() {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateRange, setDateRange] = useState('thisMonth');
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [expenses, setExpenses] = useState([
    {
      id: 1,
      title: 'Vehicle Maintenance - KA-05-AB-1234',
      category: 'maintenance',
      subcategory: 'General Service',
      amount: 15000,
      date: '2024-10-25',
      vendor: 'City Auto Service',
      vehicleId: 'KA-05-AB-1234',
      driverId: 'DR001',
      driverName: 'Rajesh Kumar',
      description: 'Full service including oil change, brake pad replacement',
      status: 'approved',
      receiptUrl: 'receipt1.pdf',
      approvedBy: 'Admin',
      approvedDate: '2024-10-25',
      paymentMethod: 'bank_transfer',
      invoiceNumber: 'INV-2024-001'
    },
    {
      id: 2,
      title: 'Fuel Expense - Multiple Vehicles',
      category: 'fuel',
      subcategory: 'Petrol',
      amount: 25000,
      date: '2024-10-24',
      vendor: 'Shell Petrol Pump',
      vehicleId: 'Multiple',
      driverId: null,
      driverName: null,
      description: 'Bulk fuel purchase for fleet vehicles',
      status: 'pending',
      receiptUrl: 'receipt2.pdf',
      approvedBy: null,
      approvedDate: null,
      paymentMethod: 'cash',
      invoiceNumber: 'FUEL-2024-025'
    },
    {
      id: 3,
      title: 'Office Rent - October 2024',
      category: 'administrative',
      subcategory: 'Rent',
      amount: 50000,
      date: '2024-10-01',
      vendor: 'Property Management Co.',
      vehicleId: null,
      driverId: null,
      driverName: null,
      description: 'Monthly office rent payment',
      status: 'approved',
      receiptUrl: 'receipt3.pdf',
      approvedBy: 'Finance Admin',
      approvedDate: '2024-10-01',
      paymentMethod: 'bank_transfer',
      invoiceNumber: 'RENT-2024-10'
    },
    {
      id: 4,
      title: 'Insurance Premium - Vehicle Fleet',
      category: 'insurance',
      subcategory: 'Vehicle Insurance',
      amount: 120000,
      date: '2024-10-15',
      vendor: 'National Insurance Co.',
      vehicleId: 'Fleet',
      driverId: null,
      driverName: null,
      description: 'Quarterly insurance premium for 50 vehicles',
      status: 'approved',
      receiptUrl: 'receipt4.pdf',
      approvedBy: 'Super Admin',
      approvedDate: '2024-10-15',
      paymentMethod: 'bank_transfer',
      invoiceNumber: 'INS-2024-Q4'
    },
    {
      id: 5,
      title: 'Driver Salary - Support Staff',
      category: 'salary',
      subcategory: 'Support Staff',
      amount: 45000,
      date: '2024-10-30',
      vendor: 'HR Department',
      vehicleId: null,
      driverId: 'Multiple',
      driverName: 'Support Staff',
      description: 'Monthly salary for support and admin staff',
      status: 'rejected',
      receiptUrl: null,
      approvedBy: null,
      approvedDate: null,
      paymentMethod: 'bank_transfer',
      invoiceNumber: 'SAL-2024-10'
    }
  ]);

  const expenseCategories = [
    { key: 'fuel', label: 'Fuel', icon: Fuel, color: 'text-orange-600' },
    { key: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'text-blue-600' },
    { key: 'insurance', label: 'Insurance', icon: Car, color: 'text-green-600' },
    { key: 'administrative', label: 'Administrative', icon: Building, color: 'text-purple-600' },
    { key: 'salary', label: 'Salary & Benefits', icon: Users, color: 'text-indigo-600' },
    { key: 'marketing', label: 'Marketing', icon: FileText, color: 'text-pink-600' },
    { key: 'technology', label: 'Technology', icon: FileText, color: 'text-gray-600' },
    { key: 'other', label: 'Other', icon: FileText, color: 'text-gray-500' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success" className="flex items-center"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="danger" className="flex items-center"><AlertTriangle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'processing':
        return <Badge variant="info" className="flex items-center"><Clock className="h-3 w-3 mr-1" />Processing</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const getCategoryIcon = (category) => {
    const cat = expenseCategories.find(c => c.key === category);
    if (cat) {
      const Icon = cat.icon;
      return <Icon className={`h-5 w-5 ${cat.color}`} />;
    }
    return <FileText className="h-5 w-5 text-gray-500" />;
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const calculateMetrics = () => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const approvedExpenses = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0);
    const rejectedExpenses = expenses.filter(e => e.status === 'rejected').reduce((sum, e) => sum + e.amount, 0);
    
    const categoryBreakdown = expenseCategories.map(category => {
      const categoryExpenses = expenses.filter(e => e.category === category.key && e.status === 'approved');
      const total = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      const percentage = approvedExpenses > 0 ? (total / approvedExpenses) * 100 : 0;
      
      return {
        category: category.label,
        amount: total,
        percentage,
        count: categoryExpenses.length
      };
    }).filter(c => c.amount > 0);

    return {
      totalExpenses,
      approvedExpenses,
      pendingExpenses,
      rejectedExpenses,
      categoryBreakdown,
      pendingCount: expenses.filter(e => e.status === 'pending').length,
      rejectedCount: expenses.filter(e => e.status === 'rejected').length
    };
  };

  const metrics = calculateMetrics();

  const handleExpenseAction = (expenseId, action) => {
    setExpenses(prev => prev.map(expense => {
      if (expense.id === expenseId) {
        let newStatus = expense.status;
        let approvedBy = expense.approvedBy;
        let approvedDate = expense.approvedDate;
        
        switch (action) {
          case 'approve':
            newStatus = 'approved';
            approvedBy = 'Current User';
            approvedDate = new Date().toISOString().split('T')[0];
            break;
          case 'reject':
            newStatus = 'rejected';
            approvedBy = null;
            approvedDate = null;
            break;
          case 'pending':
            newStatus = 'pending';
            approvedBy = null;
            approvedDate = null;
            break;
        }
        
        return { ...expense, status: newStatus, approvedBy, approvedDate };
      }
      return expense;
    }));
    
    toast.success(`Expense ${action}ed successfully`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600">Track and manage operational expenses and financial reports</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <PermissionGuard permission={PERMISSIONS.EXPENSES_CREATE}>
            <button 
              onClick={() => setShowExpenseModal(true)}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
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
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(metrics.totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved Expenses</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.approvedExpenses)}</p>
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
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.pendingCount}</p>
                <p className="text-xs text-gray-500">{formatCurrency(metrics.pendingExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-600">{metrics.rejectedCount}</p>
                <p className="text-xs text-gray-500">{formatCurrency(metrics.rejectedExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Expense Categories (Approved)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.categoryBreakdown.map((category, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{category.category}</h3>
                  <span className="text-sm text-gray-500">{category.count} items</span>
                </div>
                <div className="space-y-2">
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(category.amount)}</div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{category.percentage.toFixed(1)}%</span>
                  </div>
                </div>
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
                  placeholder="Search expenses..."
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
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
                <option value="processing">Processing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Categories</option>
                {expenseCategories.map(category => (
                  <option key={category.key} value={category.key}>{category.label}</option>
                ))}
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

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Records ({filteredExpenses.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expense Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle/Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getCategoryIcon(expense.category)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{expense.title}</div>
                          <div className="text-sm text-gray-500">{expense.description}</div>
                          {expense.invoiceNumber && (
                            <div className="text-xs text-gray-400">Invoice: {expense.invoiceNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">{expense.category}</div>
                      <div className="text-sm text-gray-500">{expense.subcategory}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</div>
                      <div className="text-sm text-gray-500 capitalize">{expense.paymentMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.vendor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {expense.vehicleId && expense.vehicleId !== 'Multiple' && expense.vehicleId !== 'Fleet' 
                          ? expense.vehicleId 
                          : expense.vehicleId}
                      </div>
                      {expense.driverName && (
                        <div className="text-sm text-gray-500">{expense.driverName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(expense.status)}
                      {expense.approvedBy && (
                        <div className="text-xs text-gray-500 mt-1">
                          By: {expense.approvedBy}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <PermissionGuard permission={PERMISSIONS.EXPENSES_EDIT}>
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Edit Expense"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {expense.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleExpenseAction(expense.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleExpenseAction(expense.id, 'reject')}
                                className="text-red-600 hover:text-red-900"
                                title="Reject"
                              >
                                <AlertTriangle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </PermissionGuard>
                        {expense.receiptUrl && (
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="Download Receipt"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                        <PermissionGuard permission={PERMISSIONS.EXPENSES_DELETE}>
                          <button
                            className="text-red-600 hover:text-red-900"
                            title="Delete Expense"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </PermissionGuard>
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