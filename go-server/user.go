package main

// User represents a user in the system
type User struct {
	ID          int    `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	Email       string `json:"email"`
	IsActive    bool   `json:"isActive"`
	IsSuperAdmin bool  `json:"isSuperAdmin"`
	TenantID    int    `json:"tenantId"`
}