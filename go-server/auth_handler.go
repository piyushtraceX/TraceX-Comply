package main

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// DirectCasdoorRedirectHandler provides a streamlined and focused OAuth redirect
// that doesn't depend on the Casdoor SDK for URL generation
func DirectCasdoorRedirectHandler(c *gin.Context) {
	// ====== REPLIT DOMAIN DETECTION ======
	// First priority: Use direct header from Express
	callbackURL := c.GetHeader("X-Replit-Callback-URL")
	// Log all headers (for debugging)
	log.Println("==== ALL HEADERS ====")
	for key, values := range c.Request.Header {
		log.Printf("  %s: %v", key, values)
	}
	log.Println("====================")

	// Second priority: Check environment variable 
	replitDomains := os.Getenv("REPLIT_DOMAINS")
	
	// Log all important variables first
	log.Printf("[AUTH] X-Replit-Callback-URL header: '%s'", callbackURL)
	log.Printf("[AUTH] REPLIT_DOMAINS env var: '%s'", replitDomains)
	
	// Detect the environment
	isReplit := replitDomains != "" || strings.Contains(c.Request.Host, "replit") || 
			   strings.Contains(c.Request.Host, ".repl.co")
	
	// Determine the callback URL
	if callbackURL == "" {
		// Header not available - construct URL ourselves
		if replitDomains != "" {
			// Use environment variable
			callbackURL = fmt.Sprintf("https://%s/api/auth/callback", replitDomains)
			log.Printf("[AUTH] Using REPLIT_DOMAINS env var for callback: %s", callbackURL)
		} else if isReplit {
			// Use the host header
			callbackURL = fmt.Sprintf("https://%s/api/auth/callback", c.Request.Host)
			log.Printf("[AUTH] Using Host header for callback: %s", callbackURL)
		} else {
			// Local development
			callbackURL = "http://localhost:5000/api/auth/callback"
			log.Printf("[AUTH] Using localhost for callback: %s", callbackURL)
		}
	} else {
		log.Printf("[AUTH] Using explicit callback URL from header: %s", callbackURL)
	}
	
	// Hard-coded Casdoor parameters
	casdoorEndpoint := "https://tracextech.casdoor.com"
	clientID := "d85be9c2468eae1dbf58"
	
	// Encode the callback URL
	escapedCallback := url.QueryEscape(callbackURL)
	
	// Construct the OAuth URL completely manually
	authURL := fmt.Sprintf(
		"%s/login/oauth/authorize?client_id=%s&response_type=code&redirect_uri=%s&scope=read&state=eudr-complimate", 
		casdoorEndpoint, clientID, escapedCallback)
	
	log.Printf("[AUTH] Final Casdoor redirect URL: %s", authURL)
	
	// Redirect to Casdoor
	c.Redirect(http.StatusTemporaryRedirect, authURL)
}