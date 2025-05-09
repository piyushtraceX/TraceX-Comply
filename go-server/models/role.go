package models

import (
	"database/sql"
	"time"
)

// Role represents a role in the system
type Role struct {
	ID          int        `json:"id"`
	Name        string     `json:"name"`
	DisplayName string     `json:"displayName"`
	Description string     `json:"description"`
	TenantID    *int       `json:"tenantId"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
	Permissions []Permission `json:"permissions,omitempty"`
}

// CreateRoleInput represents the input for creating a new role
type CreateRoleInput struct {
	Name        string `json:"name" binding:"required"`
	DisplayName string `json:"displayName" binding:"required"`
	Description string `json:"description"`
	TenantID    *int   `json:"tenantId"`
}

// UpdateRoleInput represents the input for updating a role
type UpdateRoleInput struct {
	Name        *string `json:"name"`
	DisplayName *string `json:"displayName"`
	Description *string `json:"description"`
	TenantID    *int    `json:"tenantId"`
}

// UserRole represents a user-role assignment
type UserRole struct {
	UserID    int       `json:"userId"`
	RoleID    int       `json:"roleId"`
	TenantID  *int      `json:"tenantId"`
	CreatedAt time.Time `json:"createdAt"`
}

// CreateUserRoleInput represents the input for assigning a role to a user
type CreateUserRoleInput struct {
	UserID   int  `json:"userId" binding:"required"`
	RoleID   int  `json:"roleId" binding:"required"`
	TenantID *int `json:"tenantId"`
}

// CreateRole creates a new role in the database
func CreateRole(db *sql.DB, input CreateRoleInput) (*Role, error) {
	var role Role
	query := `
		INSERT INTO roles (name, display_name, description, tenant_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, name, display_name, description, tenant_id, created_at, updated_at
	`

	err := db.QueryRow(
		query,
		input.Name,
		input.DisplayName,
		input.Description,
		input.TenantID,
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

// GetRoleByID gets a role by ID
func GetRoleByID(db *sql.DB, id int) (*Role, error) {
	var role Role
	query := `
		SELECT id, name, display_name, description, tenant_id, created_at, updated_at
		FROM roles
		WHERE id = $1
	`

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
		return nil, err
	}

	// Get role permissions
	permissions, err := GetPermissionsByRoleID(db, role.ID)
	if err == nil {
		role.Permissions = permissions
	}

	return &role, nil
}

// GetRoleByName gets a role by name
func GetRoleByName(db *sql.DB, name string, tenantID *int) (*Role, error) {
	var role Role
	var query string
	var err error

	if tenantID != nil {
		query = `
			SELECT id, name, display_name, description, tenant_id, created_at, updated_at
			FROM roles
			WHERE name = $1 AND (tenant_id = $2 OR tenant_id IS NULL)
		`
		err = db.QueryRow(query, name, tenantID).Scan(
			&role.ID,
			&role.Name,
			&role.DisplayName,
			&role.Description,
			&role.TenantID,
			&role.CreatedAt,
			&role.UpdatedAt,
		)
	} else {
		query = `
			SELECT id, name, display_name, description, tenant_id, created_at, updated_at
			FROM roles
			WHERE name = $1
		`
		err = db.QueryRow(query, name).Scan(
			&role.ID,
			&role.Name,
			&role.DisplayName,
			&role.Description,
			&role.TenantID,
			&role.CreatedAt,
			&role.UpdatedAt,
		)
	}

	if err != nil {
		return nil, err
	}

	// Get role permissions
	permissions, err := GetPermissionsByRoleID(db, role.ID)
	if err == nil {
		role.Permissions = permissions
	}

	return &role, nil
}

// GetAllRoles gets all roles
func GetAllRoles(db *sql.DB, tenantID *int) ([]Role, error) {
	var roles []Role
	var query string
	var rows *sql.Rows
	var err error

	if tenantID != nil {
		query = `
			SELECT id, name, display_name, description, tenant_id, created_at, updated_at
			FROM roles
			WHERE tenant_id = $1 OR tenant_id IS NULL
		`
		rows, err = db.Query(query, tenantID)
	} else {
		query = `
			SELECT id, name, display_name, description, tenant_id, created_at, updated_at
			FROM roles
		`
		rows, err = db.Query(query)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

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

		// Get role permissions
		permissions, err := GetPermissionsByRoleID(db, role.ID)
		if err == nil {
			role.Permissions = permissions
		}

		roles = append(roles, role)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return roles, nil
}

// UpdateRole updates a role
func UpdateRole(db *sql.DB, id int, input UpdateRoleInput) (*Role, error) {
	query := `
		UPDATE roles
		SET 
			name = COALESCE($1, name),
			display_name = COALESCE($2, display_name),
			description = COALESCE($3, description),
			tenant_id = $4,
			updated_at = NOW()
		WHERE id = $5
		RETURNING id, name, display_name, description, tenant_id, created_at, updated_at
	`

	var role Role
	err := db.QueryRow(
		query,
		input.Name,
		input.DisplayName,
		input.Description,
		input.TenantID,
		id,
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

	// Get role permissions
	permissions, err := GetPermissionsByRoleID(db, role.ID)
	if err == nil {
		role.Permissions = permissions
	}

	return &role, nil
}

// DeleteRole deletes a role
func DeleteRole(db *sql.DB, id int) error {
	// Start a transaction
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Delete role permissions
	_, err = tx.Exec("DELETE FROM permissions WHERE role_id = $1", id)
	if err != nil {
		return err
	}

	// Delete user-role assignments
	_, err = tx.Exec("DELETE FROM user_roles WHERE role_id = $1", id)
	if err != nil {
		return err
	}

	// Delete the role
	_, err = tx.Exec("DELETE FROM roles WHERE id = $1", id)
	if err != nil {
		return err
	}

	// Commit the transaction
	return tx.Commit()
}

// AssignRoleToUser assigns a role to a user
func AssignRoleToUser(db *sql.DB, input CreateUserRoleInput) (*UserRole, error) {
	var userRole UserRole
	query := `
		INSERT INTO user_roles (user_id, role_id, tenant_id, created_at)
		VALUES ($1, $2, $3, NOW())
		RETURNING user_id, role_id, tenant_id, created_at
	`

	err := db.QueryRow(
		query,
		input.UserID,
		input.RoleID,
		input.TenantID,
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
	var query string
	var err error

	if tenantID != nil {
		query = "DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2 AND tenant_id = $3"
		_, err = db.Exec(query, userID, roleID, tenantID)
	} else {
		query = "DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2"
		_, err = db.Exec(query, userID, roleID)
	}

	return err
}

// GetUserRolesByUserID gets all roles for a user
func GetUserRolesByUserID(db *sql.DB, userID int, tenantID *int) ([]Role, error) {
	var roles []Role
	var query string
	var rows *sql.Rows
	var err error

	if tenantID != nil {
		query = `
			SELECT r.id, r.name, r.display_name, r.description, r.tenant_id, r.created_at, r.updated_at
			FROM roles r
			JOIN user_roles ur ON r.id = ur.role_id
			WHERE ur.user_id = $1 AND (ur.tenant_id = $2 OR ur.tenant_id IS NULL)
		`
		rows, err = db.Query(query, userID, tenantID)
	} else {
		query = `
			SELECT r.id, r.name, r.display_name, r.description, r.tenant_id, r.created_at, r.updated_at
			FROM roles r
			JOIN user_roles ur ON r.id = ur.role_id
			WHERE ur.user_id = $1
		`
		rows, err = db.Query(query, userID)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

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

		// Get role permissions
		permissions, err := GetPermissionsByRoleID(db, role.ID)
		if err == nil {
			role.Permissions = permissions
		}

		roles = append(roles, role)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return roles, nil
}