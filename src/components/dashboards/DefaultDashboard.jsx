import { useState } from 'react';
import { 
  Users, 
  Car, 
  TrendingUp, 
  DollarSign, 
  ArrowUpRight,
  MessageSquare,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils';
import { useAuth } from '../../contexts/AuthContext';

export default function DefaultDashboard() {
  const { user } = useAuth();
  
  const [stats] = useState({
    totalDrivers: 1243,
    activeDrivers: 987,
    totalRevenue: 2456780,
    totalTrips: 15678,
    pendingKyc: 45,
    monthlyGrowth: 15.3,
    openTickets: 23,
    resolvedTickets: 89
  });

  const [recentActivities] = useState([
    { id: 1, type: 'driver', message: 'New driver registered: Rajesh Kumar', time: '5 minutes ago' },
    { id: 2, type: 'payment', message: 'Payment processed: ₹12,500', time: '15 minutes ago' },
    { id: 3, type: 'ticket', message: 'Support ticket resolved: #TKT-456', time: '30 minutes ago' },
    { id: 4, type: 'kyc', message: 'KYC approved for: Priya Sharma', time: '1 hour ago' },
    { id: 5, type: 'vehicle', message: 'Vehicle assigned: KA-05-AB-1234', time: '2 hours ago' }
  ]);

  // Role-specific greeting
  const getRoleGreeting = (role) => {
    const greetings = {
      'hr_manager': 'Human Resources Dashboard',
      'operations_manager': 'Operations Management Center',
      'support_agent': 'Customer Support Dashboard',
      'auditor': 'Audit & Compliance Center'
    };
    return greetings[role] || 'Admin Dashboard';
  };

  // Role-specific quick actions
  const getQuickActions = (role) => {
    const actions = {
      'hr_manager': [
        { title: 'Add Driver', description: 'Register new driver', icon: Users, color: 'bg-blue-50 hover:bg-blue-100 text-blue-600' },
        { title: 'KYC Review', description: 'Review pending KYC', icon: FileText, color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600' },
        { title: 'Employee Reports', description: 'Generate HR reports', icon: TrendingUp, color: 'bg-green-50 hover:bg-green-100 text-green-600' },
        { title: 'Attendance', description: 'Track attendance', icon: Clock, color: 'bg-purple-50 hover:bg-purple-100 text-purple-600' }
      ],
      'operations_manager': [
        { title: 'Vehicle Status', description: 'Check vehicle status', icon: Car, color: 'bg-blue-50 hover:bg-blue-100 text-blue-600' },
        { title: 'Trip Monitor', description: 'Monitor active trips', icon: TrendingUp, color: 'bg-green-50 hover:bg-green-100 text-green-600' },
        { title: 'Driver Support', description: 'Handle driver issues', icon: MessageSquare, color: 'bg-orange-50 hover:bg-orange-100 text-orange-600' },
        { title: 'Performance', description: 'View performance', icon: CheckCircle, color: 'bg-purple-50 hover:bg-purple-100 text-purple-600' }
      ],
      'support_agent': [
        { title: 'Open Tickets', description: 'View support tickets', icon: MessageSquare, color: 'bg-red-50 hover:bg-red-100 text-red-600' },
        { title: 'Driver Help', description: 'Assist drivers', icon: Users, color: 'bg-blue-50 hover:bg-blue-100 text-blue-600' },
        { title: 'FAQ Update', description: 'Update knowledge base', icon: FileText, color: 'bg-green-50 hover:bg-green-100 text-green-600' },
        { title: 'Escalate Issues', description: 'Escalate to management', icon: ArrowUpRight, color: 'bg-orange-50 hover:bg-orange-100 text-orange-600' }
      ],
      'auditor': [
        { title: 'Audit Reports', description: 'Generate audit reports', icon: FileText, color: 'bg-blue-50 hover:bg-blue-100 text-blue-600' },
        { title: 'Compliance Check', description: 'Check compliance status', icon: CheckCircle, color: 'bg-green-50 hover:bg-green-100 text-green-600' },
        { title: 'Risk Analysis', description: 'Analyze risk factors', icon: TrendingUp, color: 'bg-orange-50 hover:bg-orange-100 text-orange-600' },
        { title: 'Data Export', description: 'Export audit data', icon: ArrowUpRight, color: 'bg-purple-50 hover:bg-purple-100 text-purple-600' }
      ]
    };

    return actions[role] || [
      { title: 'Dashboard', description: 'View overview', icon: TrendingUp, color: 'bg-blue-50 hover:bg-blue-100 text-blue-600' },
      { title: 'Reports', description: 'Generate reports', icon: FileText, color: 'bg-green-50 hover:bg-green-100 text-green-600' },
      { title: 'Settings', description: 'Manage settings', icon: CheckCircle, color: 'bg-purple-50 hover:bg-purple-100 text-purple-600' },
      { title: 'Help', description: 'Get support', icon: MessageSquare, color: 'bg-orange-50 hover:bg-orange-100 text-orange-600' }
    ];
  };

  const quickActions = getQuickActions(user?.role);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">{getRoleGreeting(user?.role)}</h1>
        <p className="text-indigo-100">Welcome back, {user?.name}</p>
      </div>

      {/* General Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDrivers}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+12% from last month</span>
                </div>
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
                <p className="text-sm font-medium text-gray-600">Active Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeDrivers}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+8% from last month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+{stats.monthlyGrowth}% growth</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTrips.toLocaleString()}</p>
                <div className="flex items-center mt-1">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600 ml-1">+156 today</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Recent Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-1 rounded-full ${
                    activity.type === 'driver' ? 'bg-blue-100' :
                    activity.type === 'payment' ? 'bg-green-100' :
                    activity.type === 'ticket' ? 'bg-red-100' :
                    activity.type === 'kyc' ? 'bg-yellow-100' :
                    'bg-purple-100'
                  }`}>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <button
                    key={index}
                    className={`p-4 text-left rounded-lg transition-colors ${action.color}`}
                  >
                    <Icon className="h-6 w-6 mb-2" />
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {user?.role === 'support_agent' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Open Tickets</span>
                    <span className="font-medium text-red-600">{stats.openTickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Resolved Today</span>
                    <span className="font-medium text-green-600">{stats.resolvedTickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Response Time</span>
                    <span className="font-medium">4.2 min</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Active</span>
                    <span className="font-medium text-green-600">{stats.activeDrivers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Pending KYC</span>
                    <span className="font-medium text-orange-600">{stats.pendingKyc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">This Month</span>
                    <span className="font-medium">+{stats.monthlyGrowth}%</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">New Registrations</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Completed Trips</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Revenue Generated</span>
                <span className="font-medium">{formatCurrency(87650)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">System Health</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="text-sm font-medium">{formatDate(new Date())}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-sm font-medium text-green-600">99.9%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}