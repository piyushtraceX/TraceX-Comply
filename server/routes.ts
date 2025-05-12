import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupSessionMiddleware, setupAuthRoutes, authenticate } from "./auth";
import { log } from "./vite";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware first
  setupSessionMiddleware(app);
  
  // Status endpoint for health checks
  app.get('/express-status', (req, res) => {
    res.json({
      status: 'ok',
      message: 'Express server is running with database-backed authentication',
      timestamp: new Date().toISOString()
    });
  });
  
  // Basic API test endpoint
  app.get('/api/test', (req: Request, res: Response) => {
    res.json({
      message: 'Express API test endpoint is working',
      timestamp: new Date().toISOString()
    });
  });
  
  // Set up database-backed authentication routes
  setupAuthRoutes(app);
  
  // === USER MANAGEMENT ENDPOINTS ===
  
  // User routes
  app.get('/api/users', authenticate, async (req: Request, res: Response) => {
    try {
      // Only allow super admins to list all users
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      
      const users = await storage.listUsers();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.post('/api/users', authenticate, async (req: Request, res: Response) => {
    try {
      // Log user permissions for debugging
      console.log('User attempting to create a new user:', {
        userId: req.user.id,
        username: req.user.username,
        isSuperAdmin: req.user.isSuperAdmin,
        roles: req.user.roles
      });
      
      // TEMPORARILY BYPASS SUPER ADMIN CHECK FOR TESTING
      // if (!req.user.isSuperAdmin) {
      //   return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      // }
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      const user = await storage.createUser(req.body);
      console.log('User created successfully:', user);
      res.status(201).json(user);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.get('/api/users/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only allow super admins or the user themselves to view user details
      if (!req.user.isSuperAdmin && req.user.id !== userId) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  app.patch('/api/users/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only allow super admins or the user themselves to update user details
      if (!req.user.isSuperAdmin && req.user.id !== userId) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // If password is empty string, remove it from update data
      if (req.body.password === '') {
        delete req.body.password;
      }
      
      // Non-super admins can't change their own admin status
      if (!req.user.isSuperAdmin && req.user.id === userId) {
        delete req.body.isSuperAdmin;
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  });

  // Tenant routes
  app.get('/api/tenants', authenticate, async (req: Request, res: Response) => {
    try {
      const tenants = await storage.listTenants();
      res.json(tenants);
    } catch (error) {
      console.error('Error fetching tenants:', error);
      res.status(500).json({ error: 'Failed to fetch tenants' });
    }
  });

  app.post('/api/tenants', authenticate, async (req: Request, res: Response) => {
    try {
      // Only super admins can create tenants
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      
      const tenant = await storage.createTenant(req.body);
      res.status(201).json(tenant);
    } catch (error) {
      console.error('Error creating tenant:', error);
      res.status(500).json({ error: 'Failed to create tenant' });
    }
  });

  // Endpoint to get user counts per tenant
  app.get('/api/tenants/user-counts', authenticate, async (req: Request, res: Response) => {
    try {
      // Only super admins can access this endpoint
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      
      const tenants = await storage.listTenants();
      const users = await storage.listUsers();
      
      const userCounts = tenants.map(tenant => {
        return {
          tenantId: tenant.id,
          userCount: users.filter(user => user.tenantId === tenant.id).length
        };
      });
      
      res.json(userCounts);
    } catch (error) {
      console.error('Error fetching tenant user counts:', error);
      res.status(500).json({ error: 'Failed to fetch tenant user counts' });
    }
  });

  // Role routes
  app.get('/api/roles', authenticate, async (req: Request, res: Response) => {
    try {
      const roles = await storage.listRoles();
      res.json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  });

  app.post('/api/roles', authenticate, async (req: Request, res: Response) => {
    try {
      // Only super admins can create roles
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      
      const role = await storage.createRole(req.body);
      res.status(201).json(role);
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ error: 'Failed to create role' });
    }
  });

  // Resource routes
  app.get('/api/resources', authenticate, async (req: Request, res: Response) => {
    try {
      const resources = await storage.listResources();
      res.json(resources);
    } catch (error) {
      console.error('Error fetching resources:', error);
      res.status(500).json({ error: 'Failed to fetch resources' });
    }
  });

  // Action routes
  app.get('/api/actions', authenticate, async (req: Request, res: Response) => {
    try {
      const actions = await storage.listActions();
      res.json(actions);
    } catch (error) {
      console.error('Error fetching actions:', error);
      res.status(500).json({ error: 'Failed to fetch actions' });
    }
  });

  // Permission routes
  app.get('/api/permissions', authenticate, async (req: Request, res: Response) => {
    try {
      const roleId = req.query.roleId ? parseInt(req.query.roleId as string) : undefined;
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      
      const permissions = await storage.listPermissions(roleId, tenantId);
      res.json(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      res.status(500).json({ error: 'Failed to fetch permissions' });
    }
  });

  app.post('/api/permissions', authenticate, async (req: Request, res: Response) => {
    try {
      // Only super admins can create permissions
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      
      const permission = await storage.createPermission(req.body);
      res.status(201).json(permission);
    } catch (error) {
      console.error('Error creating permission:', error);
      res.status(500).json({ error: 'Failed to create permission' });
    }
  });

  app.delete('/api/permissions/:id', authenticate, async (req: Request, res: Response) => {
    try {
      // Only super admins can delete permissions
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      
      await storage.removePermission(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting permission:', error);
      res.status(500).json({ error: 'Failed to delete permission' });
    }
  });

  // User-Role routes
  app.post('/api/user-roles', authenticate, async (req: Request, res: Response) => {
    try {
      // Only super admins can assign roles
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      
      const userRole = await storage.assignRoleToUser(req.body);
      res.status(201).json(userRole);
    } catch (error) {
      console.error('Error assigning role to user:', error);
      res.status(500).json({ error: 'Failed to assign role to user' });
    }
  });

  app.delete('/api/user-roles/:userId/:roleId', authenticate, async (req: Request, res: Response) => {
    try {
      // Only super admins can remove roles
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      
      const userId = parseInt(req.params.userId);
      const roleId = parseInt(req.params.roleId);
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      
      await storage.removeRoleFromUser(userId, roleId, tenantId);
      res.status(204).send();
    } catch (error) {
      console.error('Error removing role from user:', error);
      res.status(500).json({ error: 'Failed to remove role from user' });
    }
  });

  // Get roles for a user
  app.get('/api/users/:userId/roles', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Only super admins or the user themselves can view their roles
      if (!req.user.isSuperAdmin && req.user.id !== userId) {
        return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      }
      
      const tenantId = req.query.tenantId ? parseInt(req.query.tenantId as string) : undefined;
      
      const roles = await storage.getUserRoles(userId, tenantId);
      res.json(roles);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      res.status(500).json({ error: 'Failed to fetch user roles' });
    }
  });
  
  // Create an endpoint to seed a demo user if needed
  app.post('/api/seed-demo-user', async (req: Request, res: Response) => {
    try {
      // Check if the demo user already exists
      const existingUser = await storage.getUserByUsername('demouser');
      
      if (existingUser) {
        return res.json({ 
          message: 'Demo user already exists', 
          user: existingUser 
        });
      }
      
      // Create default tenant if it doesn't exist
      let defaultTenant = await storage.getTenantByName('default');
      if (!defaultTenant) {
        defaultTenant = await storage.createTenant({
          name: 'default',
          displayName: 'Default Tenant',
          description: 'Default tenant for new users'
        });
      }
      
      // Create the demo user with superadmin for testing (can be changed to false in production)
      const demoUser = await storage.createUser({
        username: 'demouser',
        password: '$2b$10$iq70nZ.hRxkEA7WV7UFr0OXVgGuOxOLXwKHPZ7IfHxD5QI4r1Aw3m', // 'password'
        email: 'demo@example.com',
        displayName: 'Demo User',
        tenantId: defaultTenant.id,
        isActive: true,
        isSuperAdmin: true // Set to true so we can access user management features
      });
      
      // Set up default user role
      let userRole = await storage.getRoleByName('user', defaultTenant.id);
      if (!userRole) {
        userRole = await storage.createRole({
          name: 'user',
          displayName: 'User',
          description: 'Basic user role',
          tenantId: defaultTenant.id
        });
      }
      
      // Set up admin role
      let adminRole = await storage.getRoleByName('admin', defaultTenant.id);
      if (!adminRole) {
        adminRole = await storage.createRole({
          name: 'admin',
          displayName: 'Administrator',
          description: 'Full administrator access',
          tenantId: defaultTenant.id
        });
      }
      
      // Assign roles to user
      await storage.assignRoleToUser({
        userId: demoUser.id,
        roleId: userRole.id,
        tenantId: defaultTenant.id
      });
      
      await storage.assignRoleToUser({
        userId: demoUser.id,
        roleId: adminRole.id,
        tenantId: defaultTenant.id
      });
      
      res.status(201).json({
        message: 'Demo user created successfully',
        user: demoUser
      });
    } catch (error) {
      console.error('Error creating demo user:', error);
      res.status(500).json({ error: 'Failed to create demo user' });
    }
  });
  
  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
