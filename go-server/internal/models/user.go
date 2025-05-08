package models

import (
	"time"

	"gorm.io/gorm"
)

// User represents a user in the system
type User struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	Username      string         `gorm:"size:255;not null;unique" json:"username"`
	Password      string         `gorm:"size:255;not null" json:"-"` // Password is not serialized to JSON
	Email         string         `gorm:"size:255;unique" json:"email"`
	Name          string         `gorm:"size:255" json:"name"`
	TenantID      *uint          `json:"tenantId"`
	Tenant        *Tenant        `gorm:"foreignKey:TenantID" json:"-"`
	CasdoorID     *string        `gorm:"size:255;unique" json:"-"`
	IsSuperAdmin  bool           `gorm:"default:false" json:"isSuperAdmin"`
	CreatedAt     time.Time      `json:"createdAt"`
	UpdatedAt     time.Time      `json:"updatedAt"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
	Roles         []Role         `gorm:"many2many:user_roles;" json:"-"`
}

// TableName specifies the table name for User model
func (User) TableName() string {
	return "users"
}

// UserResponse is the response structure for user data
type UserResponse struct {
	ID           uint     `json:"id"`
	Username     string   `json:"username"`
	Email        string   `json:"email,omitempty"`
	Name         string   `json:"name,omitempty"`
	TenantID     *uint    `json:"tenantId,omitempty"`
	IsSuperAdmin bool     `json:"isSuperAdmin"`
	CreatedAt    string   `json:"createdAt"`
	UpdatedAt    string   `json:"updatedAt"`
	Roles        []string `json:"roles,omitempty"`
}

// ToResponse converts a User to a UserResponse
func (u *User) ToResponse(roles []string) UserResponse {
	return UserResponse{
		ID:           u.ID,
		Username:     u.Username,
		Email:        u.Email,
		Name:         u.Name,
		TenantID:     u.TenantID,
		IsSuperAdmin: u.IsSuperAdmin,
		CreatedAt:    u.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    u.UpdatedAt.Format(time.RFC3339),
		Roles:        roles,
	}
}

// LoginRequest represents the login request payload
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// CreateUserRequest represents the create user request payload
type CreateUserRequest struct {
	Username     string `json:"username" binding:"required"`
	Password     string `json:"password" binding:"required,min=6"`
	Email        string `json:"email" binding:"required,email"`
	Name         string `json:"name"`
	TenantID     *uint  `json:"tenantId"`
	IsSuperAdmin bool   `json:"isSuperAdmin"`
}

// UpdateUserRequest represents the update user request payload
type UpdateUserRequest struct {
	Password     string `json:"password" binding:"omitempty,min=6"`
	Email        string `json:"email" binding:"omitempty,email"`
	Name         string `json:"name"`
	TenantID     *uint  `json:"tenantId"`
	IsSuperAdmin bool   `json:"isSuperAdmin"`
}

// SwitchTenantRequest represents the switch tenant request payload
type SwitchTenantRequest struct {
	TenantID uint `json:"tenantId" binding:"required"`
}

// UserRoleRequest represents the request to assign a role to a user
type UserRoleRequest struct {
	RoleID   uint  `json:"roleId" binding:"required"`
	TenantID *uint `json:"tenantId"`
}