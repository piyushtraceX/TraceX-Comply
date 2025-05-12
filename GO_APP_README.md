# Complimate EUDR - Go Server Edition

This application has been completely migrated to use a standalone Go server architecture, removing all Node.js/Express server dependencies.

## Architecture

The application now uses:
- **Frontend**: React with TypeScript, Tailwind CSS, and Vite
- **Backend**: Go server with Gin web framework
- **Database**: PostgreSQL accessed directly from Go

## Running the Application

To run the application:

```bash
# Start the Go server (builds React first, then serves it)
./start_go.sh
```

The Go server is configured to:
1. Build the React frontend
2. Serve the compiled React files from the `client/dist` directory
3. Provide API endpoints at `/api/*`
4. Handle all routing for the single-page application

## Key Endpoints

- `GET /api/health` - Health check endpoint
- `POST /api/auth/login` - Login endpoint
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

## Development Workflow

For development:
1. Start the Go server with `./run-minimal-go.sh`
2. The server will be available at `http://localhost:8081`

## Environment Variables

- `GO_PORT` - The port for the Go server (default: 8081)
- `DATABASE_URL` - PostgreSQL connection string

## Next Steps

1. Complete the implementation of all API endpoints in the Go server
2. Add proper error handling and logging
3. Implement database migrations in Go
4. Add tests for Go server functionality