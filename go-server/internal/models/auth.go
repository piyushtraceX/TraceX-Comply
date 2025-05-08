package models

import (
	"time"

	"gorm.io/gorm"
)

// Role represents a role in the system
type Role struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"size:255;not null" json:"name"`
	Description string         `gorm:"size:500" json:"description"`
	TenantID    *uint          `json:"tenantId"`
	Tenant      *Tenant        `gorm:"foreignKey:TenantID" json:"-"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Users       []User         `gorm:"many2many:user_roles;" json:"-"`
	Permissions []Permission   `gorm:"foreignKey:RoleID" json:"-"`
}

// TableName specifies the table name for Role model
func (Role) TableName() string {
	return "roles"
}

// UserRole represents the association between a user and a role
type UserRole struct {
	UserID    uint       `gorm:"primaryKey" json:"userId"`
	RoleID    uint       `gorm:"primaryKey" json:"roleId"`
	TenantID  *uint      `json:"tenantId"`
	Tenant    *Tenant    `gorm:"foreignKey:TenantID" json:"-"`
	CreatedAt time.Time  `json:"createdAt"`
	User      User       `gorm:"foreignKey:UserID" json:"-"`
	Role      Role       `gorm:"foreignKey:RoleID" json:"-"`
}

// TableName specifies the table name for UserRole model
func (UserRole) TableName() string {
	return "user_roles"
}

// Resource represents a resource that can be accessed in the system
type Resource struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Type        string         `gorm:"size:255;not null" json:"type"`
	Name        string         `gorm:"size:255;not null" json:"name"`
	Description string         `gorm:"size:500" json:"description"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Permissions []Permission   `gorm:"foreignKey:ResourceID" json:"-"`
}

// TableName specifies the table name for Resource model
func (Resource) TableName() string {
	return "resources"
}

// Action represents an action that can be performed on a resource
type Action struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"size:255;not null;unique" json:"name"`
	Description string         `gorm:"size:500" json:"description"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Permissions []Permission   `gorm:"foreignKey:ActionID" json:"-"`
}

// TableName specifies the table name for Action model
func (Action) TableName() string {
	return "actions"
}

// Permission represents a permission granted to a role
type Permission struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	RoleID     uint           `json:"roleId"`
	Role       Role           `gorm:"foreignKey:RoleID" json:"-"`
	ResourceID uint           `json:"resourceId"`
	Resource   Resource       `gorm:"foreignKey:ResourceID" json:"-"`
	ActionID   uint           `json:"actionId"`
	Action     Action         `gorm:"foreignKey:ActionID" json:"-"`
	TenantID   *uint          `json:"tenantId"`
	Tenant     *Tenant        `gorm:"foreignKey:TenantID" json:"-"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName specifies the table name for Permission model
func (Permission) TableName() string {
	return "permissions"
}

// CreateRoleRequest represents the create role request payload
type CreateRoleRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
	TenantID    *uint  `json:"tenantId"`
}

// UpdateRoleRequest represents the update role request payload
type UpdateRoleRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	TenantID    *uint  `json:"tenantId"`
}

// CreatePermissionRequest represents the create permission request payload
type CreatePermissionRequest struct {
	RoleID     uint  `json:"roleId" binding:"required"`
	ResourceID uint  `json:"resourceId" binding:"required"`
	ActionID   uint  `json:"actionId" binding:"required"`
	TenantID   *uint `json:"tenantId"`
}