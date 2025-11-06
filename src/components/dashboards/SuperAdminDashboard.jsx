import { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { formatCurrency, formatDate } from '../../utils';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 156,
    totalDrivers: 1243,
    totalVehicles: 987,
    totalRevenue: 2456780,
    pendingKyc: 45,
    activeTrips: 234,
    systemHealth: 98.5,
    lastBackup: new Date().toISOString()
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'user_created', message: 'New admin user created: Sarah Johnson', time: '2 minutes ago' },
    { id: 2, type: 'driver_approved', message: 'Driver KYC approved: Rahul Kumar', time: '15 minutes ago' },
    { id: 3, type: 'system_alert', message: 'High server load detected', time: '1 hour ago' },
    { id: 4, type: 'payment_processed', message: 'Bulk payments processed: ₹1,45,000', time: '2 hours ago' },
  ]);

  const [systemAlerts, setSystemAlerts] = useState([
    { id: 1, type: 'warning', message: 'Server disk space is 85% full', priority: 'high' },
    { id: 2, type: 'info', message: '23 drivers pending verification', priority: 'medium' },
    { id: 3, type: 'success', message: 'Backup completed successfully', priority: 'low' },
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Super Admin Dashboard</h1>
        <p className="text-blue-100">Complete system overview and administrative controls</p>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Admin Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                <p className="text-xs text-green-600">+12% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Car className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDrivers}</p>
                <p className="text-xs text-green-600">+8% from last month</p>
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
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-green-600">+15% from last month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-gray-900">{stats.systemHealth}%</p>
                <p className="text-xs text-green-600">All systems operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.priority === 'high' ? 'border-red-500 bg-red-50' :
                  alert.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">Priority: {alert.priority}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                    activity.type === 'user_created' ? 'bg-blue-100' :
                    activity.type === 'driver_approved' ? 'bg-green-100' :
                    activity.type === 'system_alert' ? 'bg-red-100' :
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
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <button className="btn btn-outline flex flex-col items-center p-4">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Manage Users</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center p-4">
              <Car className="h-6 w-6 mb-2" />
              <span className="text-sm">Driver Reports</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center p-4">
              <DollarSign className="h-6 w-6 mb-2" />
              <span className="text-sm">Financial Reports</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center p-4">
              <AlertTriangle className="h-6 w-6 mb-2" />
              <span className="text-sm">System Logs</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center p-4">
              <CheckCircle className="h-6 w-6 mb-2" />
              <span className="text-sm">Backup System</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center p-4">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Analytics</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Driver Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Drivers</span>
                <span className="font-medium">1,156</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending KYC</span>
                <span className="font-medium text-orange-600">{stats.pendingKyc}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="font-medium">4.6/5</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Financial Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Today's Revenue</span>
                <span className="font-medium">{formatCurrency(87650)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending Payments</span>
                <span className="font-medium text-orange-600">{formatCurrency(23450)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-medium">{formatCurrency(1245780)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Trips</span>
                <span className="font-medium">{stats.activeTrips}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Server Uptime</span>
                <span className="font-medium text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Backup</span>
                <span className="font-medium">{formatDate(stats.lastBackup)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}