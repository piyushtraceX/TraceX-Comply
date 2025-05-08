import { pgTable, text, serial, integer, boolean, timestamp, uniqueIndex, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tenant (Domain) table
export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User table with extended fields
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").unique(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  tenantId: integer("tenant_id").references(() => tenants.id),
  isActive: boolean("is_active").default(true),
  isSuperAdmin: boolean("is_super_admin").default(false),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  casdoorId: text("casdoor_id").unique(), // Holds the Casdoor user ID
}, (table) => {
  return {
    usernameTenantIdx: uniqueIndex("username_tenant_idx").on(table.username, table.tenantId),
  };
});

// Roles table
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  tenantId: integer("tenant_id").references(() => tenants.id),
  parentRoleId: integer("parent_role_id").references((): any => roles.id), // For hierarchical roles
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    roleTenantIdx: uniqueIndex("role_tenant_idx").on(table.name, table.tenantId),
  };
});

// User-Role assignments
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  roleId: integer("role_id").notNull().references(() => roles.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    userRoleTenantIdx: uniqueIndex("user_role_tenant_idx").on(table.userId, table.roleId, table.tenantId),
  };
});

// Resources/permissions
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // E.g., "api", "page", "button", etc.
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    resourceTypeNameIdx: uniqueIndex("resource_type_name_idx").on(table.type, table.name),
  };
});

// Actions (e.g., read, write, delete)
export const actions = pgTable("actions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // E.g., "read", "write", "delete"
  displayName: text("display_name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Permissions (policies for Casbin)
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").references(() => roles.id),
  resourceId: integer("resource_id").references(() => resources.id),
  actionId: integer("action_id").references(() => actions.id),
  tenantId: integer("tenant_id").references(() => tenants.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
  return {
    permissionUniqIdx: uniqueIndex("permission_uniq_idx").on(table.roleId, table.resourceId, table.actionId, table.tenantId),
  };
});

// Tenant Schema for insert operations
export const insertTenantSchema = createInsertSchema(tenants);

// User Schema for insert operations with extended fields
export const insertUserSchema = createInsertSchema(users);

// Role Schema for insert operations
export const insertRoleSchema = createInsertSchema(roles);

// UserRole Schema for insert operations
export const insertUserRoleSchema = createInsertSchema(userRoles);

// Resource Schema for insert operations
export const insertResourceSchema = createInsertSchema(resources);

// Action Schema for insert operations
export const insertActionSchema = createInsertSchema(actions);

// Permission Schema for insert operations
export const insertPermissionSchema = createInsertSchema(permissions);

// Export types
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Tenant = typeof tenants.$inferSelect;

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertRole = z.infer<typeof insertRoleSchema>;
export type Role = typeof roles.$inferSelect;

export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type UserRole = typeof userRoles.$inferSelect;

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

export type InsertAction = z.infer<typeof insertActionSchema>;
export type Action = typeof actions.$inferSelect;

export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type Permission = typeof permissions.$inferSelect;
