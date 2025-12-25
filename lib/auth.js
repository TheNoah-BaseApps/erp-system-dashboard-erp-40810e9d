import { verifyToken } from './jwt';

/**
 * Verify authentication from request headers
 * @param {Request} request - Next.js request object
 * @returns {Promise<{authenticated: boolean, user?: object, error?: string}>}
 */
export async function verifyAuth(request) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        authenticated: false,
        error: 'Missing or invalid authorization header',
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const payload = await verifyToken(token);

    if (!payload) {
      return {
        authenticated: false,
        error: 'Invalid or expired token',
      };
    }

    return {
      authenticated: true,
      user: payload,
    };
  } catch (error) {
    console.error('Auth verification error:', error);
    return {
      authenticated: false,
      error: 'Authentication failed',
    };
  }
}

/**
 * Check if user has required role
 * @param {object} user - User object from token
 * @param {string[]} allowedRoles - Array of allowed roles
 * @returns {boolean}
 */
export function hasRole(user, allowedRoles) {
  if (!user || !user.role) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Check if user can modify resource
 * @param {object} user - User object from token
 * @param {string} resourceCreatorId - ID of resource creator
 * @returns {boolean}
 */
export function canModify(user, resourceCreatorId) {
  if (!user) return false;
  
  // Admins and Managers can modify anything
  if (['Admin', 'Manager'].includes(user.role)) return true;
  
  // Others can only modify their own resources
  return user.userId === resourceCreatorId;
}

/**
 * Check if user can delete resource
 * @param {object} user - User object from token
 * @returns {boolean}
 */
export function canDelete(user) {
  if (!user) return false;
  return ['Admin', 'Manager'].includes(user.role);
}

/**
 * Check if user is viewer (read-only)
 * @param {object} user - User object from token
 * @returns {boolean}
 */
export function isViewer(user) {
  if (!user) return true;
  return user.role === 'Viewer';
}