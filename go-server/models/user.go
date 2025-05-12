package models

import (
        "database/sql"
        "fmt"
        "time"

        "golang.org/x/crypto/bcrypt"
)

// User represents a user in the system
type User struct {
        ID           int        `json:"id"`
        Username     string     `json:"username"`
        Password     string     `json:"-"` // Don't expose in JSON responses
        Email        string     `json:"email"`
        DisplayName  string     `json:"displayName"`
        Avatar       *string    `json:"avatar"`
        TenantID     int        `json:"tenantId"`
        IsActive     bool       `json:"isActive"`
        IsSuperAdmin bool       `json:"isSuperAdmin"`
        LastLogin    time.Time  `json:"lastLogin"`
        CasdoorID    *string    `json:"casdoorId"`
        CreatedAt    time.Time  `json:"createdAt"`
        UpdatedAt    time.Time  `json:"updatedAt"`
}

// GetUser retrieves a user by ID
func GetUser(db *sql.DB, id int) (*User, error) {
        var user User
        var avatar, casdoorID sql.NullString
        var lastLogin sql.NullTime

        query := `
                SELECT id, username, password, email, display_name, 
                       avatar, tenant_id, is_active, is_super_admin, 
                       last_login, casdoor_id, created_at, updated_at
                FROM users
                WHERE id = $1
        `

        err := db.QueryRow(query, id).Scan(
                &user.ID, &user.Username, &user.Password, &user.Email, 
                &user.DisplayName, &avatar, &user.TenantID, &user.IsActive, 
                &user.IsSuperAdmin, &lastLogin, &casdoorID, &user.CreatedAt, &user.UpdatedAt,
        )

        if err != nil {
                return nil, err
        }

        if avatar.Valid {
                user.Avatar = &avatar.String
        }

        if casdoorID.Valid {
                user.CasdoorID = &casdoorID.String
        }

        if lastLogin.Valid {
                user.LastLogin = lastLogin.Time
        } else {
                user.LastLogin = time.Time{}
        }

        return &user, nil
}

// GetUserByUsername retrieves a user by username
func GetUserByUsername(db *sql.DB, username string) (*User, error) {
        var user User
        var avatar, casdoorID sql.NullString
        var lastLogin sql.NullTime

        query := `
                SELECT id, username, password, email, display_name, 
                       avatar, tenant_id, is_active, is_super_admin, 
                       last_login, casdoor_id, created_at, updated_at
                FROM users
                WHERE username = $1
        `

        err := db.QueryRow(query, username).Scan(
                &user.ID, &user.Username, &user.Password, &user.Email, 
                &user.DisplayName, &avatar, &user.TenantID, &user.IsActive, 
                &user.IsSuperAdmin, &lastLogin, &casdoorID, &user.CreatedAt, &user.UpdatedAt,
        )

        if err != nil {
                return nil, err
        }

        if avatar.Valid {
                user.Avatar = &avatar.String
        }

        if casdoorID.Valid {
                user.CasdoorID = &casdoorID.String
        }

        if lastLogin.Valid {
                user.LastLogin = lastLogin.Time
        } else {
                user.LastLogin = time.Time{}
        }

        return &user, nil
}

// GetUserByCasdoorID retrieves a user by CasdoorID
func GetUserByCasdoorID(db *sql.DB, casdoorID string) (*User, error) {
        var user User
        var avatar, casdoorIDNull sql.NullString
        var lastLogin sql.NullTime

        query := `
                SELECT id, username, password, email, display_name, 
                       avatar, tenant_id, is_active, is_super_admin, 
                       last_login, casdoor_id, created_at, updated_at
                FROM users
                WHERE casdoor_id = $1
        `

        err := db.QueryRow(query, casdoorID).Scan(
                &user.ID, &user.Username, &user.Password, &user.Email, 
                &user.DisplayName, &avatar, &user.TenantID, &user.IsActive, 
                &user.IsSuperAdmin, &lastLogin, &casdoorIDNull, &user.CreatedAt, &user.UpdatedAt,
        )

        if err != nil {
                return nil, err
        }

        if avatar.Valid {
                user.Avatar = &avatar.String
        }

        if casdoorIDNull.Valid {
                user.CasdoorID = &casdoorIDNull.String
        }

        if lastLogin.Valid {
                user.LastLogin = lastLogin.Time
        } else {
                user.LastLogin = time.Time{}
        }

        return &user, nil
}

