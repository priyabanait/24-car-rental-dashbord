'use client';

import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PERMISSIONS } from '../../utils/permissions';
import { cn } from '../../utils';

import {
  LayoutDashboard,
  Building,
  UserCheck,
  Home,
  Users,
  CalendarCheck,
  MessageSquare,
  Megaphone,
  BarChart3,
  FileText,
  List,
  LogIn,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

/* =========================
   SOCIETY ADMIN NAVIGATION
========================= */

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    permission: PERMISSIONS.SOCIETY_ADMIN_VIEW
  },
  {
    name: 'Society Management',
    icon: Building,
    permission: PERMISSIONS.SOCIETY_MANAGE,
    children: [
      {
        name: 'Towers & Flats',
        href: '/towersflats',
        permission: PERMISSIONS.SOCIETY_MANAGE
      },
      {
        name: 'Residents',
        href: '/society/manage/residents',
        permission: PERMISSIONS.SOCIETY_MANAGE
      }
    ]
  },
  {
    name: 'Approvals',
    icon: UserCheck,
    permission: PERMISSIONS.SOCIETY_APPROVALS,
    children: [
      {
        name: 'Residents & Security',
        href: '/society/approvals/users',
        permission: PERMISSIONS.SOCIETY_APPROVALS
      },
      {
        name: 'Family / Vehicles / Maids',
        href: '/society/approvals/members',
        permission: PERMISSIONS.SOCIETY_APPROVALS
      }
    ]
  },
  
  {
    name: 'Amenities',
    href: '/society/amenities',
    icon: CalendarCheck,
    permission: PERMISSIONS.AMENITIES_VIEW
  },
  {
    name: 'Helpdesk',
    href: '/society/helpdesk',
    icon: MessageSquare,
    permission: PERMISSIONS.HELPDESK_VIEW
  },
  {
    name: 'Announcements & Wall',
    href: '/society/announcements',
    icon: Megaphone,
    permission: PERMISSIONS.ANNOUNCEMENTS_VIEW
  },
  {
    name: 'Polls & Results',
    href: '/society/polls',
    icon: BarChart3,
    permission: PERMISSIONS.POLLS_VIEW
  },
  {
    name: 'Maintenance Reports',
    href: '/society/maintenance',
    icon: FileText,
    permission: PERMISSIONS.MAINTENANCE_REPORTS
  },
  {
    name: 'Directory Controls',
    href: '/society/directory',
    icon: List,
    permission: PERMISSIONS.DIRECTORY_VIEW
  },
  {
    name: 'Visitor & Event Logs',
    href: '/society/visitors',
    icon: LogIn,
    permission: PERMISSIONS.VISITOR_LOGS
  }
];

/* =========================
   SIDEBAR COMPONENT
========================= */

export default function Sidebar({ collapsed }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleExpanded = (name) => {
    const updated = new Set(expandedItems);
    updated.has(name) ? updated.delete(name) : updated.add(name);
    setExpandedItems(updated);
  };

  const isActive = (href) =>
    location.pathname === href ||
    location.pathname.startsWith(href + '/');

  const hasActiveChild = (children) =>
    children?.some((c) => isActive(c.href));

  return (
    <div
      className={cn(
        'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* LOGO */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <div
          className="cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <img
            src="/Urbankey.jpeg"
            alt="Urbankey Logo"
            className={cn(
              'object-contain',
              collapsed ? 'w-8 h-8' : 'w-20 h-12'
            )}
          />
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const expanded = expandedItems.has(item.name);
          const activeChild = hasActiveChild(item.children);

          if (item.children) {
            return (
              <div key={item.name}>
                <button
                  onClick={() => !collapsed && toggleExpanded(item.name)}
                  className={cn(
                    'sidebar-link w-full justify-between',
                    (expanded || activeChild) && 'active'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="h-5 w-5 mr-3" />
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                  {!collapsed &&
                    (expanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    ))}
                </button>

                {!collapsed && expanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.href}
                        to={child.href}
                        className={({ isActive }) =>
                          cn(
                            'block px-3 py-2 text-sm rounded-md text-gray-600 hover:bg-gray-50',
                            isActive && 'bg-primary-50 text-primary-700'
                          )
                        }
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn('sidebar-link', isActive && 'active')
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {!collapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* USER INFO */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {user?.name?.charAt(0)}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
