/**
 * AdminService - Role and Permission Management
 * 
 * Handles admin authentication, permissions, and actions logging
 */

// User roles hierarchy
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

// Role levels for comparison
export const ROLE_LEVELS = {
  user: 0,
  moderator: 1,
  admin: 2,
  super_admin: 3,
};

// Permission definitions
export const PERMISSIONS = {
  // Users
  VIEW_USERS: 'view_users',
  EDIT_USERS: 'edit_users',
  DELETE_USERS: 'delete_users',
  SUSPEND_USERS: 'suspend_users',
  
  // Reports
  VIEW_REPORTS: 'view_reports',
  HANDLE_REPORTS: 'handle_reports',
  
  // Content
  VIEW_CONTENT: 'view_content',
  EDIT_CONTENT: 'edit_content',
  DELETE_CONTENT: 'delete_content',
  
  // Analytics
  VIEW_ANALYTICS: 'view_analytics',
  
  // Settings
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
  
  // Logs
  VIEW_LOGS: 'view_logs',
  
  // All
  ALL: 'all',
};

// Default permissions by role
export const ROLE_PERMISSIONS = {
  user: [],
  moderator: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.VIEW_REPORTS,
    PERMISSIONS.HANDLE_REPORTS,
    PERMISSIONS.VIEW_CONTENT,
  ],
  admin: [PERMISSIONS.ALL],
  super_admin: [PERMISSIONS.ALL],
};

class AdminService {
  /**
   * Check if user has required role level
   */
  static hasRole(userRole, requiredRole) {
    const userLevel = ROLE_LEVELS[userRole] || 0;
    const requiredLevel = ROLE_LEVELS[requiredRole] || 0;
    return userLevel >= requiredLevel;
  }

  /**
   * Check if user has specific permission
   */
  static hasPermission(user, permission) {
    if (!user || !user.role) return false;
    
    // Super admin and admin have all permissions
    if (user.role === USER_ROLES.SUPER_ADMIN || user.role === USER_ROLES.ADMIN) {
      return true;
    }
    
    // Check user's explicit permissions
    if (user.permissions?.includes(PERMISSIONS.ALL)) {
      return true;
    }
    
    if (user.permissions?.includes(permission)) {
      return true;
    }
    
    // Check role default permissions
    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission) || rolePermissions.includes(PERMISSIONS.ALL);
  }

  /**
   * Check if user is admin or higher
   */
  static isAdmin(user) {
    return this.hasRole(user?.role, USER_ROLES.ADMIN);
  }

  /**
   * Check if user is moderator or higher
   */
  static isModerator(user) {
    return this.hasRole(user?.role, USER_ROLES.MODERATOR);
  }

  /**
   * Get user from localStorage (mock - replace with actual auth)
   */
  static getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  /**
   * Log admin action (should call backend)
   */
  static async logAction(action, targetId, details = {}) {
    const user = this.getCurrentUser();
    
    const logEntry = {
      adminId: user?.id,
      adminEmail: user?.email,
      action,
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    
    console.log('[AdminLog]', logEntry);
    
    // TODO: Send to backend
    // await api.post('/admin/logs', logEntry);
    
    return logEntry;
  }

  /**
   * Admin actions
   */
  static async suspendUser(userId, reason) {
    await this.logAction('USER_SUSPENDED', userId, { reason });
    // TODO: Call backend API
    console.log(`[Admin] Suspending user ${userId}: ${reason}`);
  }

  static async banUser(userId, reason) {
    await this.logAction('USER_BANNED', userId, { reason });
    // TODO: Call backend API
    console.log(`[Admin] Banning user ${userId}: ${reason}`);
  }

  static async deleteUser(userId, reason) {
    await this.logAction('USER_DELETED', userId, { reason });
    // TODO: Call backend API
    console.log(`[Admin] Deleting user ${userId}: ${reason}`);
  }

  static async resolveReport(reportId, action, notes) {
    await this.logAction('REPORT_RESOLVED', reportId, { action, notes });
    // TODO: Call backend API
    console.log(`[Admin] Resolving report ${reportId}: ${action}`);
  }
}

export default AdminService;
