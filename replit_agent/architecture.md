# Architecture Documentation

## 1. Overview

This application is a full-stack web platform designed for managing supply chain compliance, particularly focused on EU Deforestation Regulation (EUDR). The system provides functionality for tracking suppliers, managing declarations, monitoring compliance, and generating reports. It features a modern React frontend with a Go (Golang) backend, connected to a PostgreSQL database.

The application follows a client-server architecture with clearly separated concerns:
- A React-based single-page application (SPA) for the frontend
- A Go (Golang) RESTful API server for the backend
- PostgreSQL database for data persistence
- Internationalization support with multiple languages
- Role-based access control through Casdoor for authentication and Casbin for authorization

## 2. System Architecture

### 2.1 High-level Architecture

The application follows a three-tier architecture:

1. **Presentation Layer**: React-based frontend with TailwindCSS and shadcn/ui components
2. **Application Layer**: Go (Golang) server handling business logic and API requests
3. **Data Layer**: PostgreSQL database 

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  React Frontend │────▶│   Go Backend    │────▶│    PostgreSQL   │
│  (SPA)          │◀────│   (REST API)    │◀────│    Database     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### 2.2 Development Architecture

The application uses a monorepo approach with three main directories:
- `client/`: Contains the React frontend application
- `server/`: Contains the Express.js backend server
- `shared/`: Contains code shared between frontend and backend

During development, Vite serves the frontend with hot module replacement, while the backend runs using tsx for TypeScript execution.

## 3. Key Components

### 3.1 Frontend

#### 3.1.1 Core Technologies
- **React**: UI library for building component-based interfaces
- **TailwindCSS**: Utility-first CSS framework for styling
- **shadcn/ui**: Component library built on Radix UI primitives
- **React Router (Wouter)**: For client-side routing
- **React Query**: For data fetching, caching, and state management
- **i18next**: For internationalization

#### 3.1.2 Key Components
- **Pages**: React components representing different screens (Dashboard, SupplyChain, Compliance, etc.)
- **UI Components**: Reusable UI components from shadcn/ui
- **Contexts**: 
  - `LanguageContext`: Manages language selection and RTL support
  - `PersonaContext`: Manages user roles and permissions
- **Hooks**: Custom React hooks for shared functionality

### 3.2 Backend

#### 3.2.1 Core Technologies
- **Express.js**: Web framework for handling HTTP requests
- **Drizzle ORM**: For database access and query building
- **Neon Serverless Postgres**: Serverless PostgreSQL database

#### 3.2.2 Key Components
- **Routes**: API endpoint definitions
- **Storage**: Database access layer
- **Schema**: Database schema definitions (shared with frontend)
- **Middleware**: Request processing middleware (logging, error handling)

### 3.3 Data Model

The current schema includes a simple users table, but the application's UI suggests a more complex data model including:

- Users and authentication
- Suppliers and supplier relationships
- Declarations and compliance documents
- Risk assessments
- Customers
- Supply chain entities

## 4. Data Flow

### 4.1 Request Flow

1. Client makes a request to the server (either page load or API call)
2. For API requests:
   - Express router directs the request to the appropriate handler
   - Request is processed by middleware (authentication, validation, etc.)
   - Handler performs business logic, often accessing the database
   - Response is sent back to the client
3. For initial page load:
   - Express serves the Vite-built static files
   - React application bootstraps in the browser
   - React components make API calls as needed

### 4.2 Authentication Flow

The application appears to implement a session-based authentication system:
1. User credentials are validated against the database
2. On successful authentication, a session is created
3. Session is maintained using cookies
4. Protected routes check for valid session
5. Different views are presented based on the user's persona/role

## 5. External Dependencies

### 5.1 Frontend Dependencies
- **@radix-ui**: UI primitive components
- **@tanstack/react-query**: Data fetching and state management
- **tailwindcss**: CSS framework
- **recharts**: Charting library for data visualization
- **i18next**: Internationalization
- **wouter**: Lightweight router for React
- **react-hook-form** and **zod**: Form handling and validation

### 5.2 Backend Dependencies
- **@neondatabase/serverless**: PostgreSQL client for serverless environments
- **drizzle-orm**: TypeScript ORM
- **express**: Web framework
- **connect-pg-simple**: PostgreSQL session store

## 6. Deployment Strategy

The application is configured for deployment in a variety of environments:

### 6.1 Development
- Uses Vite dev server for frontend with hot module replacement
- Backend runs using tsx for TypeScript execution
- Environment variables managed via `.env` file

### 6.2 Production
- Frontend assets built using Vite and served as static files
- Backend code bundled using esbuild
- Node.js process serves both the API and static assets

### 6.3 Deployment Platforms
- The application includes configuration for Replit deployment with default ports and run commands
- Database configuration supports Neon PostgreSQL, making it suitable for serverless environments

### 6.4 Build and Run Process
1. `npm run build`: Builds frontend assets and bundles backend
2. `npm run start`: Starts the production server
3. `npm run dev`: Starts development environment

## 7. Cross-cutting Concerns

### 7.1 Internationalization
- Supports multiple languages (English, French, German, Arabic)
- Includes RTL text support for Arabic
- Language selection persisted in localStorage

### 7.2 Accessibility
- Uses Radix UI primitives which provide good accessibility defaults
- ARIA attributes present in UI components

### 7.3 Performance
- React Query for efficient data fetching and caching
- Code splitting via dynamic imports
- Optimized build process for production

### 7.4 Security
- Input validation using zod schemas
- SQL injection protection via parametrized queries in Drizzle ORM
- Session-based authentication

### 7.5 Error Handling
- Global error boundary for React components
- API error responses are standardized
- Development mode includes enhanced error reporting