import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export default function Breadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const breadcrumbNameMap = {
    dashboard: 'Dashboard',
    drivers: 'Drivers',
    vehicles: 'Vehicles',
    plans: 'Plans',
    investments: 'Investments',
    payments: 'Payments',
    reports: 'Reports',
    admin: 'Admin',
    tickets: 'Tickets',
    hr: 'HR',
    settings: 'Settings',
    add: 'Add',
    edit: 'Edit',
    kyc: 'KYC',
    performance: 'Performance',
    documents: 'Documents',
    assignments: 'Assignments',
    analytics: 'Analytics',
    investors: 'Investors',
    transactions: 'Transactions',
    returns: 'Returns',
    financial: 'Financial',
    custom: 'Custom',
    users: 'Users',
    roles: 'Roles',
    categories: 'Categories',
    employees: 'Employees',
    attendance: 'Attendance',
    payroll: 'Payroll',
    general: 'General',
    notifications: 'Notifications',
    logs: 'Logs',
    backup: 'Backup'
  };

  return (
    <nav className="flex mb-6" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-primary-600"
          >
            <Home className="w-4 h-4 mr-2" />
            Dashboard
          </Link>
        </li>
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1;
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;

          return (
            <li key={to}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400" />
                {last ? (
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                    {breadcrumbNameMap[value] || value}
                  </span>
                ) : (
                  <Link
                    to={to}
                    className="ml-1 text-sm font-medium text-gray-700 hover:text-primary-600 md:ml-2"
                  >
                    {breadcrumbNameMap[value] || value}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}