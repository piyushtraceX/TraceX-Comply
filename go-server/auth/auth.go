package auth

import (
        "database/sql"
        "fmt"
        "log"
        "net/http"
        "os"
        "time"

        "github.com/casdoor/casdoor-go-sdk/casdoorsdk"
        "github.com/gin-gonic/gin"
        "github.com/markbates/goth"
        "github.com/markbates/goth/gothic"
        "golang.org/x/crypto/bcrypt"

        "go-server/middleware"
        "go-server/models"
)

// LoginRequest represents a login request
type LoginRequest struct {
        Username string `json:"username" binding:"required"`
        Password string `json:"password" binding:"required"`
}

// RegisterRequest represents a registration request
type RegisterRequest struct {
        Username     string  `json:"username" binding:"required"`
        Password     string  `json:"password" binding:"required"`
        Email        string  `json:"email" binding:"required,email"`
        DisplayName  string  `json:"name" binding:"required"`
        TenantID     *int    `json:"tenantId"`
        IsSuperAdmin bool    `json:"isSuperAdmin"`
}

// InitAuth initializes the authentication providers
func InitAuth() {
        // Set up Casdoor provider with enterprise hosted Casdoor
        casdoorEndpoint := os.Getenv("CASDOOR_ENDPOINT")
        casdoorClientID := os.Getenv("CASDOOR_CLIENT_ID")
        casdoorClientSecret := os.Getenv("CASDOOR_CLIENT_SECRET")
        casdoorJwtSecret := os.Getenv("CASDOOR_JWT_SECRET")

        // Use default enterprise Casdoor endpoint if not set
        if casdoorEndpoint == "" {
                casdoorEndpoint = "https://tracextech.casdoor.com"
        }

        // Check if required credentials are available
        if casdoorClientID == "" || casdoorClientSecret == "" {
                log.Println("Warning: Casdoor client ID or secret not set. OAuth login will not work properly.")
                return
        }

        // Default JWT secret if not provided
        if casdoorJwtSecret == "" {
                casdoorJwtSecret = "jwt-secret-for-tracextech-casdoor"
        }

        // Set up Casdoor provider for OAuth login
        casdoorProvider := &Provider{
                ClientKey:    casdoorClientID,
                Secret:       casdoorClientSecret,
                CallbackURL:  fmt.Sprintf("%s/api/auth/callback", os.Getenv("APP_URL")),
                Name:         "casdoor",
                AuthURL:      fmt.Sprintf("%s/login/oauth/authorize", casdoorEndpoint),
                TokenURL:     fmt.Sprintf("%s/api/login/oauth/access_token", casdoorEndpoint),
                ProfileURL:   fmt.Sprintf("%s/api/userinfo", casdoorEndpoint),
                Scopes:       []string{"read", "profile"},
                AuthCodeURLOptions: nil,
        }

        goth.UseProviders(casdoorProvider)

        // Initialize Casdoor SDK
        casdoorsdk.InitConfig(casdoorEndpoint, casdoorClientID, casdoorClientSecret, casdoorJwtSecret)
        
        log.Printf("Casdoor OAuth configured with endpoint: %s", casdoorEndpoint)
}

// RegisterRoutes registers the authentication routes
func RegisterRoutes(router *gin.Engine, db *sql.DB) {
        authRoutes := router.Group("/api/auth")
        {
                authRoutes.POST("/register", handleRegister(db))
                authRoutes.POST("/login", handleLogin(db))
                authRoutes.GET("/me", handleGetCurrentUser(db))
                authRoutes.POST("/logout", handleLogout())
                authRoutes.POST("/switch-tenant", middleware.JWTAuthMiddleware(), handleSwitchTenant(db))
                
                // OAuth routes
                authRoutes.GET("/casdoor", handleCasdoorLogin())
                authRoutes.GET("/callback", handleCasdoorCallback(db))
        }
}

// HashPassword hashes a password
func HashPassword(password string) (string, error) {
        bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
        return string(bytes), err
}

// CheckPasswordHash checks if a password matches a hash
func CheckPasswordHash(password, hash string) bool {
        err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
        return err == nil
}

