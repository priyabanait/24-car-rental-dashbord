import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  Lock,
  Unlock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { ROLES, PERMISSIONS, getPermissionsByCategory } from '../../utils/permissions';

export default function RoleManagement() {
  const { hasPermission } = useAuth();
  const [selectedRole, setSelectedRole] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'permissions'

  const permissionCategories = getPermissionsByCategory();

  const canManageRoles = hasPermission('admin.roles');

  const getRoleStats = (role) => {
    // Mock data for demonstration
    const userCounts = {
      'super_admin': 1,
      'fleet_manager': 3,
      'finance_admin': 2,
      'hr_manager': 1,
      'operations_manager': 2,
      'support_agent': 4,
      'auditor': 1
    };
    
    return {
      userCount: userCounts[role.id] || 0,
      permissionCount: role.permissions.length
    };
  };

  const formatPermissionName = (permission) => {
    const parts = permission.split('.');
    const action = parts[1]?.replace(/_/g, ' ') || '';
    const category = parts[0]?.replace(/_/g, ' ') || '';
    return `${action.charAt(0).toUpperCase() + action.slice(1)} ${category}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage roles and permissions for admin users
          </p>
        </div>
        {canManageRoles && (
          <div className="mt-4 lg:mt-0 flex space-x-3">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'permissions' : 'list')}
              className="btn btn-outline"
            >
              {viewMode === 'list' ? 'View Permissions' : 'View Roles'}
            </button>
            <button className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Roles</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(ROLES).length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Lock className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Permissions</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(PERMISSIONS).length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(permissionCategories).length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Roles</p>
              <p className="text-2xl font-bold text-gray-900">{Object.keys(ROLES).length}</p>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* Roles List View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.values(ROLES).map((role) => {
            const stats = getRoleStats(role);
            const colorClass = {
              red: 'border-red-200 bg-red-50',
              blue: 'border-blue-200 bg-blue-50',
              green: 'border-green-200 bg-green-50',
              purple: 'border-purple-200 bg-purple-50',
              orange: 'border-orange-200 bg-orange-50',
              indigo: 'border-indigo-200 bg-indigo-50',
              gray: 'border-gray-200 bg-gray-50'
            }[role.color] || 'border-gray-200 bg-gray-50';

            return (
              <div key={role.id} className={`card border-2 ${colorClass}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-${role.color}-100`}>
                      <Shield className={`h-6 w-6 text-${role.color}-600`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-500">{role.description}</p>
                    </div>
                  </div>
                  {canManageRoles && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => setSelectedRole(role)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-yellow-600 hover:text-yellow-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      {role.id !== 'super_admin' && (
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.userCount}</div>
                    <div className="text-sm text-gray-500">Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.permissionCount}</div>
                    <div className="text-sm text-gray-500">Permissions</div>
                  </div>
                </div>

                <div className="mt-4">
                  <button 
                    onClick={() => setSelectedRole(role)}
                    className="btn btn-outline w-full"
                  >
                    View Permissions
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Permissions Matrix View */
        <div className="card p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permission
                  </th>
                  {Object.values(ROLES).map(role => (
                    <th key={role.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex flex-col items-center">
                        <Shield className="h-4 w-4 mb-1" />
                        <span className="truncate w-20">{role.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(permissionCategories).map(([category, permissions]) => (
                  <React.Fragment key={category}>
                    <tr className="bg-gray-100">
                      <td colSpan={Object.keys(ROLES).length + 1} className="px-6 py-2">
                        <h4 className="text-sm font-semibold text-gray-900 uppercase">
                          {category.replace('_', ' ')}
                        </h4>
                      </td>
                    </tr>
                    {permissions.map(permission => (
                      <tr key={permission.value}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPermissionName(permission.value)}
                        </td>
                        {Object.values(ROLES).map(role => (
                          <td key={role.id} className="px-3 py-4 whitespace-nowrap text-center">
                            {role.permissions.includes(permission.value) ? (
                              <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            ) : (
                              <XCircle className="h-5 w-5 text-gray-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Details Modal */}
      {selectedRole && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{selectedRole.name} Permissions</h3>
              <button 
                onClick={() => setSelectedRole(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600">{selectedRole.description}</p>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {Object.entries(permissionCategories).map(([category, permissions]) => {
                const categoryPermissions = permissions.filter(p => 
                  selectedRole.permissions.includes(p.value)
                );
                
                if (categoryPermissions.length === 0) return null;

                return (
                  <div key={category} className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 uppercase">
                      {category.replace('_', ' ')}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {categoryPermissions.map(permission => (
                        <div key={permission.value} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">
                            {formatPermissionName(permission.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => setSelectedRole(null)}
                className="btn btn-secondary"
              >
                Close
              </button>
              {canManageRoles && (
                <button className="btn btn-primary">
                  Edit Role
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add React import for Fragment
import React from 'react';