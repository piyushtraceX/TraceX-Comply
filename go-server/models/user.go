package models

import (
	"database/sql"
	"time"
)

// User represents a user in the system
type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	Password     string    `json:"password,omitempty"`
	Email        string    `json:"email"`
	DisplayName  string    `json:"name"`
	Avatar       *string   `json:"avatar"`
	TenantID     *int      `json:"tenantId"`
	IsActive     bool      `json:"isActive"`
	IsSuperAdmin bool      `json:"isSuperAdmin"`
	LastLogin    time.Time `json:"lastLogin"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	CasdoorID    *string   `json:"casdoorId"`
	Roles        []string  `json:"roles,omitempty"`
}

// CreateUserInput represents the input for creating a new user
type CreateUserInput struct {
	Username     string  `json:"username" binding:"required"`
	Password     string  `json:"password" binding:"required"`
	Email        string  `json:"email" binding:"required,email"`
	DisplayName  string  `json:"name" binding:"required"`
	Avatar       *string `json:"avatar"`
	TenantID     *int    `json:"tenantId"`
	IsActive     bool    `json:"isActive"`
	IsSuperAdmin bool    `json:"isSuperAdmin"`
	CasdoorID    *string `json:"casdoorId"`
}

// UpdateUserInput represents the input for updating a user
type UpdateUserInput struct {
	Username     *string `json:"username"`
	Password     *string `json:"password"`
	Email        *string `json:"email"`
	DisplayName  *string `json:"name"`
	Avatar       *string `json:"avatar"`
	TenantID     *int    `json:"tenantId"`
	IsActive     *bool   `json:"isActive"`
	IsSuperAdmin *bool   `json:"isSuperAdmin"`
	CasdoorID    *string `json:"casdoorId"`
}

// CreateUser creates a new user in the database
func CreateUser(db *sql.DB, input CreateUserInput) (*User, error) {
	var user User
	query := `
		INSERT INTO users (username, password, email, display_name, avatar, tenant_id, is_active, is_super_admin, casdoor_id, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
		RETURNING id, username, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
	`

	err := db.QueryRow(
		query,
		input.Username,
		input.Password,
		input.Email,
		input.DisplayName,
		input.Avatar,
		input.TenantID,
		input.IsActive,
		input.IsSuperAdmin,
		input.CasdoorID,
	).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.DisplayName,
		&user.Avatar,
		&user.TenantID,
		&user.IsActive,
		&user.IsSuperAdmin,
		&user.LastLogin,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.CasdoorID,
	)

	if err != nil {
		return nil, err
	}

	return &user, nil
}

// GetUserByID gets a user by ID
func GetUserByID(db *sql.DB, id int) (*User, error) {
	var user User
	query := `
		SELECT id, username, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
		FROM users
		WHERE id = $1
	`

	err := db.QueryRow(query, id).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.DisplayName,
		&user.Avatar,
		&user.TenantID,
		&user.IsActive,
		&user.IsSuperAdmin,
		&user.LastLogin,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.CasdoorID,
	)

	if err != nil {
		return nil, err
	}

	// Get user roles
	userRoles, err := GetUserRoles(db, user.ID, user.TenantID)
	if err == nil {
		user.Roles = userRoles
	}

	return &user, nil
}

// GetUserByUsername gets a user by username
func GetUserByUsername(db *sql.DB, username string) (*User, error) {
	var user User
	query := `
		SELECT id, username, password, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
		FROM users
		WHERE username = $1
	`

	err := db.QueryRow(query, username).Scan(
		&user.ID,
		&user.Username,
		&user.Password,
		&user.Email,
		&user.DisplayName,
		&user.Avatar,
		&user.TenantID,
		&user.IsActive,
		&user.IsSuperAdmin,
		&user.LastLogin,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.CasdoorID,
	)

	if err != nil {
		return nil, err
	}

	// Get user roles
	userRoles, err := GetUserRoles(db, user.ID, user.TenantID)
	if err == nil {
		user.Roles = userRoles
	}

	return &user, nil
}

// GetUserByCasdoorID gets a user by CasdoorID
func GetUserByCasdoorID(db *sql.DB, casdoorID string) (*User, error) {
	var user User
	query := `
		SELECT id, username, password, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
		FROM users
		WHERE casdoor_id = $1
	`

	err := db.QueryRow(query, casdoorID).Scan(
		&user.ID,
		&user.Username,
		&user.Password,
		&user.Email,
		&user.DisplayName,
		&user.Avatar,
		&user.TenantID,
		&user.IsActive,
		&user.IsSuperAdmin,
		&user.LastLogin,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.CasdoorID,
	)

	if err != nil {
		return nil, err
	}

	// Get user roles
	userRoles, err := GetUserRoles(db, user.ID, user.TenantID)
	if err == nil {
		user.Roles = userRoles
	}

	return &user, nil
}

// GetAllUsers gets all users, optionally filtered by tenantID
func GetAllUsers(db *sql.DB, tenantID *int) ([]User, error) {
	var users []User
	var query string
	var rows *sql.Rows
	var err error

	if tenantID != nil {
		query = `
			SELECT id, username, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
			FROM users
			WHERE tenant_id = $1 OR tenant_id IS NULL
		`
		rows, err = db.Query(query, tenantID)
	} else {
		query = `
			SELECT id, username, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
			FROM users
		`
		rows, err = db.Query(query)
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user User
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.Email,
			&user.DisplayName,
			&user.Avatar,
			&user.TenantID,
			&user.IsActive,
			&user.IsSuperAdmin,
			&user.LastLogin,
			&user.CreatedAt,
			&user.UpdatedAt,
			&user.CasdoorID,
		)
		if err != nil {
			return nil, err
		}

		// Get user roles
		userRoles, err := GetUserRoles(db, user.ID, user.TenantID)
		if err == nil {
			user.Roles = userRoles
		}

		users = append(users, user)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}

// UpdateUser updates a user
func UpdateUser(db *sql.DB, id int, input UpdateUserInput) (*User, error) {
	// Get current user
	currentUser, err := GetUserByID(db, id)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	query := `
		UPDATE users
		SET 
			username = COALESCE($1, username),
			password = COALESCE($2, password),
			email = COALESCE($3, email),
			display_name = COALESCE($4, display_name),
			avatar = $5,
			tenant_id = $6,
			is_active = COALESCE($7, is_active),
			is_super_admin = COALESCE($8, is_super_admin),
			casdoor_id = $9,
			updated_at = NOW()
		WHERE id = $10
		RETURNING id, username, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
	`

	var user User
	err = db.QueryRow(
		query,
		input.Username,
		input.Password,
		input.Email,
		input.DisplayName,
		input.Avatar,
		input.TenantID,
		input.IsActive,
		input.IsSuperAdmin,
		input.CasdoorID,
		id,
	).Scan(
		&user.ID,
		&user.Username,
		&user.Email,
		&user.DisplayName,
		&user.Avatar,
		&user.TenantID,
		&user.IsActive,
		&user.IsSuperAdmin,
		&user.LastLogin,
		&user.CreatedAt,
		&user.UpdatedAt,
		&user.CasdoorID,
	)

	if err != nil {
		return nil, err
	}

	// Get user roles
	userRoles, err := GetUserRoles(db, user.ID, user.TenantID)
	if err == nil {
		user.Roles = userRoles
	}

	return &user, nil
}

// UpdateUserLoginTime updates a user's last login time
func UpdateUserLoginTime(db *sql.DB, id int) error {
	query := `UPDATE users SET last_login = NOW() WHERE id = $1`
	_, err := db.Exec(query, id)
	return err
}

// DeleteUser deletes a user
func DeleteUser(db *sql.DB, id int) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := db.Exec(query, id)
	return err
}

// GetUserRoles gets the roles for a user
func GetUserRoles(db *sql.DB, userID int, tenantID *int) ([]string, error) {
	var roles []string
	var rows *sql.Rows
	var err error
	var query string

	if tenantID != nil {
		query = `
			SELECT r.name
			FROM roles r
			JOIN user_roles ur ON r.id = ur.role_id
			WHERE ur.user_id = $1 AND (r.tenant_id = $2 OR r.tenant_id IS NULL)
		`
		rows, err = db.Query(query, userID, tenantID)
	} else {
		query = `
			SELECT r.name
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
		var role string
		if err := rows.Scan(&role); err != nil {
			return nil, err
		}
		roles = append(roles, role)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return roles, nil
}