// handleRegister handles user registration
func handleRegister(db *sql.DB) gin.HandlerFunc {
        return func(c *gin.Context) {
                var req RegisterRequest
                if err := c.ShouldBindJSON(&req); err != nil {
                        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                        return
                }

                // Check if username already exists
                existingUser, err := models.GetUserByUsername(db, req.Username)
                if err == nil && existingUser != nil {
                        c.JSON(http.StatusBadRequest, gin.H{"error": "Username already exists"})
                        return
                }

                // Hash password
                hashedPassword, err := HashPassword(req.Password)
                if err != nil {
                        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
                        return
                }

                // Create user
                user, err := models.CreateUser(db, models.CreateUserInput{
                        Username:     req.Username,
                        Password:     hashedPassword,
                        Email:        req.Email,
                        DisplayName:  req.DisplayName,
                        TenantID:     req.TenantID,
                        IsActive:     true,
                        IsSuperAdmin: req.IsSuperAdmin,
                })

                if err != nil {
                        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user: " + err.Error()})
                        return
                }

                // Remove password from response
                user.Password = ""

                // Assign default role if no tenant
                if user.TenantID == nil {
                        // Try to get the "user" role
                        userRole, err := models.GetRoleByName(db, "user", nil)
                        if err == nil && userRole != nil {
                                // Assign the role to the user
                                _, err = models.AssignRoleToUser(db, models.CreateUserRoleInput{
                                        UserID:   user.ID,
                                        RoleID:   userRole.ID,
                                        TenantID: nil,
                                })
                                if err != nil {
                                        log.Printf("Failed to assign default role to user: %v", err)
                                }
                        }
                }

                // Get user roles
                roles, err := models.GetUserRoles(db, user.ID, user.TenantID)
                if err == nil {
                        user.Roles = roles
                }

                // Generate JWT token
                token, err := middleware.GenerateJWT(
                        user.ID,
                        user.Username,
                        user.Email,
                        user.TenantID,
                        user.Roles,
                        user.IsSuperAdmin,
                )

                if err != nil {
                        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
                        return
                }

                // Get the tenant if applicable
                var tenant *models.Tenant
                if user.TenantID != nil {
                        tenant, _ = models.GetTenantByID(db, *user.TenantID)
                }

                // Return user info and token
                c.JSON(http.StatusCreated, gin.H{
                        "user":  user,
                        "tenant": tenant,
                        "roles": user.Roles,
                        "token": token,
                })
        }
}

// handleLogin handles user login
func handleLogin(db *sql.DB) gin.HandlerFunc {
        return func(c *gin.Context) {
                var req LoginRequest
                if err := c.ShouldBindJSON(&req); err != nil {
                        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                        return
                }

                // Get user by username
                user, err := models.GetUserByUsername(db, req.Username)
                if err != nil {
                        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
                        return
                }

                // Check password
                if !CheckPasswordHash(req.Password, user.Password) {
                        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
                        return
                }

                // Remove password from response
                user.Password = ""

                // Update last login time
                err = models.UpdateUserLoginTime(db, user.ID)
                if err != nil {
                        log.Printf("Failed to update last login time: %v", err)
                }

                // Get user roles
                roles, err := models.GetUserRoles(db, user.ID, user.TenantID)
                if err == nil {
                        user.Roles = roles
                }

                // Generate JWT token
                token, err := middleware.GenerateJWT(
                        user.ID,
                        user.Username,
                        user.Email,
                        user.TenantID,
                        user.Roles,
                        user.IsSuperAdmin,
                )

                if err != nil {
                        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
                        return
                }

                // Get the tenant if applicable
                var tenant *models.Tenant
                if user.TenantID != nil {
                        tenant, _ = models.GetTenantByID(db, *user.TenantID)
                }

                // Return user info and token
                c.JSON(http.StatusOK, gin.H{
                        "user":  user,
                        "tenant": tenant,
                        "roles": user.Roles,
                        "token": token,
                })
        }
}

// handleGetCurrentUser gets the current authenticated user
func handleGetCurrentUser(db *sql.DB) gin.HandlerFunc {
        return func(c *gin.Context) {
                // Check for JWT token
                authHeader := c.GetHeader("Authorization")
                var userID int
                var exists bool

                if authHeader != "" {
                        claims, err := middleware.ExtractAndValidateToken(authHeader)
                        if err == nil {
                                userID = claims.UserID
                                exists = true
                        }
                }

                // If no valid token, try from session
                if !exists {
                        userIDInterface, exists := c.Get("userID")
                        if !exists {
                                c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
                                return
                        }
                        var ok bool
                        userID, ok = userIDInterface.(int)
                        if !ok {
                                c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
                                return
                        }
                }

                // Get user by ID
                user, err := models.GetUserByID(db, userID)
                if err != nil {
                        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
                        return
                }

                // Remove password from response
                user.Password = ""

                // Get the tenant if applicable
                var tenant *models.Tenant
                if user.TenantID != nil {
                        tenant, _ = models.GetTenantByID(db, *user.TenantID)
                }

                // Return user info
                c.JSON(http.StatusOK, gin.H{
                        "user":  user,
                        "tenant": tenant,
                        "roles": user.Roles,
                })
        }
}

// handleLogout handles user logout
func handleLogout() gin.HandlerFunc {
        return func(c *gin.Context) {
                // For JWT, there's no server-side action needed
                // Client should discard the token
                c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
        }
}