// CreateUser creates a new user
func CreateUser(db *sql.DB, user *User) (*User, error) {
        // Check if username already exists
        var count int
        err := db.QueryRow("SELECT COUNT(*) FROM users WHERE username = $1", user.Username).Scan(&count)
        if err != nil {
                return nil, err
        }
        if count > 0 {
                return nil, fmt.Errorf("username already exists")
        }

        // Check if email already exists
        err = db.QueryRow("SELECT COUNT(*) FROM users WHERE email = $1", user.Email).Scan(&count)
        if err != nil {
                return nil, err
        }
        if count > 0 {
                return nil, fmt.Errorf("email already exists")
        }

        // Hash the password
        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
        if err != nil {
                return nil, err
        }

        // Set created and updated timestamps
        now := time.Now()
        user.CreatedAt = now
        user.UpdatedAt = now

        var avatar, casdoorID sql.NullString
        var lastLogin sql.NullTime

        if user.Avatar != nil {
                avatar.String = *user.Avatar
                avatar.Valid = true
        }

        if user.CasdoorID != nil {
                casdoorID.String = *user.CasdoorID
                casdoorID.Valid = true
        }

        if !user.LastLogin.IsZero() {
                lastLogin.Time = user.LastLogin
                lastLogin.Valid = true
        }

        query := `
                INSERT INTO users (
                        username, password, email, display_name, avatar,
                        tenant_id, is_active, is_super_admin, last_login,
                        casdoor_id, created_at, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING id
        `

        err = db.QueryRow(
                query,
                user.Username, string(hashedPassword), user.Email, user.DisplayName, avatar,
                user.TenantID, user.IsActive, user.IsSuperAdmin, lastLogin,
                casdoorID, user.CreatedAt, user.UpdatedAt,
        ).Scan(&user.ID)

        if err != nil {
                return nil, err
        }

        // Return the created user (but with password stripped)
        createdUser, err := GetUser(db, user.ID)
        if err != nil {
                return nil, err
        }

        return createdUser, nil
}

// UpdateUser updates a user's information
func UpdateUser(db *sql.DB, id int, updates map[string]interface{}) (*User, error) {
        // Get the current user to verify it exists
        _, err := GetUser(db, id)
        if err != nil {
                return nil, err
        }

        // Build the update query
        query := "UPDATE users SET updated_at = NOW()"
        var values []interface{}
        i := 1

        // Add updated fields
        for field, value := range updates {
                query += fmt.Sprintf(", %s = $%d", getDBFieldName(field), i)
                
                // Handle password separately for hashing
                if field == "password" {
                        password, ok := value.(string)
                        if !ok {
                                return nil, fmt.Errorf("invalid password type")
                        }
                        
                        hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
                        if err != nil {
                                return nil, err
                        }
                        
                        values = append(values, string(hashedPassword))
                } else {
                        values = append(values, value)
                }
                
                i++
        }

        // Complete the query
        query += fmt.Sprintf(" WHERE id = $%d", i)
        values = append(values, id)

        // Execute the update
        _, err = db.Exec(query, values...)
        if err != nil {
                return nil, err
        }

        // Return the updated user
        return GetUser(db, id)
}

// UpdateLastLogin updates a user's last login time
func UpdateLastLogin(db *sql.DB, id int) error {
        _, err := db.Exec("UPDATE users SET last_login = NOW() WHERE id = $1", id)
        return err
}

// ListUsers lists all users, optionally filtered by tenant ID
func ListUsers(db *sql.DB, tenantID *int) ([]*User, error) {
        var query string
        var rows *sql.Rows
        var err error

        if tenantID != nil {
                query = `
                        SELECT id, username, password, email, display_name, 
                               avatar, tenant_id, is_active, is_super_admin, 
                               last_login, casdoor_id, created_at, updated_at
                        FROM users
                        WHERE tenant_id = $1
                        ORDER BY username
                `
                rows, err = db.Query(query, *tenantID)
        } else {
                query = `
                        SELECT id, username, password, email, display_name, 
                               avatar, tenant_id, is_active, is_super_admin, 
                               last_login, casdoor_id, created_at, updated_at
                        FROM users
                        ORDER BY username
                `
                rows, err = db.Query(query)
        }

        if err != nil {
                return nil, err
        }
        defer rows.Close()

        var users []*User
        for rows.Next() {
                var user User
                var avatar, casdoorID sql.NullString
                var lastLogin sql.NullTime

                err := rows.Scan(
                        &user.ID, &user.Username, &user.Password, &user.Email, 
                        &user.DisplayName, &avatar, &user.TenantID, &user.IsActive, 
                        &user.IsSuperAdmin, &lastLogin, &casdoorID, &user.CreatedAt, &user.UpdatedAt,
                )

                if err != nil {
                        return nil, err
                }

                if avatar.Valid {
                        user.Avatar = &avatar.String
                }

                if casdoorID.Valid {
                        user.CasdoorID = &casdoorID.String
                }

                if lastLogin.Valid {
                        user.LastLogin = lastLogin.Time
                }

                users = append(users, &user)
        }

        if err = rows.Err(); err != nil {
                return nil, err
        }

        return users, nil
}

// DeleteUser deletes a user by ID
func DeleteUser(db *sql.DB, id int) error {
        _, err := db.Exec("DELETE FROM users WHERE id = $1", id)
        return err
}

// VerifyPassword verifies a password against a hashed password
func VerifyPassword(hashedPassword, password string) bool {
        err := bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
        return err == nil
}

// GetUserRoles gets the roles assigned to a user
func GetUserRoles(userId int) ([]Role, error) {
        // Will be implemented in role.go
        return []Role{}, nil
}

// Helper function to convert camelCase field names to snake_case for DB
func getDBFieldName(fieldName string) string {
        switch fieldName {
        case "username":
                return "username"
        case "password":
                return "password"
        case "email":
                return "email"
        case "displayName":
                return "display_name"
        case "avatar":
                return "avatar"
        case "tenantId":
                return "tenant_id"
        case "isActive":
                return "is_active"
        case "isSuperAdmin":
                return "is_super_admin"
        case "lastLogin":
                return "last_login"
        case "casdoorId":
                return "casdoor_id"
        default:
                return fieldName
        }
}