package models

import (
	"database/sql"
	"log"
)

// InitializeSchema initializes the database schema if it doesn't exist
func InitializeSchema(db *sql.DB) error {
	// Create tables
	_, err := db.Exec(`
		-- Create tenants table
		CREATE TABLE IF NOT EXISTS tenants (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL UNIQUE,
			display_name VARCHAR(255) NOT NULL,
			description TEXT,
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL
		);

		-- Create users table
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			username VARCHAR(255) NOT NULL UNIQUE,
			password VARCHAR(255) NOT NULL,
			email VARCHAR(255) NOT NULL,
			display_name VARCHAR(255) NOT NULL,
			avatar TEXT,
			tenant_id INTEGER NOT NULL REFERENCES tenants(id),
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
			last_login TIMESTAMP,
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL,
			casdoor_id VARCHAR(255)
		);

		-- Create roles table
		CREATE TABLE IF NOT EXISTS roles (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			display_name VARCHAR(255) NOT NULL,
			description TEXT,
			tenant_id INTEGER NOT NULL REFERENCES tenants(id),
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL,
			UNIQUE(name, tenant_id)
		);

		-- Create user_roles join table
		CREATE TABLE IF NOT EXISTS user_roles (
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
			tenant_id INTEGER NOT NULL REFERENCES tenants(id),
			created_at TIMESTAMP NOT NULL,
			PRIMARY KEY (user_id, role_id, tenant_id)
		);

		-- Create resources table
		CREATE TABLE IF NOT EXISTS resources (
			id SERIAL PRIMARY KEY,
			type VARCHAR(255) NOT NULL,
			name VARCHAR(255) NOT NULL,
			display_name VARCHAR(255) NOT NULL,
			description TEXT,
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL,
			UNIQUE(type, name)
		);

		-- Create actions table
		CREATE TABLE IF NOT EXISTS actions (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL UNIQUE,
			display_name VARCHAR(255) NOT NULL,
			description TEXT,
			created_at TIMESTAMP NOT NULL,
			updated_at TIMESTAMP NOT NULL
		);

		-- Create permissions table
		CREATE TABLE IF NOT EXISTS permissions (
			id SERIAL PRIMARY KEY,
			role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
			resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
			action_id INTEGER NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
			tenant_id INTEGER NOT NULL REFERENCES tenants(id),
			created_at TIMESTAMP NOT NULL,
			UNIQUE(role_id, resource_id, action_id, tenant_id)
		);
	`)
	if err != nil {
		return err
	}

	// Create default resources
	resourcesData := []struct {
		Type        string
		Name        string
		DisplayName string
		Description string
	}{
		{"api", "users", "Users", "User management"},
		{"api", "roles", "Roles", "Role management"},
		{"api", "tenants", "Tenants", "Tenant management"},
		{"api", "permissions", "Permissions", "Permission management"},
		{"module", "dashboard", "Dashboard", "Dashboard module"},
		{"module", "supplyChain", "Supply Chain", "Supply chain module"},
		{"module", "compliance", "Compliance", "Compliance module"},
		{"module", "declarations", "Declarations", "Declarations module"},
		{"module", "customers", "Customers", "Customers module"},
		{"module", "settings", "Settings", "Settings module"},
		{"module", "userManagement", "User Management", "User management module"},
	}

	// Check if resources exist
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM resources").Scan(&count)
	if err != nil {
		return err
	}

	// Create default resources if they don't exist
	if count == 0 {
		log.Println("Creating default resources")
		for _, resource := range resourcesData {
			_, err = CreateResource(db, CreateResourceInput{
				Type:        resource.Type,
				Name:        resource.Name,
				DisplayName: resource.DisplayName,
				Description: resource.Description,
			})
			if err != nil {
				log.Printf("Error creating resource %s: %v", resource.Name, err)
			}
		}
	}

	// Create default actions
	actionsData := []struct {
		Name        string
		DisplayName string
		Description string
	}{
		{"create", "Create", "Create a resource"},
		{"read", "Read", "Read a resource"},
		{"update", "Update", "Update a resource"},
		{"delete", "Delete", "Delete a resource"},
		{"list", "List", "List resources"},
		{"manage", "Manage", "Full management of a resource"},
		{"view", "View", "View a module"},
		{"admin", "Admin", "Administer a module"},
	}

	// Check if actions exist
	err = db.QueryRow("SELECT COUNT(*) FROM actions").Scan(&count)
	if err != nil {
		return err
	}

	// Create default actions if they don't exist
	if count == 0 {
		log.Println("Creating default actions")
		for _, action := range actionsData {
			_, err = CreateAction(db, CreateActionInput{
				Name:        action.Name,
				DisplayName: action.DisplayName,
				Description: action.Description,
			})
			if err != nil {
				log.Printf("Error creating action %s: %v", action.Name, err)
			}
		}
	}

	return nil
}