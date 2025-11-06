import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  PieChart,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils';

export default function FinanceAdminDashboard() {
  const [financeStats, setFinanceStats] = useState({
    totalRevenue: 2456780,
    monthlyRevenue: 456890,
    totalInvestments: 1234500,
    pendingPayments: 45680,
    profitMargin: 23.5,
    investmentReturns: 89340,
    expenseRatio: 76.2,
    cashFlow: 234560
  });

  const [recentTransactions, setRecentTransactions] = useState([
    { id: 1, type: 'payment', description: 'Driver payment - Batch 45', amount: 125000, status: 'completed', date: '2024-10-25' },
    { id: 2, type: 'investment', description: 'Investment return - Plan A', amount: 45000, status: 'pending', date: '2024-10-24' },
    { id: 3, type: 'expense', description: 'Vehicle maintenance costs', amount: -12500, status: 'completed', date: '2024-10-24' },
    { id: 4, type: 'revenue', description: 'Platform commission', amount: 67890, status: 'completed', date: '2024-10-23' },
  ]);

  const [investmentPlans, setInvestmentPlans] = useState([
    { id: 1, name: 'Plan A - Premium', totalAmount: 500000, investors: 45, roi: 12.5, status: 'active' },
    { id: 2, name: 'Plan B - Standard', totalAmount: 300000, investors: 78, roi: 10.8, status: 'active' },
    { id: 3, name: 'Plan C - Basic', totalAmount: 200000, investors: 123, roi: 8.2, status: 'active' },
    { id: 4, name: 'Plan D - Growth', totalAmount: 750000, investors: 32, roi: 15.0, status: 'launching' },
  ]);

  const [financialAlerts, setFinancialAlerts] = useState([
    { id: 1, type: 'payment', message: 'Monthly driver payments due in 2 days', priority: 'high', amount: 234500 },
    { id: 2, type: 'investment', message: 'Investment Plan D reaching capacity', priority: 'medium', amount: 750000 },
    { id: 3, type: 'expense', message: 'Maintenance budget 85% utilized', priority: 'medium', amount: 85000 },
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Finance Administration Dashboard</h1>
        <p className="text-emerald-100">Manage investments, payments, and financial operations</p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(financeStats.totalRevenue)}</p>
                <p className="text-xs text-green-600">+15% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Investments</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(financeStats.totalInvestments)}</p>
                <p className="text-xs text-green-600">+22% growth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(financeStats.pendingPayments)}</p>
                <p className="text-xs text-orange-600">Due in 2 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-gray-900">{financeStats.profitMargin}%</p>
                <p className="text-xs text-green-600">+2.1% increase</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Alerts & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              Financial Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {financialAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.priority === 'high' ? 'border-red-500 bg-red-50' :
                  'border-yellow-500 bg-yellow-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{alert.message}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(alert.amount)}</p>
                    </div>
                    <Badge 
                      variant={alert.priority === 'high' ? 'danger' : 'warning'}
                    >
                      {alert.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-blue-500" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{formatDate(transaction.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <Badge 
                      variant={transaction.status === 'completed' ? 'success' : 'warning'}
                    >
                      {transaction.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investment Plans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-purple-500" />
            Investment Plans Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Plan Name</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Total Amount</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Investors</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">ROI</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {investmentPlans.map((plan) => (
                  <tr key={plan.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{plan.name}</td>
                    <td className="py-3 px-4">{formatCurrency(plan.totalAmount)}</td>
                    <td className="py-3 px-4">{plan.investors}</td>
                    <td className="py-3 px-4 font-medium text-green-600">{plan.roi}%</td>
                    <td className="py-3 px-4">
                      <Badge 
                        variant={plan.status === 'active' ? 'success' : 'info'}
                      >
                        {plan.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Platform Commission</span>
                <span className="font-medium">{formatCurrency(167890)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Investment Returns</span>
                <span className="font-medium">{formatCurrency(financeStats.investmentReturns)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vehicle Fees</span>
                <span className="font-medium">{formatCurrency(89450)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Other Income</span>
                <span className="font-medium">{formatCurrency(23450)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Driver Payments</span>
                <span className="font-medium">{formatCurrency(234500)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Vehicle Maintenance</span>
                <span className="font-medium">{formatCurrency(45600)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Operations</span>
                <span className="font-medium">{formatCurrency(67800)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Marketing</span>
                <span className="font-medium">{formatCurrency(23400)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Cash Flow</span>
                <span className="font-medium text-green-600">{formatCurrency(financeStats.cashFlow)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Expense Ratio</span>
                <span className="font-medium">{financeStats.expenseRatio}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Growth Rate</span>
                <span className="font-medium text-green-600">+15.3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Risk Score</span>
                <span className="font-medium text-green-600">Low</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Financial Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Financial Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn btn-primary flex flex-col items-center p-4">
              <CreditCard className="h-6 w-6 mb-2" />
              <span className="text-sm">Process Payments</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center p-4">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Create Investment Plan</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center p-4">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span className="text-sm">Financial Reports</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center p-4">
              <PieChart className="h-6 w-6 mb-2" />
              <span className="text-sm">Budget Analysis</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}