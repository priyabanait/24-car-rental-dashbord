import { useAuth } from '../../contexts/AuthContext';

/**
 * Permission Guard Component
 * Conditionally renders children based on user permissions
 */
export function PermissionGuard({ 
  permission, 
  permissions, 
  requireAll = false, 
  fallback = null, 
  children 
}) {
  const { hasPermission, hasAnyPermissions, hasAllRequiredPermissions } = useAuth();

  let hasAccess = false;

  if (permission) {
    // Single permission check
    hasAccess = hasPermission(permission);
  } else if (permissions && Array.isArray(permissions)) {
    // Multiple permissions check
    if (requireAll) {
      hasAccess = hasAllRequiredPermissions(permissions);
    } else {
      hasAccess = hasAnyPermissions(permissions);
    }
  }

  return hasAccess ? children : fallback;
}

/**
 * Role Guard Component
 * Conditionally renders children based on user roles
 */
export function RoleGuard({ 
  role, 
  roles, 
  requireAll = false, 
  fallback = null, 
  children 
}) {
  const { user } = useAuth();

  if (!user) return fallback;

  let hasAccess = false;

  if (role) {
    // Single role check
    hasAccess = user.role === role;
  } else if (roles && Array.isArray(roles)) {
    // Multiple roles check
    if (requireAll) {
      hasAccess = roles.every(r => user.role === r);
    } else {
      hasAccess = roles.includes(user.role);
    }
  }

  return hasAccess ? children : fallback;
}

/**
 * Super Admin Guard Component
 * Only renders children if user is super admin
 */
export function SuperAdminGuard({ fallback = null, children }) {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin() ? children : fallback;
}

/**
 * Protected Button Component
 * Button that's only visible/enabled based on permissions
 */
export function ProtectedButton({ 
  permission, 
  permissions, 
  role, 
  roles, 
  requireAll = false,
  disabled = false,
  className = '',
  children,
  ...props 
}) {
  const { hasPermission, hasAnyPermissions, hasAllRequiredPermissions, user } = useAuth();

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
    hasAccess = user?.role === role;
  } else if (hasAccess && roles && Array.isArray(roles)) {
    if (requireAll) {
      hasAccess = roles.every(r => user?.role === r);
    } else {
      hasAccess = roles.includes(user?.role);
    }
  }

  if (!hasAccess) return null;

  return (
    <button
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Protected Link Component
 * Link that's only visible based on permissions
 */
export function ProtectedLink({ 
  permission, 
  permissions, 
  role, 
  roles, 
  requireAll = false,
  className = '',
  children,
  ...props 
}) {
  const { hasPermission, hasAnyPermissions, hasAllRequiredPermissions, user } = useAuth();

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
    hasAccess = user?.role === role;
  } else if (hasAccess && roles && Array.isArray(roles)) {
    if (requireAll) {
      hasAccess = roles.every(r => user?.role === r);
    } else {
      hasAccess = roles.includes(user?.role);
    }
  }

  if (!hasAccess) return null;

  return (
    <a className={className} {...props}>
      {children}
    </a>
  );
}

/**
 * Permission Status Component
 * Shows different content based on permission status
 */
export function PermissionStatus({ 
  permission, 
  permissions, 
  requireAll = false,
  granted,
  denied,
  loading 
}) {
  const { hasPermission, hasAnyPermissions, hasAllRequiredPermissions, loading: authLoading } = useAuth();

  if (authLoading) return loading || null;

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions && Array.isArray(permissions)) {
    if (requireAll) {
      hasAccess = hasAllRequiredPermissions(permissions);
    } else {
      hasAccess = hasAnyPermissions(permissions);
    }
  }

  return hasAccess ? granted : denied;
}

export default {
  PermissionGuard,
  RoleGuard,
  SuperAdminGuard,
  ProtectedButton,
  ProtectedLink,
  PermissionStatus
};