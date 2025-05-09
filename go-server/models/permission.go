package models

import (
	"database/sql"
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
	ID          int       `json:"id"`
	RoleID      int       `json:"roleId"`
	ResourceID  int       `json:"resourceId"`
	ActionID    int       `json:"actionId"`
	TenantID    *int      `json:"tenantId"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
	Resource    *Resource `json:"resource,omitempty"`
	Action      *Action   `json:"action,omitempty"`
}

// CreateResourceInput represents the input for creating a new resource
type CreateResourceInput struct {
	Type        string `json:"type" binding:"required"`
	Name        string `json:"name" binding:"required"`
	DisplayName string `json:"displayName" binding:"required"`
	Description string `json:"description"`
}

// CreateActionInput represents the input for creating a new action
type CreateActionInput struct {
	Name        string `json:"name" binding:"required"`
	DisplayName string `json:"displayName" binding:"required"`
	Description string `json:"description"`
}

// CreatePermissionInput represents the input for creating a new permission
type CreatePermissionInput struct {
	RoleID     int  `json:"roleId" binding:"required"`
	ResourceID int  `json:"resourceId" binding:"required"`
	ActionID   int  `json:"actionId" binding:"required"`
	TenantID   *int `json:"tenantId"`
}

// CreateResource creates a new resource
func CreateResource(db *sql.DB, input CreateResourceInput) (*Resource, error) {
	var resource Resource
	query := `
		INSERT INTO resources (type, name, display_name, description, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, type, name, display_name, description, created_at, updated_at
	`

	err := db.QueryRow(
		query,
		input.Type,
		input.Name,
		input.DisplayName,
		input.Description,
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

// GetResourceByID gets a resource by ID
func GetResourceByID(db *sql.DB, id int) (*Resource, error) {
	var resource Resource
	query := `
		SELECT id, type, name, display_name, description, created_at, updated_at
		FROM resources
		WHERE id = $1
	`

	err := db.QueryRow(query, id).Scan(
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

// GetResourceByName gets a resource by type and name
func GetResourceByName(db *sql.DB, resourceType, name string) (*Resource, error) {
	var resource Resource
	query := `
		SELECT id, type, name, display_name, description, created_at, updated_at
		FROM resources
		WHERE type = $1 AND name = $2
	`

	err := db.QueryRow(query, resourceType, name).Scan(
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

// GetAllResources gets all resources
func GetAllResources(db *sql.DB) ([]Resource, error) {
	var resources []Resource
	query := `
		SELECT id, type, name, display_name, description, created_at, updated_at
		FROM resources
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

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

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return resources, nil
}

// CreateAction creates a new action
func CreateAction(db *sql.DB, input CreateActionInput) (*Action, error) {
	var action Action
	query := `
		INSERT INTO actions (name, display_name, description, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, name, display_name, description, created_at, updated_at
	`

	err := db.QueryRow(
		query,
		input.Name,
		input.DisplayName,
		input.Description,
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

// GetActionByID gets an action by ID
func GetActionByID(db *sql.DB, id int) (*Action, error) {
	var action Action
	query := `
		SELECT id, name, display_name, description, created_at, updated_at
		FROM actions
		WHERE id = $1
	`

	err := db.QueryRow(query, id).Scan(
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

// GetActionByName gets an action by name
func GetActionByName(db *sql.DB, name string) (*Action, error) {
	var action Action
	query := `
		SELECT id, name, display_name, description, created_at, updated_at
		FROM actions
		WHERE name = $1
	`

	err := db.QueryRow(query, name).Scan(
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

// GetAllActions gets all actions
func GetAllActions(db *sql.DB) ([]Action, error) {
	var actions []Action
	query := `
		SELECT id, name, display_name, description, created_at, updated_at
		FROM actions
	`

	rows, err := db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

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

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return actions, nil
}

// CreatePermission creates a new permission
func CreatePermission(db *sql.DB, input CreatePermissionInput) (*Permission, error) {
	var permission Permission
	query := `
		INSERT INTO permissions (role_id, resource_id, action_id, tenant_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, NOW(), NOW())
		RETURNING id, role_id, resource_id, action_id, tenant_id, created_at, updated_at
	`

	err := db.QueryRow(
		query,
		input.RoleID,
		input.ResourceID,
		input.ActionID,
		input.TenantID,
	).Scan(
		&permission.ID,
		&permission.RoleID,
		&permission.ResourceID,
		&permission.ActionID,
		&permission.TenantID,
		&permission.CreatedAt,
		&permission.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	// Get the associated resource and action
	resource, err := GetResourceByID(db, permission.ResourceID)
	if err == nil {
		permission.Resource = resource
	}

	action, err := GetActionByID(db, permission.ActionID)
	if err == nil {
		permission.Action = action
	}

	return &permission, nil
}

// GetPermissionByID gets a permission by ID
func GetPermissionByID(db *sql.DB, id int) (*Permission, error) {
	var permission Permission
	query := `
		SELECT id, role_id, resource_id, action_id, tenant_id, created_at, updated_at
		FROM permissions
		WHERE id = $1
	`

	err := db.QueryRow(query, id).Scan(
		&permission.ID,
		&permission.RoleID,
		&permission.ResourceID,
		&permission.ActionID,
		&permission.TenantID,
		&permission.CreatedAt,
		&permission.UpdatedAt,
	)

	if err != nil {
		return nil, err
	}

	// Get the associated resource and action
	resource, err := GetResourceByID(db, permission.ResourceID)
	if err == nil {
		permission.Resource = resource
	}

	action, err := GetActionByID(db, permission.ActionID)
	if err == nil {
		permission.Action = action
	}

	return &permission, nil
}

// GetPermissionsByRoleID gets all permissions for a role
func GetPermissionsByRoleID(db *sql.DB, roleID int) ([]Permission, error) {
	var permissions []Permission
	query := `
		SELECT p.id, p.role_id, p.resource_id, p.action_id, p.tenant_id, p.created_at, p.updated_at
		FROM permissions p
		WHERE p.role_id = $1
	`

	rows, err := db.Query(query, roleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var permission Permission
		err := rows.Scan(
			&permission.ID,
			&permission.RoleID,
			&permission.ResourceID,
			&permission.ActionID,
			&permission.TenantID,
			&permission.CreatedAt,
			&permission.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Get the associated resource and action
		resource, err := GetResourceByID(db, permission.ResourceID)
		if err == nil {
			permission.Resource = resource
		}

		action, err := GetActionByID(db, permission.ActionID)
		if err == nil {
			permission.Action = action
		}

		permissions = append(permissions, permission)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return permissions, nil
}

// GetAllPermissions gets all permissions, optionally filtered by roleID and tenantID
func GetAllPermissions(db *sql.DB, roleID *int, tenantID *int) ([]Permission, error) {
	var permissions []Permission
	var query string
	var rows *sql.Rows
	var err error

	if roleID != nil && tenantID != nil {
		query = `
			SELECT p.id, p.role_id, p.resource_id, p.action_id, p.tenant_id, p.created_at, p.updated_at
			FROM permissions p
			WHERE p.role_id = $1 AND (p.tenant_id = $2 OR p.tenant_id IS NULL)
		`
		rows, err = db.Query(query, roleID, tenantID)
	} else if roleID != nil {
		query = `
			SELECT p.id, p.role_id, p.resource_id, p.action_id, p.tenant_id, p.created_at, p.updated_at
			FROM permissions p
			WHERE p.role_id = $1
		`
		rows, err = db.Query(query, roleID)
	} else if tenantID != nil {
		query = `
			SELECT p.id, p.role_id, p.resource_id, p.action_id, p.tenant_id, p.created_at, p.updated_at
			FROM permissions p
			WHERE p.tenant_id = $1 OR p.tenant_id IS NULL
		`
		rows, err = db.Query(query, tenantID)
	} else {
		query = `
			SELECT p.id, p.role_id, p.resource_id, p.action_id, p.tenant_id, p.created_at, p.updated_at
			FROM permissions p
		`
		rows, err = db.Query(query)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var permission Permission
		err := rows.Scan(
			&permission.ID,
			&permission.RoleID,
			&permission.ResourceID,
			&permission.ActionID,
			&permission.TenantID,
			&permission.CreatedAt,
			&permission.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		// Get the associated resource and action
		resource, err := GetResourceByID(db, permission.ResourceID)
		if err == nil {
			permission.Resource = resource
		}

		action, err := GetActionByID(db, permission.ActionID)
		if err == nil {
			permission.Action = action
		}

		permissions = append(permissions, permission)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return permissions, nil
}

// DeletePermission deletes a permission
func DeletePermission(db *sql.DB, id int) error {
	query := `DELETE FROM permissions WHERE id = $1`
	_, err := db.Exec(query, id)
	return err
}