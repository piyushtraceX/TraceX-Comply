package models

import (
	"database/sql"
	"fmt"
	"time"
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

// CreateRoleInput represents the input for creating a role
type CreateRoleInput struct {
	Name        string `json:"name" binding:"required"`
	DisplayName string `json:"displayName" binding:"required"`
	Description string `json:"description" binding:"required"`
	TenantID    int    `json:"tenantId" binding:"required"`
}

// UpdateRoleInput represents the input for updating a role
type UpdateRoleInput struct {
	Name        *string `json:"name"`
	DisplayName *string `json:"displayName"`
	Description *string `json:"description"`
	TenantID    *int    `json:"tenantId"`
}

// GetRoleByID gets a role by ID
func GetRoleByID(db *sql.DB, id int) (*Role, error) {
	// Query role
	row := db.QueryRow(`
		SELECT id, name, display_name, description, tenant_id, created_at, updated_at
		FROM roles
		WHERE id = $1
	`, id)

	// Scan row into role
	var role Role
	err := row.Scan(
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
			return nil, nil
		}
		return nil, err
	}

	return &role, nil
}

// GetRoleByName gets a role by name
func GetRoleByName(db *sql.DB, name string, tenantID *int) (*Role, error) {
	// Build query
	query := `
		SELECT id, name, display_name, description, tenant_id, created_at, updated_at
		FROM roles
		WHERE name = $1
	`
	args := []interface{}{name}
	if tenantID != nil {
		query += " AND tenant_id = $2"
		args = append(args, *tenantID)
	}

	// Query role
	row := db.QueryRow(query, args...)

	// Scan row into role
	var role Role
	err := row.Scan(
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
			return nil, nil
		}
		return nil, err
	}

	return &role, nil
}

// GetAllRoles gets all roles
func GetAllRoles(db *sql.DB, tenantID *int) ([]Role, error) {
	// Build query
	query := `
		SELECT id, name, display_name, description, tenant_id, created_at, updated_at
		FROM roles
	`
	args := []interface{}{}
	if tenantID != nil {
		query += " WHERE tenant_id = $1"
		args = append(args, *tenantID)
	}
	query += " ORDER BY id"

	// Query roles
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Scan rows into roles
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

	return roles, nil
}

// CreateRole creates a new role
func CreateRole(db *sql.DB, input CreateRoleInput) (*Role, error) {
	// Insert role
	var role Role
	err := db.QueryRow(`
		INSERT INTO roles (
			name, display_name, description, tenant_id, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6
		) RETURNING id, name, display_name, description, tenant_id, created_at, updated_at
	`,
		input.Name,
		input.DisplayName,
		input.Description,
		input.TenantID,
		time.Now(),
		time.Now(),
	).Scan(
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

	return &role, nil
}

// UpdateRole updates a role
func UpdateRole(db *sql.DB, id int, input UpdateRoleInput) (*Role, error) {
	// Get current role
	role, err := GetRoleByID(db, id)
	if err != nil {
		return nil, err
	}
	if role == nil {
		return nil, fmt.Errorf("role not found")
	}

	// Build query
	query := "UPDATE roles SET updated_at = $1"
	args := []interface{}{time.Now()}
	argCount := 2

	// Add fields to update
	if input.Name != nil {
		query += fmt.Sprintf(", name = $%d", argCount)
		args = append(args, *input.Name)
		argCount++
	}
	if input.DisplayName != nil {
		query += fmt.Sprintf(", display_name = $%d", argCount)
		args = append(args, *input.DisplayName)
		argCount++
	}
	if input.Description != nil {
		query += fmt.Sprintf(", description = $%d", argCount)
		args = append(args, *input.Description)
		argCount++
	}
	if input.TenantID != nil {
		query += fmt.Sprintf(", tenant_id = $%d", argCount)
		args = append(args, *input.TenantID)
		argCount++
	}

	// Add where clause
	query += fmt.Sprintf(" WHERE id = $%d RETURNING id, name, display_name, description, tenant_id, created_at, updated_at", argCount)
	args = append(args, id)

	// Execute query
	row := db.QueryRow(query, args...)
	err = row.Scan(
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

	return role, nil
}

// DeleteRole deletes a role
func DeleteRole(db *sql.DB, id int) error {
	// Delete role
	_, err := db.Exec("DELETE FROM roles WHERE id = $1", id)
	return err
}

// UserRole represents a user-role association
type UserRole struct {
	UserID   int       `json:"userId"`
	RoleID   int       `json:"roleId"`
	TenantID int       `json:"tenantId"`
	CreatedAt time.Time `json:"createdAt"`
}

// CreateUserRoleInput represents the input for creating a user-role association
type CreateUserRoleInput struct {
	UserID   int `json:"userId" binding:"required"`
	RoleID   int `json:"roleId" binding:"required"`
	TenantID int `json:"tenantId" binding:"required"`
}

// AssignRoleToUser assigns a role to a user
func AssignRoleToUser(db *sql.DB, input CreateUserRoleInput) (*UserRole, error) {
	// Check if user exists
	user, err := GetUserByID(db, input.UserID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("user not found")
	}

	// Check if role exists
	role, err := GetRoleByID(db, input.RoleID)
	if err != nil {
		return nil, err
	}
	if role == nil {
		return nil, fmt.Errorf("role not found")
	}

	// Check if tenant exists
	tenant, err := GetTenantByID(db, input.TenantID)
	if err != nil {
		return nil, err
	}
	if tenant == nil {
		return nil, fmt.Errorf("tenant not found")
	}

	// Check if user already has this role
	var count int
	err = db.QueryRow(`
		SELECT COUNT(*)
		FROM user_roles
		WHERE user_id = $1 AND role_id = $2 AND tenant_id = $3
	`, input.UserID, input.RoleID, input.TenantID).Scan(&count)
	if err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, fmt.Errorf("user already has this role")
	}

	// Insert user role
	var userRole UserRole
	err = db.QueryRow(`
		INSERT INTO user_roles (
			user_id, role_id, tenant_id, created_at
		) VALUES (
			$1, $2, $3, $4
		) RETURNING user_id, role_id, tenant_id, created_at
	`,
		input.UserID,
		input.RoleID,
		input.TenantID,
		time.Now(),
	).Scan(
		&userRole.UserID,
		&userRole.RoleID,
		&userRole.TenantID,
		&userRole.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &userRole, nil
}

// RemoveRoleFromUser removes a role from a user
func RemoveRoleFromUser(db *sql.DB, userID, roleID int, tenantID *int) error {
	// Build query
	query := "DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2"
	args := []interface{}{userID, roleID}
	if tenantID != nil {
		query += " AND tenant_id = $3"
		args = append(args, *tenantID)
	}

	// Execute query
	_, err := db.Exec(query, args...)
	return err
}

// GetUserRoles gets all roles for a user
func GetUserRoles(db *sql.DB, userID int, tenantID *int) ([]Role, error) {
	// Build query
	query := `
		SELECT r.id, r.name, r.display_name, r.description, r.tenant_id, r.created_at, r.updated_at
		FROM roles r
		INNER JOIN user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = $1
	`
	args := []interface{}{userID}
	if tenantID != nil {
		query += " AND ur.tenant_id = $2"
		args = append(args, *tenantID)
	}
	query += " ORDER BY r.id"

	// Query roles
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Scan rows into roles
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

	return roles, nil
}