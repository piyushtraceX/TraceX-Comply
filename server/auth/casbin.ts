import * as casbin from 'casbin';
import path from 'path';
import { storage } from '../storage';
import { User, Role } from '@shared/schema';
import fs from 'fs';

// Initialize the enforcer
let enforcer: casbin.Enforcer;

// Create a data directory if it doesn't exist
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Path to the policy file
const policyFile = path.join(dataDir, 'casbin_policy.csv');

// Function to initialize the enforcer
export async function initCasbinEnforcer(): Promise<casbin.Enforcer> {
  if (enforcer) {
    return enforcer;
  }

  // Use a file adapter for simplicity and reliability
  const fileAdapter = new casbin.FileAdapter(policyFile);

  // Create the enforcer with the RBAC with domain model and file adapter
  const modelPath = path.join(__dirname, 'casbin-model.conf');
  
  enforcer = await casbin.newEnforcer(modelPath, fileAdapter);
  
  // Enable auto-save
  enforcer.enableAutoSave(true);
  
  return enforcer;
}

// Check if a user has permission to perform an action on a resource in a specific tenant (domain)
export async function checkPermission(
  userId: number,
  tenantId: number,
  resource: string,
  action: string
): Promise<boolean> {
  const enforcer = await initCasbinEnforcer();

  // Get the result
  return await enforcer.enforce(
    userId.toString(),
    tenantId.toString(),
    resource,
    action
  );
}

// Add a policy for a role (rather than a specific user)
export async function addRolePolicy(
  roleId: number,
  tenantId: number,
  resource: string,
  action: string
): Promise<boolean> {
  const enforcer = await initCasbinEnforcer();
  
  return await enforcer.addPolicy(
    `role:${roleId}`,
    tenantId.toString(),
    resource,
    action
  );
}

// Add a role assignment for a user in a specific tenant
export async function assignRoleToUser(
  userId: number,
  roleId: number,
  tenantId: number
): Promise<boolean> {
  const enforcer = await initCasbinEnforcer();
  
  return await enforcer.addGroupingPolicy(
    userId.toString(),
    `role:${roleId}`,
    tenantId.toString()
  );
}

// Remove a role assignment for a user in a specific tenant
export async function removeRoleFromUser(
  userId: number,
  roleId: number,
  tenantId: number
): Promise<boolean> {
  const enforcer = await initCasbinEnforcer();
  
  return await enforcer.removeGroupingPolicy(
    userId.toString(),
    `role:${roleId}`,
    tenantId.toString()
  );
}

// Get all roles for a user in a specific tenant
export async function getUserRoles(
  userId: number,
  tenantId: number
): Promise<string[]> {
  const enforcer = await initCasbinEnforcer();
  
  const roles = await enforcer.getRolesForUserInDomain(
    userId.toString(),
    tenantId.toString()
  );
  
  // Format the roles (remove the 'role:' prefix)
  return roles.map(role => role.replace('role:', ''));
}

// Get all policies for a role in a specific tenant
export async function getRolePolicies(
  roleId: number,
  tenantId: number
): Promise<string[][]> {
  const enforcer = await initCasbinEnforcer();
  
  return await enforcer.getFilteredPolicy(0, `role:${roleId}`, tenantId.toString());
}

// Express middleware for authorization checks
export function authzMiddleware(resource: string, action: string) {
  return async (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: No user authenticated' });
    }
    
    // Get the tenant ID from the request (could be in headers, params, etc.)
    const tenantId = req.headers['x-tenant-id'] || req.query.tenantId || req.user.tenantId || 1;
    
    try {
      const hasPermission = await checkPermission(
        req.user.id,
        Number(tenantId),
        resource,
        action
      );
      
      if (hasPermission) {
        return next();
      } else {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ error: 'Internal server error during authorization check' });
    }
  };
}

