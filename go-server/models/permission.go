package models

import (
	"database/sql"
	"fmt"
	"time"
)

// Resource represents a resource in the system
type Resource struct {
	ID          int       `json:"id"`
	Type        string    `json:"type"`
	Name        string    `json:"name"`
	DisplayName string    `json:"displayName"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// Action represents an action in the system
type Action struct {
	ID          int       `json:"id"`
	Name        string    `json:"name"`
	DisplayName string    `json:"displayName"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// Permission represents a permission in the system
type Permission struct {
	ID         int       `json:"id"`
	RoleID     int       `json:"roleId"`
	ResourceID int       `json:"resourceId"`
	ActionID   int       `json:"actionId"`
	TenantID   int       `json:"tenantId"`
	CreatedAt  time.Time `json:"createdAt"`
	Resource   *Resource `json:"resource,omitempty"`
	Action     *Action   `json:"action,omitempty"`
}

// CreateResourceInput represents the input for creating a resource
type CreateResourceInput struct {
	Type        string `json:"type" binding:"required"`
	Name        string `json:"name" binding:"required"`
	DisplayName string `json:"displayName" binding:"required"`
	Description string `json:"description" binding:"required"`
}

// CreateActionInput represents the input for creating an action
type CreateActionInput struct {
	Name        string `json:"name" binding:"required"`
	DisplayName string `json:"displayName" binding:"required"`
	Description string `json:"description" binding:"required"`
}

// CreatePermissionInput represents the input for creating a permission
type CreatePermissionInput struct {
	RoleID     int `json:"roleId" binding:"required"`
	ResourceID int `json:"resourceId" binding:"required"`
	ActionID   int `json:"actionId" binding:"required"`
	TenantID   int `json:"tenantId" binding:"required"`
}

// GetResourceByID gets a resource by ID
func GetResourceByID(db *sql.DB, id int) (*Resource, error) {
	// Query resource
	row := db.QueryRow(`
		SELECT id, type, name, display_name, description, created_at, updated_at
		FROM resources
		WHERE id = $1
	`, id)

	// Scan row into resource
	var resource Resource
	err := row.Scan(
		&resource.ID,
		&resource.Type,
		&resource.Name,
		&resource.DisplayName,
		&resource.Description,
		&resource.CreatedAt,
		&resource.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &resource, nil
}

// GetResourceByName gets a resource by type and name
func GetResourceByName(db *sql.DB, resourceType, name string) (*Resource, error) {
	// Query resource
	row := db.QueryRow(`
		SELECT id, type, name, display_name, description, created_at, updated_at
		FROM resources
		WHERE type = $1 AND name = $2
	`, resourceType, name)

	// Scan row into resource
	var resource Resource
	err := row.Scan(
		&resource.ID,
		&resource.Type,
		&resource.Name,
		&resource.DisplayName,
		&resource.Description,
		&resource.CreatedAt,
		&resource.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &resource, nil
}

// GetAllResources gets all resources
func GetAllResources(db *sql.DB) ([]Resource, error) {
	// Query resources
	rows, err := db.Query(`
		SELECT id, type, name, display_name, description, created_at, updated_at
		FROM resources
		ORDER BY type, name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Scan rows into resources
	var resources []Resource
	for rows.Next() {
		var resource Resource
		err := rows.Scan(
			&resource.ID,
			&resource.Type,
			&resource.Name,
			&resource.DisplayName,
			&resource.Description,
			&resource.CreatedAt,
			&resource.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		resources = append(resources, resource)
	}

	return resources, nil
}

// CreateResource creates a new resource
func CreateResource(db *sql.DB, input CreateResourceInput) (*Resource, error) {
	// Insert resource
	var resource Resource
	err := db.QueryRow(`
		INSERT INTO resources (
			type, name, display_name, description, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6
		) RETURNING id, type, name, display_name, description, created_at, updated_at
	`,
		input.Type,
		input.Name,
		input.DisplayName,
		input.Description,
		time.Now(),
		time.Now(),
	).Scan(
		&resource.ID,
		&resource.Type,
		&resource.Name,
		&resource.DisplayName,
		&resource.Description,
		&resource.CreatedAt,
		&resource.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &resource, nil
}

// GetActionByID gets an action by ID
func GetActionByID(db *sql.DB, id int) (*Action, error) {
	// Query action
	row := db.QueryRow(`
		SELECT id, name, display_name, description, created_at, updated_at
		FROM actions
		WHERE id = $1
	`, id)

	// Scan row into action
	var action Action
	err := row.Scan(
		&action.ID,
		&action.Name,
		&action.DisplayName,
		&action.Description,
		&action.CreatedAt,
		&action.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &action, nil
}

// GetActionByName gets an action by name
func GetActionByName(db *sql.DB, name string) (*Action, error) {
	// Query action
	row := db.QueryRow(`
		SELECT id, name, display_name, description, created_at, updated_at
		FROM actions
		WHERE name = $1
	`, name)

	// Scan row into action
	var action Action
	err := row.Scan(
		&action.ID,
		&action.Name,
		&action.DisplayName,
		&action.Description,
		&action.CreatedAt,
		&action.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &action, nil
}

// GetAllActions gets all actions
func GetAllActions(db *sql.DB) ([]Action, error) {
	// Query actions
	rows, err := db.Query(`
		SELECT id, name, display_name, description, created_at, updated_at
		FROM actions
		ORDER BY name
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Scan rows into actions
	var actions []Action
	for rows.Next() {
		var action Action
		err := rows.Scan(
			&action.ID,
			&action.Name,
			&action.DisplayName,
			&action.Description,
			&action.CreatedAt,
			&action.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		actions = append(actions, action)
	}

	return actions, nil
}

// CreateAction creates a new action
func CreateAction(db *sql.DB, input CreateActionInput) (*Action, error) {
	// Insert action
	var action Action
	err := db.QueryRow(`
		INSERT INTO actions (
			name, display_name, description, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5
		) RETURNING id, name, display_name, description, created_at, updated_at
	`,
		input.Name,
		input.DisplayName,
		input.Description,
		time.Now(),
		time.Now(),
	).Scan(
		&action.ID,
		&action.Name,
		&action.DisplayName,
		&action.Description,
		&action.CreatedAt,
		&action.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &action, nil
}

// GetPermissionByID gets a permission by ID
func GetPermissionByID(db *sql.DB, id int) (*Permission, error) {
	// Query permission
	row := db.QueryRow(`
		SELECT id, role_id, resource_id, action_id, tenant_id, created_at
		FROM permissions
		WHERE id = $1
	`, id)

	// Scan row into permission
	var permission Permission
	err := row.Scan(
		&permission.ID,
		&permission.RoleID,
		&permission.ResourceID,
		&permission.ActionID,
		&permission.TenantID,
		&permission.CreatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	// Get resource
	resource, err := GetResourceByID(db, permission.ResourceID)
	if err != nil {
		return nil, err
	}
	permission.Resource = resource

	// Get action
	action, err := GetActionByID(db, permission.ActionID)
	if err != nil {
		return nil, err
	}
	permission.Action = action

	return &permission, nil
}

// GetAllPermissions gets all permissions
func GetAllPermissions(db *sql.DB, roleID, tenantID *int) ([]Permission, error) {
	// Build query
	query := `
		SELECT p.id, p.role_id, p.resource_id, p.action_id, p.tenant_id, p.created_at,
			r.id as r_id, r.type as r_type, r.name as r_name, r.display_name as r_display_name, r.description as r_description, r.created_at as r_created_at, r.updated_at as r_updated_at,
			a.id as a_id, a.name as a_name, a.display_name as a_display_name, a.description as a_description, a.created_at as a_created_at, a.updated_at as a_updated_at
		FROM permissions p
		INNER JOIN resources r ON p.resource_id = r.id
		INNER JOIN actions a ON p.action_id = a.id
		WHERE 1=1
	`
	args := []interface{}{}
	if roleID != nil {
		query += fmt.Sprintf(" AND p.role_id = $%d", len(args)+1)
		args = append(args, *roleID)
	}
	if tenantID != nil {
		query += fmt.Sprintf(" AND p.tenant_id = $%d", len(args)+1)
		args = append(args, *tenantID)
	}
	query += " ORDER BY p.id"

	// Query permissions
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Scan rows into permissions
	var permissions []Permission
	for rows.Next() {
		var permission Permission
		var resource Resource
		var action Action

		err := rows.Scan(
			&permission.ID,
			&permission.RoleID,
			&permission.ResourceID,
			&permission.ActionID,
			&permission.TenantID,
			&permission.CreatedAt,
			&resource.ID,
			&resource.Type,
			&resource.Name,
			&resource.DisplayName,
			&resource.Description,
			&resource.CreatedAt,
			&resource.UpdatedAt,
			&action.ID,
			&action.Name,
			&action.DisplayName,
			&action.Description,
			&action.CreatedAt,
			&action.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		permission.Resource = &resource
		permission.Action = &action
		permissions = append(permissions, permission)
	}

	return permissions, nil
}

// CreatePermission creates a new permission
func CreatePermission(db *sql.DB, input CreatePermissionInput) (*Permission, error) {
	// Check if role exists
	role, err := GetRoleByID(db, input.RoleID)
	if err != nil {
		return nil, err
	}
	if role == nil {
		return nil, fmt.Errorf("role not found")
	}

	// Check if resource exists
	resource, err := GetResourceByID(db, input.ResourceID)
	if err != nil {
		return nil, err
	}
	if resource == nil {
		return nil, fmt.Errorf("resource not found")
	}

	// Check if action exists
	action, err := GetActionByID(db, input.ActionID)
	if err != nil {
		return nil, err
	}
	if action == nil {
		return nil, fmt.Errorf("action not found")
	}

	// Check if permission already exists
	var count int
	err = db.QueryRow(`
		SELECT COUNT(*)
		FROM permissions
		WHERE role_id = $1 AND resource_id = $2 AND action_id = $3 AND tenant_id = $4
	`, input.RoleID, input.ResourceID, input.ActionID, input.TenantID).Scan(&count)
	if err != nil {
		return nil, err
	}
	if count > 0 {
		return nil, fmt.Errorf("permission already exists")
	}

	// Insert permission
	var permission Permission
	err = db.QueryRow(`
		INSERT INTO permissions (
			role_id, resource_id, action_id, tenant_id, created_at
		) VALUES (
			$1, $2, $3, $4, $5
		) RETURNING id, role_id, resource_id, action_id, tenant_id, created_at
	`,
		input.RoleID,
		input.ResourceID,
		input.ActionID,
		input.TenantID,
		time.Now(),
	).Scan(
		&permission.ID,
		&permission.RoleID,
		&permission.ResourceID,
		&permission.ActionID,
		&permission.TenantID,
		&permission.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	// Add resource and action to permission
	permission.Resource = resource
	permission.Action = action

	return &permission, nil
}

// DeletePermission deletes a permission
func DeletePermission(db *sql.DB, id int) error {
	// Delete permission
	_, err := db.Exec("DELETE FROM permissions WHERE id = $1", id)
	return err
}