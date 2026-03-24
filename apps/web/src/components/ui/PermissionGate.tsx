import type { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { can, isAtLeast } from '../../lib/permissions';
import type { Permission, Role } from '../../lib/permissions';

interface PermissionGateProps {
  children: ReactNode;
  /** Render only if user has this permission */
  permission?: Permission;
  /** Render only if user role is at least this level */
  minRole?: Role;
  /** What to render when access is denied (default: nothing) */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on the current user's role/permissions.
 * In dev mode (no auth), always renders children.
 */
export function PermissionGate({ children, permission, minRole, fallback = null }: PermissionGateProps) {
  const { user } = useAuth();

  // Dev bypass — always show everything
  if (import.meta.env.DEV && !user) return <>{children}</>;

  if (permission && !can(user, permission)) return <>{fallback}</>;
  if (minRole && !isAtLeast(user, minRole)) return <>{fallback}</>;

  return <>{children}</>;
}