// Sync roles and permissions from database to Casbin
export async function syncPermissionsWithCasbin(): Promise<void> {
  const enforcer = await initCasbinEnforcer();
  
  // Clear existing policies (careful with this in production)
  await enforcer.clearPolicy();
  
  // Get all roles and their permissions
  const allRoles = await storage.listRoles();
  
  for (const role of allRoles) {
    // Use undefined instead of null for tenantId
    const tenantId = role.tenantId === null ? undefined : role.tenantId;
    const permissions = await storage.listPermissions(role.id, tenantId);
    
    for (const perm of permissions) {
      if (perm.resourceId !== null && perm.actionId !== null) {
        const resourceObj = await storage.getResource(perm.resourceId);
        const actionObj = await storage.getAction(perm.actionId);
        
        if (resourceObj && actionObj) {
          // Add policy for the role
          await enforcer.addPolicy(
            `role:${role.id}`,
            String(role.tenantId || '1'),
            `${resourceObj.type}:${resourceObj.name}`,
            actionObj.name
          );
        }
      }
    }
  }
  
  // Now add role assignments for all users
  const allUsers = await storage.listUsers();
  
  for (const user of allUsers) {
    // For each user, get their roles for each tenant
    if (user.tenantId) {
      const userRoles = await storage.getUserRoles(user.id, user.tenantId);
      
      for (const role of userRoles) {
        await enforcer.addGroupingPolicy(
          String(user.id),
          `role:${role.id}`,
          String(user.tenantId)
        );
      }
    }
  }
}

// Initialize Casbin with some basic policies
export async function initializeCasbinWithBasicPolicies(): Promise<void> {
  try {
    // Ensure we have a default tenant
    let defaultTenant = await storage.getTenantByName('default');
    if (!defaultTenant) {
      defaultTenant = await storage.createTenant({
        name: 'default',
        displayName: 'Default Tenant',
        description: 'Default tenant for the system',
      });
    }
    
    // Ensure we have basic roles: admin, manager, user
    let adminRole = await storage.getRoleByName('admin', defaultTenant.id);
    if (!adminRole) {
      adminRole = await storage.createRole({
        name: 'admin',
        displayName: 'Administrator',
        description: 'Full system access',
        tenantId: defaultTenant.id,
      });
    }
    
    let managerRole = await storage.getRoleByName('manager', defaultTenant.id);
    if (!managerRole) {
      managerRole = await storage.createRole({
        name: 'manager',
        displayName: 'Manager',
        description: 'Department manager with elevated permissions',
        tenantId: defaultTenant.id,
        parentRoleId: adminRole.id, // Manager inherits from admin
      });
    }
    
    let userRole = await storage.getRoleByName('user', defaultTenant.id);
    if (!userRole) {
      userRole = await storage.createRole({
        name: 'user',
        displayName: 'Regular User',
        description: 'Basic system access',
        tenantId: defaultTenant.id,
      });
    }
    
    // Ensure we have basic actions: read, write, delete, admin
    for (const actionName of ['read', 'write', 'delete', 'admin']) {
      let action = await storage.getActionByName(actionName);
      if (!action) {
        await storage.createAction({
          name: actionName,
          displayName: actionName.charAt(0).toUpperCase() + actionName.slice(1),
          description: `${actionName} permission`,
        });
      }
    }
    
    // Ensure we have some basic resources
    for (const resourceInfo of [
      { type: 'page', name: 'dashboard', displayName: 'Dashboard Page' },
      { type: 'page', name: 'settings', displayName: 'Settings Page' },
      { type: 'page', name: 'users', displayName: 'Users Page' },
      { type: 'api', name: 'users', displayName: 'Users API' },
      { type: 'api', name: 'roles', displayName: 'Roles API' },
      { type: 'api', name: 'tenants', displayName: 'Tenants API' },
    ]) {
      let resource = await storage.getResourceByName(resourceInfo.type, resourceInfo.name);
      if (!resource) {
        await storage.createResource({
          type: resourceInfo.type,
          name: resourceInfo.name,
          displayName: resourceInfo.displayName,
          description: `Resource for ${resourceInfo.displayName}`,
        });
      }
    }
    
    // Sync all permissions to Casbin
    await syncPermissionsWithCasbin();
  } catch (error) {
    console.error('Failed to initialize Casbin with basic policies:', error);
    throw error;
  }
}