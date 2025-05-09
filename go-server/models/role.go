package models

import (
	"database/sql"
	"errors"
	"time"

	"github.com/lib/pq"
)

// Role represents a role in the system
type Role struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	DisplayName string    `json:"displayName"`
	Description string    `json:"description"`
	TenantID    int       `json:"tenantId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// CreateRole creates a new role in the database
func CreateRole(db *sql.DB, role *Role) (*Role, error) {
	// Set defaults
	now := time.Now()
	role.CreatedAt = now
	role.UpdatedAt = now

	// Insert the role into the database
	query := `
		INSERT INTO roles (name, display_name, description, tenant_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`
	err := db.QueryRow(
		query,
		role.Name,
		role.DisplayName,
		role.Description,
		role.TenantID,
		role.CreatedAt,
		role.UpdatedAt,
	).Scan(&role.ID)

	if err != nil {
		// Check for unique constraint violation
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "23505" { // unique_violation
				return nil, errors.New("role name already exists for this tenant")
			}
		}
		return nil, err
	}

	return role, nil
}

// GetRoleByID retrieves a role by its ID
func GetRoleByID(db *sql.DB, id int) (*Role, error) {
	query := `
		SELECT id, name, display_name, description, tenant_id, created_at, updated_at
		FROM roles
		WHERE id = $1
	`
	var role Role

	err := db.QueryRow(query, id).Scan(
		&role.ID,
		&role.Name,
		&role.DisplayName,
		&role.Description,
		&role.TenantID,
		&role.CreatedAt,
		&role.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("role not found")
		}
		return nil, err
	}

	return &role, nil
}

// GetRoleByName retrieves a role by its name within a tenant
func GetRoleByName(db *sql.DB, name string, tenantID int) (*Role, error) {
	query := `
		SELECT id, name, display_name, description, tenant_id, created_at, updated_at
		FROM roles
		WHERE name = $1 AND tenant_id = $2
	`
	var role Role

	err := db.QueryRow(query, name, tenantID).Scan(
		&role.ID,
		&role.Name,
		&role.DisplayName,
		&role.Description,
		&role.TenantID,
		&role.CreatedAt,
		&role.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("role not found")
		}
		return nil, err
	}

	return &role, nil
}

// ListRoles retrieves all roles, optionally filtered by tenant
func ListRoles(db *sql.DB, tenantID *int) ([]Role, error) {
	var query string
	var rows *sql.Rows
	var err error

	if tenantID != nil {
		query = `
			SELECT id, name, display_name, description, tenant_id, created_at, updated_at
			FROM roles
			WHERE tenant_id = $1
			ORDER BY id
		`
		rows, err = db.Query(query, *tenantID)
	} else {
		query = `
			SELECT id, name, display_name, description, tenant_id, created_at, updated_at
			FROM roles
			ORDER BY id
		`
		rows, err = db.Query(query)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []Role
	for rows.Next() {
		var role Role
		err := rows.Scan(
			&role.ID,
			&role.Name,
			&role.DisplayName,
			&role.Description,
			&role.TenantID,
			&role.CreatedAt,
			&role.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return roles, nil
}

// AssignRoleToUser assigns a role to a user
func AssignRoleToUser(db *sql.DB, userID, roleID, tenantID int) error {
	// Check if the assignment already exists
	var exists bool
	existsQuery := `
		SELECT EXISTS(
			SELECT 1 FROM user_roles 
			WHERE user_id = $1 AND role_id = $2 AND tenant_id = $3
		)
	`
	err := db.QueryRow(existsQuery, userID, roleID, tenantID).Scan(&exists)
	if err != nil {
		return err
	}

	if exists {
		return errors.New("user already has this role")
	}

	// Insert the assignment
	query := `
		INSERT INTO user_roles (user_id, role_id, tenant_id, created_at)
		VALUES ($1, $2, $3, $4)
	`
	_, err = db.Exec(query, userID, roleID, tenantID, time.Now())
	return err
}

// RemoveRoleFromUser removes a role from a user
func RemoveRoleFromUser(db *sql.DB, userID, roleID, tenantID int) error {
	query := `
		DELETE FROM user_roles
		WHERE user_id = $1 AND role_id = $2 AND tenant_id = $3
	`
	_, err := db.Exec(query, userID, roleID, tenantID)
	return err
}

// GetUserRolesByUserID retrieves all roles assigned to a user
func GetUserRolesByUserID(db *sql.DB, userID int, tenantID *int) ([]Role, error) {
	var query string
	var rows *sql.Rows
	var err error

	if tenantID != nil {
		query = `
			SELECT r.id, r.name, r.display_name, r.description, r.tenant_id, r.created_at, r.updated_at
			FROM roles r
			JOIN user_roles ur ON r.id = ur.role_id
			WHERE ur.user_id = $1 AND ur.tenant_id = $2
			ORDER BY r.id
		`
		rows, err = db.Query(query, userID, *tenantID)
	} else {
		query = `
			SELECT r.id, r.name, r.display_name, r.description, r.tenant_id, r.created_at, r.updated_at
			FROM roles r
			JOIN user_roles ur ON r.id = ur.role_id
			WHERE ur.user_id = $1
			ORDER BY r.id
		`
		rows, err = db.Query(query, userID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []Role
	for rows.Next() {
		var role Role
		err := rows.Scan(
			&role.ID,
			&role.Name,
			&role.DisplayName,
			&role.Description,
			&role.TenantID,
			&role.CreatedAt,
			&role.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}

	if err = rows.Err(); err != nil {
		return nil, err
	}

	return roles, nil
}