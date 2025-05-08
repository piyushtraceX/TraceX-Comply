package models

import (
	"time"

	"gorm.io/gorm"
)

// Tenant represents a tenant in the system
type Tenant struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	Name        string         `gorm:"size:255;not null;unique" json:"name"`
	Description string         `gorm:"size:500" json:"description"`
	CreatedAt   time.Time      `json:"createdAt"`
	UpdatedAt   time.Time      `json:"updatedAt"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
	Users       []User         `gorm:"foreignKey:TenantID" json:"-"`
}

// TableName specifies the table name for Tenant model
func (Tenant) TableName() string {
	return "tenants"
}

// CreateTenantRequest represents the create tenant request payload
type CreateTenantRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

// UpdateTenantRequest represents the update tenant request payload
type UpdateTenantRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}