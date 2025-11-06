import { useState, useEffect } from 'react';
import { 
  Car, 
  Users, 
  MapPin, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils';

export default function FleetManagerDashboard() {
  const [fleetStats, setFleetStats] = useState({
    totalDrivers: 324,
    activeDrivers: 287,
    pendingKyc: 12,
    totalVehicles: 298,
    activeVehicles: 245,
    maintenanceVehicles: 8,
    avgRating: 4.6,
    totalTrips: 15678,
    todayTrips: 89,
    totalRevenue: 567890
  });

  const [recentDrivers, setRecentDrivers] = useState([
    { id: 1, name: 'Arjun Kumar', status: 'pending', joinDate: '2024-10-25', kycStatus: 'pending' },
    { id: 2, name: 'Priya Sharma', status: 'active', joinDate: '2024-10-24', kycStatus: 'verified' },
    { id: 3, name: 'Rakesh Singh', status: 'pending', joinDate: '2024-10-23', kycStatus: 'pending' },
    { id: 4, name: 'Meera Gupta', status: 'active', joinDate: '2024-10-22', kycStatus: 'verified' },
  ]);

  const [vehicleAlerts, setVehicleAlerts] = useState([
    { id: 1, vehicle: 'KA-05-AB-1234', issue: 'Maintenance Due', priority: 'medium', dueDate: '2024-10-28' },
    { id: 2, vehicle: 'KA-05-CD-5678', issue: 'Insurance Expiring', priority: 'high', dueDate: '2024-10-26' },
    { id: 3, vehicle: 'KA-05-EF-9012', issue: 'PUC Renewal', priority: 'medium', dueDate: '2024-10-30' },
  ]);

  const [topPerformers, setTopPerformers] = useState([
    { id: 1, name: 'Suresh Kumar', trips: 45, rating: 4.9, earnings: 12500 },
    { id: 2, name: 'Ramesh Gupta', trips: 42, rating: 4.8, earnings: 11800 },
    { id: 3, name: 'Vikash Singh', trips: 38, rating: 4.7, earnings: 10900 },
    { id: 4, name: 'Amit Sharma', trips: 35, rating: 4.6, earnings: 10200 },
  ]);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Fleet Manager Dashboard</h1>
        <p className="text-green-100">Manage drivers, vehicles, and fleet operations</p>
      </div>

      {/* Fleet Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                <p className="text-2xl font-bold text-gray-900">{fleetStats.totalDrivers}</p>
                <p className="text-xs text-green-600">{fleetStats.activeDrivers} active</p>
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
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{fleetStats.totalVehicles}</p>
                <p className="text-xs text-green-600">{fleetStats.activeVehicles} active</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Trips</p>
                <p className="text-2xl font-bold text-gray-900">{fleetStats.totalTrips}</p>
                <p className="text-xs text-green-600">{fleetStats.todayTrips} today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Fleet Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(fleetStats.totalRevenue)}</p>
                <p className="text-xs text-green-600">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Drivers & Vehicle Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                Recent Driver Applications
              </span>
              <Badge variant="info">{fleetStats.pendingKyc} pending KYC</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDrivers.map((driver) => (
                <div key={driver.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{driver.name}</p>
                    <p className="text-sm text-gray-600">Applied: {formatDate(driver.joinDate)}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={driver.kycStatus === 'verified' ? 'success' : 'warning'}
                    >
                      {driver.kycStatus}
                    </Badge>
                    <Badge 
                      variant={driver.status === 'active' ? 'success' : 'warning'}
                    >
                      {driver.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 btn btn-outline btn-sm">
              View All Applications
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                Vehicle Alerts
              </span>
              <Badge variant="warning">{vehicleAlerts.length} alerts</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vehicleAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                  alert.priority === 'high' ? 'border-red-500 bg-red-50' :
                  'border-yellow-500 bg-yellow-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{alert.vehicle}</p>
                      <p className="text-sm text-gray-600">{alert.issue}</p>
                      <p className="text-xs text-gray-500">Due: {formatDate(alert.dueDate)}</p>
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
            <button className="w-full mt-3 btn btn-outline btn-sm">
              View All Alerts
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
            Top Performing Drivers This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Driver</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Trips</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Rating</th>
                  <th className="text-left py-2 px-4 font-medium text-gray-700">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((driver, index) => (
                  <tr key={driver.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {index + 1}
                        </div>
                        {driver.name}
                      </div>
                    </td>
                    <td className="py-3 px-4">{driver.trips}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <span className="text-yellow-400 mr-1">★</span>
                        {driver.rating}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{formatCurrency(driver.earnings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Fleet Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="btn btn-primary flex flex-col items-center p-4">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Add New Driver</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center p-4">
              <Car className="h-6 w-6 mb-2" />
              <span className="text-sm">Vehicle Assignment</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center p-4">
              <CheckCircle className="h-6 w-6 mb-2" />
              <span className="text-sm">KYC Verification</span>
            </button>
            <button className="btn btn-outline flex flex-col items-center p-4">
              <MapPin className="h-6 w-6 mb-2" />
              <span className="text-sm">Fleet Tracking</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Driver Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="font-medium">{fleetStats.avgRating}/5</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Drivers</span>
                <span className="font-medium text-green-600">{fleetStats.activeDrivers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Pending KYC</span>
                <span className="font-medium text-orange-600">{fleetStats.pendingKyc}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Vehicles</span>
                <span className="font-medium text-green-600">{fleetStats.activeVehicles}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Under Maintenance</span>
                <span className="font-medium text-orange-600">{fleetStats.maintenanceVehicles}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Fleet Utilization</span>
                <span className="font-medium">82%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today's Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Trips Completed</span>
                <span className="font-medium">{fleetStats.todayTrips}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Active Trips</span>
                <span className="font-medium text-blue-600">23</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Drivers Online</span>
                <span className="font-medium text-green-600">156</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}