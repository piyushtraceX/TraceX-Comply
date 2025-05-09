package models

import (
	"database/sql"
	"errors"
	"log"
	"time"

	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
)

// User represents a user in the system
type User struct {
	ID           int       `json:"id"`
	Username     string    `json:"username"`
	Password     string    `json:"password,omitempty"`
	Email        string    `json:"email"`
	DisplayName  string    `json:"displayName"`
	Avatar       string    `json:"avatar,omitempty"`
	TenantID     int       `json:"tenantId"`
	IsActive     bool      `json:"isActive"`
	IsSuperAdmin bool      `json:"isSuperAdmin"`
	LastLogin    time.Time `json:"lastLogin,omitempty"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
	CasdoorID    string    `json:"casdoorId,omitempty"`
}

// CreateUser creates a new user in the database
func CreateUser(db *sql.DB, user *User) (*User, error) {
	// Hash the password before storing
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Set defaults
	if user.IsActive == false {
		user.IsActive = true
	}

	now := time.Now()
	user.CreatedAt = now
	user.UpdatedAt = now

	// Insert the user into the database
	query := `
		INSERT INTO users (username, password, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING id
	`
	err = db.QueryRow(
		query,
		user.Username,
		string(hashedPassword),
		user.Email,
		user.DisplayName,
		user.Avatar,
		user.TenantID,
		user.IsActive,
		user.IsSuperAdmin,
		user.LastLogin,
		user.CreatedAt,
		user.UpdatedAt,
		user.CasdoorID,
	).Scan(&user.ID)

	if err != nil {
		// Check for unique constraint violation
		if pqErr, ok := err.(*pq.Error); ok {
			if pqErr.Code == "23505" { // unique_violation
				return nil, errors.New("username or email already exists")
			}
		}
		return nil, err
	}

	// Hide password in the returned user object
	user.Password = ""
	return user, nil
}

// GetUserByID retrieves a user by their ID
func GetUserByID(id int) (*User, error) {
	// TODO: Implement database access
	// This is a placeholder for demonstration
	if id == 1 {
		return &User{
			ID:           1,
			Username:     "admin",
			Email:        "admin@example.com",
			DisplayName:  "Admin User",
			TenantID:     1,
			IsActive:     true,
			IsSuperAdmin: true,
			CreatedAt:    time.Now(),
			UpdatedAt:    time.Now(),
		}, nil
	}
	return nil, errors.New("user not found")
}

// GetUserByUsername retrieves a user by their username
func GetUserByUsername(db *sql.DB, username string) (*User, error) {
	query := `
		SELECT id, username, password, email, display_name, avatar, tenant_id, is_active, is_super_admin, last_login, created_at, updated_at, casdoor_id
		FROM users
		WHERE username = $1
	`
	var user User
	var lastLogin, avatar, casdoorID sql.NullString

	err := db.QueryRow(query, username).Scan(
		&user.ID,
		&user.Username,
		&user.Password,
		&user.Email,
		&user.DisplayName,
		&avatar,
		&user.TenantID,
		&user.IsActive,
		&user.IsSuperAdmin,
		&lastLogin,
		&user.CreatedAt,
		&user.UpdatedAt,
		&casdoorID,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("user not found")
		}
		return nil, err
	}

	// Handle nullable fields
	if avatar.Valid {
		user.Avatar = avatar.String
	}
	if casdoorID.Valid {
		user.CasdoorID = casdoorID.String
	}
	if lastLogin.Valid {
		lastLoginTime, err := time.Parse(time.RFC3339, lastLogin.String)
		if err == nil {
			user.LastLogin = lastLoginTime
		}
	}

	return &user, nil
}

// VerifyPassword checks if the provided password matches the user's stored password
func VerifyPassword(hashedPassword, password string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
	return err == nil
}

// GetUserRoles retrieves the roles assigned to a user
func GetUserRoles(userID int) ([]Role, error) {
	// TODO: Implement database access
	// This is a placeholder for demonstration
	roles := []Role{
		{
			ID:          1,
			Name:        "user",
			DisplayName: "User",
			Description: "Basic user role",
			TenantID:    1,
		},
	}
	return roles, nil
}

// UpdateLastLogin updates the last login timestamp for a user
func UpdateLastLogin(db *sql.DB, userID int) error {
	now := time.Now()
	query := `
		UPDATE users
		SET last_login = $1, updated_at = $2
		WHERE id = $3
	`
	_, err := db.Exec(query, now, now, userID)
	return err
}