# TraceX-Comply

🌿 **TraceX-Comply** is a multi-tenant, compliance management system built with a modern React (Vite + Tailwind) frontend and a Go-based backend. It helps organizations manage and enforce environmental compliance standards like EUDR (EU Deforestation Regulation).

---

## 📦 Project Structure

TraceX-Comply/
├── client/ # React frontend
├── go-server/ # Go backend with Casbin-based RBAC
├── scripts/ # Helper scripts
├── start-all.sh # Script to launch frontend and backend together
├── .gitignore
└── README.md


---

## 🚀 Features

- ✅ Multi-tenant support
- ✅ Hierarchical Role-Based Access Control (RBAC) with Casbin
- ✅ Authentication via Casdoor
- ✅ Modern frontend with React + Vite + Tailwind
- ✅ Go REST API with Gin
- ✅ PostgreSQL for persistent storage and Casbin policy backend

---

## 🧰 Tech Stack

| Layer         | Technology              |
|---------------|--------------------------|
| Frontend      | React, Vite, Tailwind    |
| Backend       | Go (Gin), Casbin         |
| Authentication| Casdoor                  |
| Database      | PostgreSQL               |
| RBAC          | Casbin (RBAC with domains) |
| DevOps        | Docker, Kubernetes (EKS optional) |

---

## 📂 Installation

### ✅ Prerequisites

- [Go](https://golang.org/doc/install)
- [PostgreSQL](https://www.postgresql.org/)
- [Node.js](https://nodejs.org/) *(for Vite build only if you’re modifying the frontend)*

---

### ⚙️ Backend Setup (Go)

```bash
cd go-server
go mod tidy
go run main.go

Create a .env file in go-server/:

PORT=8080
DB_URL=postgres://username:password@localhost:5432/yourdb

Ensure the PostgreSQL database is running and accessible.
🎨 Frontend Setup (React + Vite)

cd client
npm install
npm run dev

Visit the app at http://localhost:5173.
🧪 Test It

Use your browser DevTools → Network tab to ensure frontend API calls reach the Go backend (localhost:8080).
🔐 RBAC with Casbin

RBAC is enforced via Casbin with a multi-tenant model:

[request_definition]
r = sub, dom, obj, act

[policy_definition]
p = sub, dom, obj, act

[role_definition]
g = _, _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub, r.dom) && r.dom == p.dom && r.obj == p.obj && r.act == p.act

Policies are stored in PostgreSQL using a Casbin adapter.
🚢 Deployment

Plans for deployment include:

    Docker-based development setup

    Kubernetes on AWS EKS for production deployment

    Helm charts and GitHub Actions for CI/CD (coming soon)

🛠️ TODO / Improvements

Add unit/integration tests

Add Dockerfile and docker-compose setup

CI/CD pipeline with GitHub Actions

Casdoor production-ready integration

    RBAC role/permission editor UI

🤝 Contributing

Contributions are welcome! Please open issues or submit pull requests to collaborate.
📄 License

MIT © TraceX Technologies
