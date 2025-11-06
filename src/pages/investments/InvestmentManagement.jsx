import { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  PieChart, 
  Plus,
  Eye,
  Edit,
  Download,
  Search,
  Filter,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Target,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { formatDate, formatCurrency } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';
import { PermissionGuard } from '../../components/guards/PermissionGuards';
import { PERMISSIONS } from '../../utils/permissions';
import toast from 'react-hot-toast';

export default function InvestmentManagement() {
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [showInvestorModal, setShowInvestorModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const [investments, setInvestments] = useState([
    {
      id: 1,
      investorName: 'Rajesh Gupta',
      email: 'rajesh.gupta@email.com',
      phone: '+91-9876543210',
      planType: 'Premium Fleet Package',
      investmentAmount: 5000000,
      investmentDate: '2024-01-15',
      maturityDate: '2026-01-15',
      expectedReturn: 7500000,
      currentValue: 5850000,
      roi: 17.0,
      status: 'active',
      riskLevel: 'medium',
      paymentMethod: 'Bank Transfer',
      documents: ['agreement', 'kyc', 'bank_details']
    },
    {
      id: 2,
      investorName: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91-9876543211',
      planType: 'Standard Vehicle Investment',
      investmentAmount: 2000000,
      investmentDate: '2024-03-20',
      maturityDate: '2025-09-20',
      expectedReturn: 2400000,
      currentValue: 2180000,
      roi: 9.0,
      status: 'active',
      riskLevel: 'low',
      paymentMethod: 'Digital Payment',
      documents: ['agreement', 'kyc']
    },
    {
      id: 3,
      investorName: 'Amit Singh',
      email: 'amit.singh@email.com',
      phone: '+91-9876543212',
      planType: 'Growth Plus Plan',
      investmentAmount: 8000000,
      investmentDate: '2023-11-10',
      maturityDate: '2025-11-10',
      expectedReturn: 10400000,
      currentValue: 9600000,
      roi: 20.0,
      status: 'active',
      riskLevel: 'high',
      paymentMethod: 'Bank Transfer',
      documents: ['agreement', 'kyc', 'bank_details', 'collateral']
    },
    {
      id: 4,
      investorName: 'Sunita Patel',
      email: 'sunita.patel@email.com',
      phone: '+91-9876543213',
      planType: 'Starter Investment Plan',
      investmentAmount: 1000000,
      investmentDate: '2024-06-15',
      maturityDate: '2025-06-15',
      expectedReturn: 1150000,
      currentValue: 1075000,
      roi: 7.5,
      status: 'matured',
      riskLevel: 'low',
      paymentMethod: 'Digital Payment',
      documents: ['agreement', 'kyc']
    }
  ]);

  const [investmentPlans, setInvestmentPlans] = useState([
    {
      id: 1,
      name: 'Starter Investment Plan',
      minAmount: 100000,
      maxAmount: 1500000,
      duration: 12,
      expectedROI: 8.5,
      riskLevel: 'low',
      features: ['Basic vehicle allocation', 'Monthly returns', 'Insurance coverage'],
      active: true
    },
    {
      id: 2,
      name: 'Standard Vehicle Investment',
      minAmount: 1500000,
      maxAmount: 3000000,
      duration: 18,
      expectedROI: 12.0,
      riskLevel: 'medium',
      features: ['Premium vehicle allocation', 'Bi-weekly returns', 'Full insurance', 'Priority support'],
      active: true
    },
    {
      id: 3,
      name: 'Premium Fleet Package',
      minAmount: 3000000,
      maxAmount: 8000000,
      duration: 24,
      expectedROI: 15.0,
      riskLevel: 'medium',
      features: ['Luxury vehicle allocation', 'Weekly returns', 'Comprehensive insurance', 'Dedicated manager'],
      active: true
    },
    {
      id: 4,
      name: 'Growth Plus Plan',
      minAmount: 5000000,
      maxAmount: 20000000,
      duration: 36,
      expectedROI: 18.5,
      riskLevel: 'high',
      features: ['Fleet ownership', 'Daily returns', 'Premium insurance', 'Investment advisory'],
      active: true
    }
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="flex items-center"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'matured':
        return <Badge variant="info" className="flex items-center"><Target className="h-3 w-3 mr-1" />Matured</Badge>;
      case 'withdrawn':
        return <Badge variant="secondary">Withdrawn</Badge>;
      default:
        return <Badge variant="info">{status}</Badge>;
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'low':
        return <Badge variant="success">Low Risk</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Risk</Badge>;
      case 'high':
        return <Badge variant="danger">High Risk</Badge>;
      default:
        return <Badge variant="info">{risk}</Badge>;
    }
  };

  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         investment.planType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || investment.status === statusFilter;
    const matchesPlan = planFilter === 'all' || investment.planType === planFilter;
    
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const calculateMetrics = () => {
    const totalInvestment = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);
    const totalCurrentValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
    const totalExpectedReturn = investments.reduce((sum, inv) => sum + inv.expectedReturn, 0);
    const activeInvestments = investments.filter(inv => inv.status === 'active').length;
    const averageROI = investments.reduce((sum, inv) => sum + inv.roi, 0) / investments.length;

    return {
      totalInvestment,
      totalCurrentValue,
      totalExpectedReturn,
      activeInvestments,
      averageROI,
      totalGrowth: totalCurrentValue - totalInvestment,
      growthPercentage: ((totalCurrentValue - totalInvestment) / totalInvestment) * 100
    };
  };

  const metrics = calculateMetrics();

  const handleAddInvestor = () => {
    setShowInvestorModal(true);
  };

  const handleAddPlan = () => {
    setShowPlanModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Management</h1>
          <p className="text-gray-600">Manage investor portfolios and investment plans</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <PermissionGuard permission={PERMISSIONS.INVESTMENTS_CREATE}>
            <button 
              onClick={handleAddPlan}
              className="btn btn-secondary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Plan
            </button>
            <button 
              onClick={handleAddInvestor}
              className="btn btn-primary flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Investor
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Investment</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalInvestment)}</p>
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
                <p className="text-sm font-medium text-gray-600">Current Value</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(metrics.totalCurrentValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${metrics.growthPercentage >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                {metrics.growthPercentage >= 0 ? (
                  <ArrowUpRight className="h-6 w-6 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Growth</p>
                <p className={`text-2xl font-bold ${metrics.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(metrics.totalGrowth)}
                </p>
                <p className={`text-sm ${metrics.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {metrics.growthPercentage.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Investors</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeInvestments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <PieChart className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average ROI</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.averageROI.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="h-5 w-5 mr-2" />
            Investment Plans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {investmentPlans.map(plan => (
              <div key={plan.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                  {getRiskBadge(plan.riskLevel)}
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Min Amount:</span>
                    <span className="font-medium">{formatCurrency(plan.minAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Amount:</span>
                    <span className="font-medium">{formatCurrency(plan.maxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{plan.duration} months</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Expected ROI:</span>
                    <span className="font-medium text-green-600">{plan.expectedROI}%</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Features:</p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    {plan.features.slice(0, 3).map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <PermissionGuard permission={PERMISSIONS.INVESTMENTS_EDIT}>
                  <div className="flex space-x-2">
                    <button className="btn btn-sm btn-outline flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </button>
                    <button className="btn btn-sm btn-primary flex-1">
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </button>
                  </div>
                </PermissionGuard>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search investors..."
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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="matured">Matured</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Investment Plan</label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Plans</option>
                {investmentPlans.map(plan => (
                  <option key={plan.id} value={plan.name}>{plan.name}</option>
                ))}
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

      {/* Investments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Portfolio ({filteredInvestments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investor Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investment Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Investment Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ROI
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maturity Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvestments.map((investment) => (
                  <tr key={investment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{investment.investorName}</div>
                          <div className="text-sm text-gray-500">{investment.email}</div>
                          <div className="text-sm text-gray-500">{investment.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{investment.planType}</div>
                      <div className="text-sm text-gray-500">{getRiskBadge(investment.riskLevel)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(investment.investmentAmount)}</div>
                      <div className="text-sm text-gray-500">Invested: {formatDate(investment.investmentDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{formatCurrency(investment.currentValue)}</div>
                      <div className="text-sm text-gray-500">
                        Expected: {formatCurrency(investment.expectedReturn)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${investment.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {investment.roi}%
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        {investment.roi >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 mr-1 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 mr-1 text-red-500" />
                        )}
                        Growth
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(investment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(investment.maturityDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <PermissionGuard permission={PERMISSIONS.INVESTMENTS_EDIT}>
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Edit Investment"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </PermissionGuard>
                        <button
                          className="text-blue-600 hover:text-blue-900"
                          title="Download Reports"
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