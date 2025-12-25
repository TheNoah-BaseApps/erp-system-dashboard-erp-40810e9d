/**
 * Role-based access control utilities
 */

export const ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  SALES_REP: 'Sales Rep',
  VIEWER: 'Viewer',
};

export const PERMISSIONS = {
  // Product permissions
  CREATE_PRODUCT: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_PRODUCT: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_REP, ROLES.VIEWER],
  UPDATE_PRODUCT: [ROLES.ADMIN, ROLES.MANAGER],
  DELETE_PRODUCT: [ROLES.ADMIN, ROLES.MANAGER],

  // Product cost permissions
  CREATE_COST: [ROLES.ADMIN, ROLES.MANAGER],
  VIEW_COST: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_REP, ROLES.VIEWER],
  UPDATE_COST: [ROLES.ADMIN, ROLES.MANAGER],
  DELETE_COST: [ROLES.ADMIN, ROLES.MANAGER],

  // Customer permissions
  CREATE_CUSTOMER: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_REP],
  VIEW_CUSTOMER: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_REP, ROLES.VIEWER],
  UPDATE_CUSTOMER: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_REP],
  DELETE_CUSTOMER: [ROLES.ADMIN, ROLES.MANAGER],

  // Report permissions
  VIEW_REPORTS: [ROLES.ADMIN, ROLES.MANAGER, ROLES.SALES_REP, ROLES.VIEWER],
  EXPORT_REPORTS: [ROLES.ADMIN, ROLES.MANAGER],

  // User management
  MANAGE_USERS: [ROLES.ADMIN],
};

/**
 * Check if user has permission
 * @param {string} userRole - User's role
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(userRole, permission) {
  if (!userRole || !permission) return false;
  
  const allowedRoles = PERMISSIONS[permission];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(userRole);
}

/**
 * Check if user can access resource
 * @param {string} userRole - User's role
 * @param {string} userId - User's ID
 * @param {string} resourceOwnerId - Resource owner's ID
 * @param {string} action - Action to perform (view, update, delete)
 * @returns {boolean}
 */
export function canAccessResource(userRole, userId, resourceOwnerId, action) {
  // Admins and Managers can access all resources
  if ([ROLES.ADMIN, ROLES.MANAGER].includes(userRole)) {
    return true;
  }

  // Sales Reps can view and update their own resources
  if (userRole === ROLES.SALES_REP) {
    if (action === 'view') return true;
    if (action === 'update') return userId === resourceOwnerId;
    if (action === 'delete') return false;
  }

  // Viewers can only view
  if (userRole === ROLES.VIEWER) {
    return action === 'view';
  }

  return false;
}

/**
 * Get allowed actions for user role
 * @param {string} userRole - User's role
 * @returns {object} Object with allowed actions
 */
export function getAllowedActions(userRole) {
  return {
    canCreateProduct: hasPermission(userRole, 'CREATE_PRODUCT'),
    canUpdateProduct: hasPermission(userRole, 'UPDATE_PRODUCT'),
    canDeleteProduct: hasPermission(userRole, 'DELETE_PRODUCT'),
    canCreateCustomer: hasPermission(userRole, 'CREATE_CUSTOMER'),
    canUpdateCustomer: hasPermission(userRole, 'UPDATE_CUSTOMER'),
    canDeleteCustomer: hasPermission(userRole, 'DELETE_CUSTOMER'),
    canCreateCost: hasPermission(userRole, 'CREATE_COST'),
    canUpdateCost: hasPermission(userRole, 'UPDATE_COST'),
    canDeleteCost: hasPermission(userRole, 'DELETE_COST'),
    canViewReports: hasPermission(userRole, 'VIEW_REPORTS'),
    canExportReports: hasPermission(userRole, 'EXPORT_REPORTS'),
    canManageUsers: hasPermission(userRole, 'MANAGE_USERS'),
  };
}