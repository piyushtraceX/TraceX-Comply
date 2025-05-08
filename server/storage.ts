import { 
  users, roles, tenants, userRoles, resources, actions, permissions,
  type User, type InsertUser, 
  type Role, type InsertRole,
  type Tenant, type InsertTenant,
  type UserRole, type InsertUserRole,
  type Resource, type InsertResource,
  type Action, type InsertAction,
  type Permission, type InsertPermission
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// Storage interface with extended CRUD operations
export interface IStorage {
  // Session store for express-session
  sessionStore: any; // Using any to avoid type issues with session store

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByCasdoorId(casdoorId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;
  listUsers(tenantId?: number): Promise<User[]>;
  
  // Tenant operations
  getTenant(id: number): Promise<Tenant | undefined>;
  getTenantByName(name: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  listTenants(): Promise<Tenant[]>;
  
  // Role operations
  getRole(id: number): Promise<Role | undefined>;
  getRoleByName(name: string, tenantId?: number): Promise<Role | undefined>;
  createRole(role: InsertRole): Promise<Role>;
  listRoles(tenantId?: number): Promise<Role[]>;
  
  // User-Role operations
  assignRoleToUser(userRole: InsertUserRole): Promise<UserRole>;
  removeRoleFromUser(userId: number, roleId: number, tenantId?: number): Promise<void>;
  getUserRoles(userId: number, tenantId?: number): Promise<Role[]>;
  
  // Resource operations
  getResource(id: number): Promise<Resource | undefined>;
  getResourceByName(type: string, name: string): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  listResources(): Promise<Resource[]>;
  
  // Action operations
  getAction(id: number): Promise<Action | undefined>;
  getActionByName(name: string): Promise<Action | undefined>;
  createAction(action: InsertAction): Promise<Action>;
  listActions(): Promise<Action[]>;
  
  // Permission operations
  getPermission(id: number): Promise<Permission | undefined>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  listPermissions(roleId?: number, tenantId?: number): Promise<Permission[]>;
  removePermission(id: number): Promise<void>;
}

// Implementation of the storage interface using PostgreSQL
export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByCasdoorId(casdoorId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.casdoorId, casdoorId));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async listUsers(tenantId?: number): Promise<User[]> {
    if (tenantId) {
      return await db.select().from(users).where(eq(users.tenantId, tenantId));
    }
    return await db.select().from(users);
  }

  // Tenant operations
  async getTenant(id: number): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.id, id));
    return tenant;
  }

  async getTenantByName(name: string): Promise<Tenant | undefined> {
    const [tenant] = await db.select().from(tenants).where(eq(tenants.name, name));
    return tenant;
  }

  async createTenant(tenant: InsertTenant): Promise<Tenant> {
    const [newTenant] = await db
      .insert(tenants)
      .values(tenant)
      .returning();
    return newTenant;
  }

  async listTenants(): Promise<Tenant[]> {
    return await db.select().from(tenants);
  }

  // Role operations
  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  async getRoleByName(name: string, tenantId?: number): Promise<Role | undefined> {
    if (tenantId) {
      const [role] = await db.select().from(roles)
        .where(and(eq(roles.name, name), eq(roles.tenantId, tenantId)));
      return role;
    }
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db
      .insert(roles)
      .values(role)
      .returning();
    return newRole;
  }

  async listRoles(tenantId?: number): Promise<Role[]> {
    if (tenantId) {
      return await db.select().from(roles).where(eq(roles.tenantId, tenantId));
    }
    return await db.select().from(roles);
  }

  // User-Role operations
  async assignRoleToUser(userRole: InsertUserRole): Promise<UserRole> {
    const [newUserRole] = await db
      .insert(userRoles)
      .values(userRole)
      .returning();
    return newUserRole;
  }

  async removeRoleFromUser(userId: number, roleId: number, tenantId?: number): Promise<void> {
    if (tenantId) {
      await db.delete(userRoles)
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId),
          eq(userRoles.tenantId, tenantId)
        ));
    } else {
      await db.delete(userRoles)
        .where(and(
          eq(userRoles.userId, userId),
          eq(userRoles.roleId, roleId)
        ));
    }
  }

  async getUserRoles(userId: number, tenantId?: number): Promise<Role[]> {
    // When tenantId is provided, we need to filter by both userId and tenantId
    if (tenantId) {
      return await db.select({
        id: roles.id,
        name: roles.name,
        displayName: roles.displayName,
        description: roles.description,
        tenantId: roles.tenantId,
        parentRoleId: roles.parentRoleId,
        createdAt: roles.createdAt,
        updatedAt: roles.updatedAt,
      })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(
        eq(userRoles.userId, userId),
        eq(userRoles.tenantId, tenantId)
      ));
    }
    
    // Otherwise just filter by userId
    return await db.select({
      id: roles.id,
      name: roles.name,
      displayName: roles.displayName,
      description: roles.description,
      tenantId: roles.tenantId,
      parentRoleId: roles.parentRoleId,
      createdAt: roles.createdAt,
      updatedAt: roles.updatedAt,
    })
    .from(userRoles)
    .innerJoin(roles, eq(userRoles.roleId, roles.id))
    .where(eq(userRoles.userId, userId));
  }

  // Resource operations
  async getResource(id: number): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource;
  }

  async getResourceByName(type: string, name: string): Promise<Resource | undefined> {
    const [resource] = await db.select().from(resources)
      .where(and(eq(resources.type, type), eq(resources.name, name)));
    return resource;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [newResource] = await db
      .insert(resources)
      .values(resource)
      .returning();
    return newResource;
  }

  async listResources(): Promise<Resource[]> {
    return await db.select().from(resources);
  }

  // Action operations
  async getAction(id: number): Promise<Action | undefined> {
    const [action] = await db.select().from(actions).where(eq(actions.id, id));
    return action;
  }

  async getActionByName(name: string): Promise<Action | undefined> {
    const [action] = await db.select().from(actions).where(eq(actions.name, name));
    return action;
  }

  async createAction(action: InsertAction): Promise<Action> {
    const [newAction] = await db
      .insert(actions)
      .values(action)
      .returning();
    return newAction;
  }

  async listActions(): Promise<Action[]> {
    return await db.select().from(actions);
  }

  // Permission operations
  async getPermission(id: number): Promise<Permission | undefined> {
    const [permission] = await db.select().from(permissions).where(eq(permissions.id, id));
    return permission;
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const [newPermission] = await db
      .insert(permissions)
      .values(permission)
      .returning();
    return newPermission;
  }

  async listPermissions(roleId?: number, tenantId?: number): Promise<Permission[]> {
    if (roleId && tenantId) {
      return await db.select().from(permissions)
        .where(and(eq(permissions.roleId, roleId), eq(permissions.tenantId, tenantId)));
    } else if (roleId) {
      return await db.select().from(permissions).where(eq(permissions.roleId, roleId));
    } else if (tenantId) {
      return await db.select().from(permissions).where(eq(permissions.tenantId, tenantId));
    }
    return await db.select().from(permissions);
  }

  async removePermission(id: number): Promise<void> {
    await db.delete(permissions).where(eq(permissions.id, id));
  }
}

// Export an instance of DatabaseStorage
export const storage = new DatabaseStorage();
