package middleware

import (
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

// Logger is a middleware that logs the request method, path, status code, and latency
func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		start := time.Now()
		path := c.Request.URL.Path
		method := c.Request.Method

		// Process request
		c.Next()

		// Stop timer
		end := time.Now()
		latency := end.Sub(start)
		status := c.Writer.Status()

		// Log request
		log.Printf("[%s] %s %s %d %v", method, path, c.ClientIP(), status, latency)
	}
}