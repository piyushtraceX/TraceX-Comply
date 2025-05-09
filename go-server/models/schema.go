package models

import (
	"database/sql"
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// InitializeSchema creates the necessary database tables if they don't exist
func InitializeSchema(db *sql.DB) error {
	// Create tenants table
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS tenants (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) UNIQUE NOT NULL,
			display_name VARCHAR(255) NOT NULL,
			description TEXT,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL,
			updated_at TIMESTAMP WITH TIME ZONE NOT NULL
		)
	`)
	if err != nil {
		return err
	}

	// Create users table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id SERIAL PRIMARY KEY,
			username VARCHAR(255) UNIQUE NOT NULL,
			password VARCHAR(255) NOT NULL,
			email VARCHAR(255) UNIQUE NOT NULL,
			display_name VARCHAR(255) NOT NULL,
			avatar TEXT,
			tenant_id INTEGER NOT NULL REFERENCES tenants(id),
			is_active BOOLEAN NOT NULL DEFAULT TRUE,
			is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
			last_login TIMESTAMP WITH TIME ZONE,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL,
			updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
			casdoor_id VARCHAR(255) UNIQUE
		)
	`)
	if err != nil {
		return err
	}

	// Create roles table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS roles (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			display_name VARCHAR(255) NOT NULL,
			description TEXT,
			tenant_id INTEGER NOT NULL REFERENCES tenants(id),
			created_at TIMESTAMP WITH TIME ZONE NOT NULL,
			updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
			UNIQUE(name, tenant_id)
		)
	`)
	if err != nil {
		return err
	}

	// Create user_roles table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS user_roles (
			user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
			tenant_id INTEGER NOT NULL REFERENCES tenants(id),
			created_at TIMESTAMP WITH TIME ZONE NOT NULL,
			PRIMARY KEY (user_id, role_id, tenant_id)
		)
	`)
	if err != nil {
		return err
	}

	// Create resources table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS resources (
			id SERIAL PRIMARY KEY,
			type VARCHAR(255) NOT NULL,
			name VARCHAR(255) NOT NULL,
			display_name VARCHAR(255) NOT NULL,
			description TEXT,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL,
			updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
			UNIQUE(type, name)
		)
	`)
	if err != nil {
		return err
	}

	// Create actions table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS actions (
			id SERIAL PRIMARY KEY,
			name VARCHAR(255) UNIQUE NOT NULL,
			display_name VARCHAR(255) NOT NULL,
			description TEXT,
			created_at TIMESTAMP WITH TIME ZONE NOT NULL,
			updated_at TIMESTAMP WITH TIME ZONE NOT NULL
		)
	`)
	if err != nil {
		return err
	}

	// Create permissions table
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS permissions (
			id SERIAL PRIMARY KEY,
			role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
			resource_id INTEGER NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
			action_id INTEGER NOT NULL REFERENCES actions(id) ON DELETE CASCADE,
			tenant_id INTEGER NOT NULL REFERENCES tenants(id),
			created_at TIMESTAMP WITH TIME ZONE NOT NULL,
			UNIQUE(role_id, resource_id, action_id, tenant_id)
		)
	`)
	if err != nil {
		return err
	}

	// Add basic resources
	resources := []struct {
		resourceType string
		name         string
		displayName  string
		description  string
	}{
		{"system", "users", "Users", "User management"},
		{"system", "roles", "Roles", "Role management"},
		{"system", "tenants", "Tenants", "Tenant management"},
		{"system", "permissions", "Permissions", "Permission management"},
		{"system", "resources", "Resources", "Resource management"},
		{"system", "actions", "Actions", "Action management"},
	}

	for _, r := range resources {
		_, err := db.Exec(`
			INSERT INTO resources (type, name, display_name, description, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6)
			ON CONFLICT (type, name) DO NOTHING
		`, r.resourceType, r.name, r.displayName, r.description, time.Now(), time.Now())

		if err != nil {
			log.Printf("Error adding resource %s: %v", r.name, err)
		}
	}

	// Add basic actions
	actions := []struct {
		name        string
		displayName string
		description string
	}{
		{"read", "Read", "Permission to read/view"},
		{"create", "Create", "Permission to create new items"},
		{"update", "Update", "Permission to update existing items"},
		{"delete", "Delete", "Permission to delete items"},
		{"assign", "Assign", "Permission to assign to other entities"},
	}

	for _, a := range actions {
		_, err := db.Exec(`
			INSERT INTO actions (name, display_name, description, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5)
			ON CONFLICT (name) DO NOTHING
		`, a.name, a.displayName, a.description, time.Now(), time.Now())

		if err != nil {
			log.Printf("Error adding action %s: %v", a.name, err)
		}
	}

	return nil
}

// CreateDefaultAdminUserIfNotExists creates a default admin user if no users exist in the database
func CreateDefaultAdminUserIfNotExists(db *sql.DB) error {
	// Check if any user exists
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		return err
	}

	// If users already exist, do nothing
	if count > 0 {
		return nil
	}

	log.Println("No users found, creating default admin user and tenant")

	// Create default tenant if it doesn't exist
	var defaultTenantID int
	err = db.QueryRow(`
		SELECT id FROM tenants WHERE name = 'default'
	`).Scan(&defaultTenantID)

	if err != nil {
		if err == sql.ErrNoRows {
			// Create default tenant
			err = db.QueryRow(`
				INSERT INTO tenants (name, display_name, description, created_at, updated_at)
				VALUES ('default', 'Default Tenant', 'Default tenant for new users', $1, $2)
				RETURNING id
			`, time.Now(), time.Now()).Scan(&defaultTenantID)
			if err != nil {
				return err
			}
			log.Printf("Created default tenant with ID %d", defaultTenantID)
		} else {
			return err
		}
	}

	// Create default admin role if it doesn't exist
	var adminRoleID int
	err = db.QueryRow(`
		SELECT id FROM roles WHERE name = 'admin' AND tenant_id = $1
	`, defaultTenantID).Scan(&adminRoleID)

	if err != nil {
		if err == sql.ErrNoRows {
			// Create admin role
			err = db.QueryRow(`
				INSERT INTO roles (name, display_name, description, tenant_id, created_at, updated_at)
				VALUES ('admin', 'Administrator', 'Full administrator role', $1, $2, $3)
				RETURNING id
			`, defaultTenantID, time.Now(), time.Now()).Scan(&adminRoleID)
			if err != nil {
				return err
			}
			log.Printf("Created admin role with ID %d", adminRoleID)
		} else {
			return err
		}
	}

	// Create default user role if it doesn't exist
	var userRoleID int
	err = db.QueryRow(`
		SELECT id FROM roles WHERE name = 'user' AND tenant_id = $1
	`, defaultTenantID).Scan(&userRoleID)

	if err != nil {
		if err == sql.ErrNoRows {
			// Create user role
			err = db.QueryRow(`
				INSERT INTO roles (name, display_name, description, tenant_id, created_at, updated_at)
				VALUES ('user', 'User', 'Basic user role', $1, $2, $3)
				RETURNING id
			`, defaultTenantID, time.Now(), time.Now()).Scan(&userRoleID)
			if err != nil {
				return err
			}
			log.Printf("Created user role with ID %d", userRoleID)
		} else {
			return err
		}
	}

	// Hash the admin password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	// Create the admin user
	var adminUserID int
	now := time.Now()
	err = db.QueryRow(`
		INSERT INTO users (
			username, password, email, display_name, tenant_id,
			is_active, is_super_admin, created_at, updated_at
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`,
		"admin",
		string(hashedPassword),
		"admin@example.com",
		"Administrator",
		defaultTenantID,
		true,  // is_active
		true,  // is_super_admin
		now,
		now,
	).Scan(&adminUserID)
	if err != nil {
		return err
	}
	log.Printf("Created admin user with ID %d", adminUserID)

	// Assign admin role to the admin user
	_, err = db.Exec(`
		INSERT INTO user_roles (user_id, role_id, tenant_id, created_at)
		VALUES ($1, $2, $3, $4)
	`, adminUserID, adminRoleID, defaultTenantID, now)
	if err != nil {
		return err
	}
	log.Printf("Assigned admin role to admin user")

	// Assign user role to the admin user
	_, err = db.Exec(`
		INSERT INTO user_roles (user_id, role_id, tenant_id, created_at)
		VALUES ($1, $2, $3, $4)
	`, adminUserID, userRoleID, defaultTenantID, now)
	if err != nil {
		return err
	}
	log.Printf("Assigned user role to admin user")

	// Set up admin permissions for all resources and actions
	resourceQuery := `SELECT id FROM resources`
	resourceRows, err := db.Query(resourceQuery)
	if err != nil {
		return err
	}
	defer resourceRows.Close()

	var resourceIDs []int
	for resourceRows.Next() {
		var resourceID int
		if err := resourceRows.Scan(&resourceID); err != nil {
			return err
		}
		resourceIDs = append(resourceIDs, resourceID)
	}

	actionQuery := `SELECT id FROM actions`
	actionRows, err := db.Query(actionQuery)
	if err != nil {
		return err
	}
	defer actionRows.Close()

	var actionIDs []int
	for actionRows.Next() {
		var actionID int
		if err := actionRows.Scan(&actionID); err != nil {
			return err
		}
		actionIDs = append(actionIDs, actionID)
	}

	// Create permissions for admin role
	for _, resourceID := range resourceIDs {
		for _, actionID := range actionIDs {
			_, err = db.Exec(`
				INSERT INTO permissions (role_id, resource_id, action_id, tenant_id, created_at)
				VALUES ($1, $2, $3, $4, $5)
				ON CONFLICT (role_id, resource_id, action_id, tenant_id) DO NOTHING
			`, adminRoleID, resourceID, actionID, defaultTenantID, now)
			if err != nil {
				log.Printf("Error creating permission: %v", err)
			}
		}
	}
	log.Println("Created permissions for admin role")

	// Create read-only permissions for user role
	for _, resourceID := range resourceIDs {
		_, err = db.Exec(`
			INSERT INTO permissions (role_id, resource_id, action_id, tenant_id, created_at)
			VALUES ($1, $2, (SELECT id FROM actions WHERE name = 'read'), $3, $4)
			ON CONFLICT (role_id, resource_id, action_id, tenant_id) DO NOTHING
		`, userRoleID, resourceID, defaultTenantID, now)
		if err != nil {
			log.Printf("Error creating permission: %v", err)
		}
	}
	log.Println("Created read permissions for user role")

	return nil
}