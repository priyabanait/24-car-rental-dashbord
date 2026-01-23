import { useEffect, useState } from 'react';
import {
  Users,
  Building,
  UserCheck,
  CalendarCheck,
  MessageSquare,
  Megaphone,
  BarChart3,
  FileText,
  List,
  LogIn,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function SocietyAdminDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    residents: 0,
    security: 0,
    towers: 0,
    flats: 0,
    pendingApprovals: 0,
    openTickets: 0,
    activeAmenities: 0,
    polls: 0,
    visitorsToday: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);

        /**
         * 🔹 Replace these with real APIs later
         */
        const mockStats = {
          residents: 248,
          security: 12,
          towers: 5,
          flats: 320,
          pendingApprovals: 9,
          openTickets: 6,
          activeAmenities: 4,
          polls: 2,
          visitorsToday: 37
        };

        const mockActivities = [
          { id: 1, text: 'New resident approval request', time: '10 minutes ago' },
          { id: 2, text: 'Amenity booked: Club House', time: '1 hour ago' },
          { id: 3, text: 'Helpdesk ticket resolved', time: '3 hours ago' },
          { id: 4, text: 'New poll published', time: 'Yesterday' }
        ];

        const mockAlerts = [];

        if (mockStats.pendingApprovals > 0) {
          mockAlerts.push({
            id: 1,
            type: 'warning',
            message: `${mockStats.pendingApprovals} pending approval requests`
          });
        }

        if (mockStats.openTickets > 5) {
          mockAlerts.push({
            id: 2,
            type: 'info',
            message: `${mockStats.openTickets} helpdesk tickets open`
          });
        }

        if (mounted) {
          setStats(mockStats);
          setRecentActivities(mockActivities);
          setAlerts(mockAlerts);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load society dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-3" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">
          Welcome, {user?.name || 'Admin'}
        </h1>
        <p className="text-blue-100">
          Society administration overview & controls
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Residents" value={stats.residents} icon={Users} />
        <StatCard title="Security Staff" value={stats.security} icon={UserCheck} />
        <StatCard title="Towers" value={stats.towers} icon={Building} />
        <StatCard title="Flats" value={stats.flats} icon={Building} />
        <StatCard title="Pending Approvals" value={stats.pendingApprovals} icon={AlertTriangle} />
        <StatCard title="Open Tickets" value={stats.openTickets} icon={MessageSquare} />
        <StatCard title="Active Amenities" value={stats.activeAmenities} icon={CalendarCheck} />
        <StatCard title="Visitors Today" value={stats.visitorsToday} icon={LogIn} />
      </div>

     

      {/* QUICK LINKS */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <QuickBtn icon={UserCheck} label="Approvals" />
            <QuickBtn icon={Building} label="Society Setup" />
            <QuickBtn icon={CalendarCheck} label="Amenities" />
            <QuickBtn icon={MessageSquare} label="Helpdesk" />
            <QuickBtn icon={Megaphone} label="Announcements" />
            <QuickBtn icon={BarChart3} label="Polls" />
            <QuickBtn icon={FileText} label="Maintenance" />
            <QuickBtn icon={List} label="Directory" />
            <QuickBtn icon={LogIn} label="Visitors" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ======================
   SMALL REUSABLE PARTS
====================== */

function StatCard({ title, value, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-6 flex items-center">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        <div className="ml-4">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickBtn({ icon: Icon, label }) {
  return (
    <button className="border rounded-lg p-4 flex flex-col items-center hover:bg-gray-50 transition">
      <Icon className="h-6 w-6 text-blue-600 mb-2" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}