// handleSwitchTenant handles switching the user's active tenant
func handleSwitchTenant(db *sql.DB) gin.HandlerFunc {
        return func(c *gin.Context) {
                // Get user ID from context
                userIDInterface, exists := c.Get("userID")
                if !exists {
                        c.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
                        return
                }
                
                userID, ok := userIDInterface.(int)
                if !ok {
                        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
                        return
                }

                // Get tenant ID from request
                var req struct {
                        TenantID int `json:"tenantId" binding:"required"`
                }
                if err := c.ShouldBindJSON(&req); err != nil {
                        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
                        return
                }

                // Get tenant by ID
                tenant, err := models.GetTenantByID(db, req.TenantID)
                if err != nil {
                        c.JSON(http.StatusNotFound, gin.H{"error": "Tenant not found"})
                        return
                }

                // Update user's tenant ID
                user, err := models.UpdateUser(db, userID, models.UpdateUserInput{
                        TenantID: &req.TenantID,
                })
                if err != nil {
                        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user"})
                        return
                }

                // Remove password from response
                user.Password = ""

                // Get user roles for the new tenant
                roles, err := models.GetUserRoles(db, user.ID, user.TenantID)
                if err == nil {
                        user.Roles = roles
                }

                // Generate new JWT token with updated tenant
                token, err := middleware.GenerateJWT(
                        user.ID,
                        user.Username,
                        user.Email,
                        user.TenantID,
                        user.Roles,
                        user.IsSuperAdmin,
                )

                if err != nil {
                        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
                        return
                }

                // Return user info, tenant, and token
                c.JSON(http.StatusOK, gin.H{
                        "user":  user,
                        "tenant": tenant,
                        "roles": user.Roles,
                        "token": token,
                })
        }
}

// handleCasdoorLogin handles login via Casdoor
func handleCasdoorLogin() gin.HandlerFunc {
        return func(c *gin.Context) {
                // Use Gothic to begin the Casdoor authentication
                gothic.BeginAuthHandler(c.Writer, c.Request)
        }
}

// handleCasdoorCallback handles the Casdoor callback
func handleCasdoorCallback(db *sql.DB) gin.HandlerFunc {
        return func(c *gin.Context) {
                // Complete authentication
                gothUser, err := gothic.CompleteUserAuth(c.Writer, c.Request)
                if err != nil {
                        c.JSON(http.StatusInternalServerError, gin.H{"error": "Authentication failed: " + err.Error()})
                        return
                }

                // Check if user exists
                user, err := models.GetUserByUsername(db, gothUser.NickName)
                if err != nil {
                        // User doesn't exist, create new user
                        hashedPassword, err := HashPassword(fmt.Sprintf("casdoor-%d", time.Now().UnixNano()))
                        if err != nil {
                                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
                                return
                        }

                        // Create user
                        user, err = models.CreateUser(db, models.CreateUserInput{
                                Username:     gothUser.NickName,
                                Password:     hashedPassword,
                                Email:        gothUser.Email,
                                DisplayName:  gothUser.Name,
                                IsActive:     true,
                                IsSuperAdmin: false,
                                CasdoorID:    &gothUser.UserID,
                        })

                        if err != nil {
                                c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
                                return
                        }

                        // Assign default role
                        userRole, err := models.GetRoleByName(db, "user", nil)
                        if err == nil && userRole != nil {
                                _, err = models.AssignRoleToUser(db, models.CreateUserRoleInput{
                                        UserID:   user.ID,
                                        RoleID:   userRole.ID,
                                        TenantID: nil,
                                })
                                if err != nil {
                                        log.Printf("Failed to assign default role to user: %v", err)
                                }
                        }
                } else {
                        // User exists, update Casdoor ID if not already set
                        if user.CasdoorID == nil {
                                casdoorID := gothUser.UserID
                                user, err = models.UpdateUser(db, user.ID, models.UpdateUserInput{
                                        CasdoorID: &casdoorID,
                                })
                                if err != nil {
                                        log.Printf("Failed to update user's Casdoor ID: %v", err)
                                }
                        }
                }

                // Remove password from response
                user.Password = ""

                // Update last login time
                err = models.UpdateUserLoginTime(db, user.ID)
                if err != nil {
                        log.Printf("Failed to update last login time: %v", err)
                }

                // Get user roles
                roles, err := models.GetUserRoles(db, user.ID, user.TenantID)
                if err == nil {
                        user.Roles = roles
                }

                // Generate JWT token
                token, err := middleware.GenerateJWT(
                        user.ID,
                        user.Username,
                        user.Email,
                        user.TenantID,
                        user.Roles,
                        user.IsSuperAdmin,
                )

                if err != nil {
                        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
                        return
                }

                // Get the tenant if applicable
                var tenant *models.Tenant
                if user.TenantID != nil {
                        tenant, _ = models.GetTenantByID(db, *user.TenantID)
                }

                // Redirect to frontend with token (or return JSON for API clients)
                redirectURI := c.Query("redirect_uri")
                if redirectURI != "" {
                        c.Redirect(http.StatusTemporaryRedirect, fmt.Sprintf("%s?token=%s", redirectURI, token))
                } else {
                        c.JSON(http.StatusOK, gin.H{
                                "user":  user,
                                "tenant": tenant,
                                "roles": user.Roles,
                                "token": token,
                        })
                }
        }
}

// ExtractAndValidateToken extracts and validates a JWT token from an Authorization header
func ExtractAndValidateToken(authHeader string) (*middleware.JWTClaims, error) {
        // Check if header has the correct format
        if len(authHeader) < 7 || authHeader[:7] != "Bearer " {
                return nil, fmt.Errorf("invalid authorization header format")
        }

        // Extract token
        tokenString := authHeader[7:]

        // Parse and validate token
        claims, err := middleware.ParseJWT(tokenString)
        if err != nil {
                return nil, err
        }

        return claims, nil
}