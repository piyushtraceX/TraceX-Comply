package models

import (
	"database/sql"
	"crypto/rand"
	"crypto/subtle"
	"encoding/hex"
	"fmt"
	"time"
	"golang.org/x/crypto/scrypt"
)

// User represents a user in the system
type User struct {
	ID        int       `json:"id"`
	Username  string    `json:"username"`
	Password  string    `json:"password,omitempty"`
	Email     string    `json:"email"`
	DisplayName string  `json:"displayName"`
	Avatar    *string   `json:"avatar"`
	TenantID  int       `json:"tenantId"`
	IsActive  bool      `json:"isActive"`
	IsSuperAdmin bool   `json:"isSuperAdmin"`
	LastLogin *time.Time `json:"lastLogin"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
	CasdoorID *string   `json:"casdoorId"`
}

// CreateUserInput represents the input for creating a user
type CreateUserInput struct {
	Username    string  `json:"username" binding:"required"`
	Password    string  `json:"password" binding:"required"`
	Email       string  `json:"email" binding:"required"`
	DisplayName string  `json:"displayName" binding:"required"`
	Avatar      *string `json:"avatar"`
	TenantID    int     `json:"tenantId" binding:"required"`
	IsActive    bool    `json:"isActive"`
	IsSuperAdmin bool   `json:"isSuperAdmin"`
	CasdoorID   *string `json:"casdoorId"`
}

// UpdateUserInput represents the input for updating a user
type UpdateUserInput struct {
	Username    *string `json:"username"`
	Password    *string `json:"password"`
	Email       *string `json:"email"`
	DisplayName *string `json:"displayName"`
	Avatar      *string `json:"avatar"`
	TenantID    *int    `json:"tenantId"`
	IsActive    *bool   `json:"isActive"`
	IsSuperAdmin *bool  `json:"isSuperAdmin"`
	CasdoorID   *string `json:"casdoorId"`
}

// HashPassword hashes a password with scrypt
func HashPassword(password string) (string, error) {
	// Generate random salt
	salt := make([]byte, 16)
	_, err := rand.Read(salt)
	if err != nil {
		return "", err
	}

	// Hash password with scrypt
	hash, err := scrypt.Key([]byte(password), salt, 32768, 8, 1, 64)
	if err != nil {
		return "", err
	}

	// Convert to hex
	hashHex := hex.EncodeToString(hash)
	saltHex := hex.EncodeToString(salt)

	// Return combined hash.salt
	return fmt.Sprintf("%s.%s", hashHex, saltHex), nil
}

// ComparePasswords compares a password with a hash
func ComparePasswords(password, hashedPassword string) (bool, error) {
	// Split hash and salt
	parts := []byte(hashedPassword)
	hashAndSalt := split(string(parts), ".")
	if len(hashAndSalt) != 2 {
		return false, fmt.Errorf("invalid hash format")
	}

	// Decode hex
	hash, err := hex.DecodeString(hashAndSalt[0])
	if err != nil {
		return false, err
	}
	salt, err := hex.DecodeString(hashAndSalt[1])
	if err != nil {
		return false, err
	}

	// Hash password
	newHash, err := scrypt.Key([]byte(password), salt, 32768, 8, 1, 64)
	if err != nil {
		return false, err
	}

	// Compare hashes
	return subtle.ConstantTimeCompare(hash, newHash) == 1, nil
}

// split splits a string by a separator
func split(s, sep string) []string {
	result := make([]string, 0)
	start := 0
	for i := 0; i < len(s); i++ {
		if i+len(sep) <= len(s) && s[i:i+len(sep)] == sep {
			result = append(result, s[start:i])
			start = i + len(sep)
			i += len(sep) - 1
		}
	}
	result = append(result, s[start:])
	return result
}

// GetUserByID gets a user by ID
func GetUserByID(db *sql.DB, id int) (*User, error) {
	// Query user
	row := db.QueryRow(`
		SELECT id, username, password, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
		FROM users
		WHERE id = $1
	`, id)

	// Scan row into user
	var user User
	err := row.Scan(
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
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

// GetUserByUsername gets a user by username
func GetUserByUsername(db *sql.DB, username string) (*User, error) {
	// Query user
	row := db.QueryRow(`
		SELECT id, username, password, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
		FROM users
		WHERE username = $1
	`, username)

	// Scan row into user
	var user User
	err := row.Scan(
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
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

// GetUserByCasdoorID gets a user by Casdoor ID
func GetUserByCasdoorID(db *sql.DB, casdoorID string) (*User, error) {
	// Query user
	row := db.QueryRow(`
		SELECT id, username, password, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
		FROM users
		WHERE casdoor_id = $1
	`, casdoorID)

	// Scan row into user
	var user User
	err := row.Scan(
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
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}

	return &user, nil
}

// GetAllUsers gets all users
func GetAllUsers(db *sql.DB, tenantID *int) ([]User, error) {
	// Build query
	query := `
		SELECT id, username, '', email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
		FROM users
	`
	args := []interface{}{}
	if tenantID != nil {
		query += " WHERE tenant_id = $1"
		args = append(args, *tenantID)
	}
	query += " ORDER BY id"

	// Query users
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	// Scan rows into users
	var users []User
	for rows.Next() {
		var user User
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.Password, // Empty string for security
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
		users = append(users, user)
	}

	return users, nil
}

// CreateUser creates a new user
func CreateUser(db *sql.DB, input CreateUserInput) (*User, error) {
	// Hash password
	hashedPassword, err := HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	// Insert user
	var user User
	err = db.QueryRow(`
		INSERT INTO users (
			username, password, email, display_name, avatar, tenant_id, is_active, is_super_admin, created_at, updated_at, casdoor_id
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
		) RETURNING id, username, password, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
	`,
		input.Username,
		hashedPassword,
		input.Email,
		input.DisplayName,
		input.Avatar,
		input.TenantID,
		input.IsActive,
		input.IsSuperAdmin,
		time.Now(),
		time.Now(),
		input.CasdoorID,
	).Scan(
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

	return &user, nil
}

// UpdateUser updates a user
func UpdateUser(db *sql.DB, id int, input UpdateUserInput) (*User, error) {
	// Get current user
	user, err := GetUserByID(db, id)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, fmt.Errorf("user not found")
	}

	// Build query
	query := "UPDATE users SET updated_at = $1"
	args := []interface{}{time.Now()}
	argCount := 2

	// Add fields to update
	if input.Username != nil {
		query += fmt.Sprintf(", username = $%d", argCount)
		args = append(args, *input.Username)
		argCount++
	}
	if input.Password != nil {
		hashedPassword, err := HashPassword(*input.Password)
		if err != nil {
			return nil, err
		}
		query += fmt.Sprintf(", password = $%d", argCount)
		args = append(args, hashedPassword)
		argCount++
	}
	if input.Email != nil {
		query += fmt.Sprintf(", email = $%d", argCount)
		args = append(args, *input.Email)
		argCount++
	}
	if input.DisplayName != nil {
		query += fmt.Sprintf(", display_name = $%d", argCount)
		args = append(args, *input.DisplayName)
		argCount++
	}
	if input.Avatar != nil {
		query += fmt.Sprintf(", avatar = $%d", argCount)
		args = append(args, *input.Avatar)
		argCount++
	}
	if input.TenantID != nil {
		query += fmt.Sprintf(", tenant_id = $%d", argCount)
		args = append(args, *input.TenantID)
		argCount++
	}
	if input.IsActive != nil {
		query += fmt.Sprintf(", is_active = $%d", argCount)
		args = append(args, *input.IsActive)
		argCount++
	}
	if input.IsSuperAdmin != nil {
		query += fmt.Sprintf(", is_super_admin = $%d", argCount)
		args = append(args, *input.IsSuperAdmin)
		argCount++
	}
	if input.CasdoorID != nil {
		query += fmt.Sprintf(", casdoor_id = $%d", argCount)
		args = append(args, *input.CasdoorID)
		argCount++
	}

	// Add where clause
	query += fmt.Sprintf(" WHERE id = $%d RETURNING id, username, password, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id", argCount)
	args = append(args, id)

	// Execute query
	row := db.QueryRow(query, args...)
	err = row.Scan(
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

	return user, nil
}

// DeleteUser deletes a user
func DeleteUser(db *sql.DB, id int) error {
	// Delete user
	_, err := db.Exec("DELETE FROM users WHERE id = $1", id)
	return err
}

// UpdateUserLastLogin updates a user's last login time
func UpdateUserLastLogin(db *sql.DB, id int) error {
	// Update last login
	_, err := db.Exec("UPDATE users SET last_login = $1 WHERE id = $2", time.Now(), id)
	return err
}

// CreateDefaultAdminUserIfNotExists creates a default admin user if no users exist
func CreateDefaultAdminUserIfNotExists(db *sql.DB) error {
	// Check if any users exist
	var count int
	err := db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		return err
	}

	// If no users exist, create default admin user
	if count == 0 {
		// Create default tenant
		tenant, err := CreateTenant(db, CreateTenantInput{
			Name:        "default",
			DisplayName: "Default Tenant",
			Description: "Default tenant for system users",
		})
		if err != nil {
			return err
		}

		// Create admin user
		_, err = CreateUser(db, CreateUserInput{
			Username:    "admin",
			Password:    "admin", // Change this in production
			Email:       "admin@example.com",
			DisplayName: "Administrator",
			TenantID:    tenant.ID,
			IsActive:    true,
			IsSuperAdmin: true,
		})
		if err != nil {
			return err
		}

		// Create demo user
		user, err := CreateUser(db, CreateUserInput{
			Username:    "demouser",
			Password:    "demouser", // Change this in production
			Email:       "demo@example.com",
			DisplayName: "Demo User",
			TenantID:    tenant.ID,
			IsActive:    true,
			IsSuperAdmin: false,
		})
		if err != nil {
			return err
		}

		// Create user role
		role, err := CreateRole(db, CreateRoleInput{
			Name:        "user",
			DisplayName: "User",
			Description: "Regular user with basic permissions",
			TenantID:    tenant.ID,
		})
		if err != nil {
			return err
		}

		// Assign role to user
		_, err = AssignRoleToUser(db, CreateUserRoleInput{
			UserID:  user.ID,
			RoleID:  role.ID,
			TenantID: tenant.ID,
		})
		if err != nil {
			return err
		}
	}

	return nil
}