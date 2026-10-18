// ============================================================
// @nexus-one/auth — Role-Based Access Control (RBAC)
// ============================================================

export type Role = 'owner' | 'admin' | 'member' | 'viewer';

export const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 40,
  admin: 30,
  member: 20,
  viewer: 10,
};

export type Permission =
  | 'org:read'
  | 'org:update'
  | 'org:delete'
  | 'org:billing'
  | 'member:read'
  | 'member:invite'
  | 'member:update'
  | 'member:remove'
  | 'workspace:read'
  | 'workspace:create'
  | 'workspace:update'
  | 'workspace:delete'
  | 'apikey:read'
  | 'apikey:create'
  | 'apikey:revoke'
  | 'audit:read'
  | 'product:access';

export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  owner: [
    'org:read',
    'org:update',
    'org:delete',
    'org:billing',
    'member:read',
    'member:invite',
    'member:update',
    'member:remove',
    'workspace:read',
    'workspace:create',
    'workspace:update',
    'workspace:delete',
    'apikey:read',
    'apikey:create',
    'apikey:revoke',
    'audit:read',
    'product:access',
  ],
  admin: [
    'org:read',
    'org:update',
    'member:read',
    'member:invite',
    'member:update',
    'member:remove',
    'workspace:read',
    'workspace:create',
    'workspace:update',
    'workspace:delete',
    'apikey:read',
    'apikey:create',
    'apikey:revoke',
    'audit:read',
    'product:access',
  ],
  member: [
    'org:read',
    'member:read',
    'workspace:read',
    'workspace:create',
    'workspace:update',
    'apikey:read',
    'product:access',
  ],
  viewer: [
    'org:read',
    'member:read',
    'workspace:read',
    'product:access',
  ],
};

/**
 * Checks whether a role has a specific permission.
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Checks whether userRole is at least requiredRole in the hierarchy.
 */
export function isRoleAtLeast(userRole: Role, requiredRole: Role): boolean {
  return (ROLE_HIERARCHY[userRole] ?? 0) >= (ROLE_HIERARCHY[requiredRole] ?? 0);
}
