import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { AlertTriangle } from 'lucide-react';

/**
 * Route Guard Component
 * Protects routes based on permissions or roles
 */
export function RouteGuard({ 
  permission, 
  permissions, 
  role, 
  roles, 
  requireAll = false,
  redirectTo = '/dashboard',
  fallback,
  children 
}) {
  const { hasPermission, hasAnyPermissions, hasAllRequiredPermissions, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  let hasAccess = true;

  // Check permissions
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && Array.isArray(permissions)) {
    if (requireAll) {
      hasAccess = hasAllRequiredPermissions(permissions);
    } else {
      hasAccess = hasAnyPermissions(permissions);
    }
  }

  // Check roles
  if (hasAccess && role) {
    hasAccess = user.role === role;
  } else if (hasAccess && roles && Array.isArray(roles)) {
    if (requireAll) {
      hasAccess = roles.every(r => user.role === r);
    } else {
      hasAccess = roles.includes(user.role);
    }
  }

  if (!hasAccess) {
    if (fallback) {
      return fallback;
    }

    // Show unauthorized page
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="btn btn-primary w-full"
            >
              Go Back
            </button>
            <button
              onClick={() => window.location.href = redirectTo}
              className="btn btn-secondary w-full"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}

/**
 * Super Admin Route Guard
 * Only allows super admins to access the route
 */
export function SuperAdminRoute({ redirectTo = '/dashboard', fallback, children }) {
  const { isSuperAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isSuperAdmin()) {
    if (fallback) return fallback;
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default { RouteGuard, SuperAdminRoute };