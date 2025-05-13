package main

import (
	"log"
	"net/http"
	"os"

	"github.com/casdoor/casdoor-go-sdk/casdoorsdk"
	"github.com/gin-gonic/gin"
)

// This is a simplified, development-friendly callback handler that will
// bypass JWT verification if needed to ensure Casdoor authentication works

func simplifiedCallbackHandler(c *gin.Context) {
	// Get the authorization code from the query
	code := c.Query("code")
	state := c.Query("state")
	
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No authorization code provided"})
		return
	}
	
	log.Printf("[AUTH] Simplified callback handler - received code: %s and state: %s", code, state)
	
	// Exchange authorization code for token
	token, err := casdoorsdk.GetOAuthToken(code, state)
	if err != nil {
		log.Printf("[AUTH] Error getting token: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get access token"})
		return
	}
	
	log.Printf("[AUTH] Successfully obtained token from Casdoor")
	
	// DEVELOPMENT MODE - Create a mock user without JWT verification
	// ⚠️ For production, you'd want to verify the JWT token properly
	log.Printf("[AUTH] DEVELOPMENT MODE - Creating session with mock user")
	
	// Create a cookie with the access token
	c.SetCookie(
		"casdoor_token",
		token.AccessToken,
		3600, // 1 hour
		"/",
		"",    // empty domain = use request host
		false, // secure = false for development
		true,  // httpOnly = true
	)
	
	log.Printf("[AUTH] Set cookie with token")
	
	// Set a cookie to indicate successful login
	c.SetCookie(
		"auth_status",
		"success",
		3600, // 1 hour
		"/",
		"",    // empty domain
		false, // secure = false for development
		false, // httpOnly = false so JavaScript can access
	)
	
	// Redirect to the frontend dashboard
	redirectTo := "/"
	if os.Getenv("REDIRECT_AFTER_LOGIN") != "" {
		redirectTo = os.Getenv("REDIRECT_AFTER_LOGIN")
	}
	
	log.Printf("[AUTH] Redirecting to: %s", redirectTo)
	c.Redirect(http.StatusFound, redirectTo)
}