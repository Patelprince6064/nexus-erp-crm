# Mini ERP + CRM Operations Portal

A **production-quality, full-stack ERP/CRM system** built for a wholesale/distribution company. This project demonstrates enterprise-grade software engineering across the entire stack — from PostgreSQL schema design to React TypeScript UI, REST API architecture, authentication, authorization, atomic business transactions, and Docker deployment.

---

## 🏢 Business Context

This system serves an internal team at a **wholesale/distribution company** managing:
- Customer relationship management (leads → active accounts)
- Product catalog with SKU-level inventory control
- Warehouse stock movement tracking (IN/OUT/ADJUSTMENT)
- Sales challan generation with GST calculations
- Role-based access control for four departments

---

## 📸 Application Modules

| Module | Description | Roles |
|---|---|---|
| **Dashboard** | KPI cards + revenue/inventory charts | All |
| **Customer CRM** | Contacts, follow-ups, lifecycle pipeline | ADMIN, SALES, ACCOUNTS |
| **Products** | SKU catalog, pricing, category management | All |
| **Inventory** | Stock IN/OUT movements, low-stock alerts | ADMIN, WAREHOUSE |
| **Sales Challans** | Draft/confirm dispatch orders with GST | All |
| **Challan Builder** | Live multi-item order builder with stock validation | ADMIN, SALES |
| **User Management** | Employee accounts, role assignment | ADMIN |

---

## ⚙️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Charts** | Recharts |
| **HTTP Client** | Axios (with JWT interceptor) |
| **Backend** | Node.js, Express.js, TypeScript |
| **ORM** | Prisma |
| **Database** | PostgreSQL |
| **Authentication** | JSON Web Tokens (JWT), bcryptjs |
| **Validation** | Zod |
| **Security** | Helmet, express-rate-limit, CORS |
| **Testing** | Jest, Supertest |
| **Containerization** | Docker, Docker Compose |
| **API Documentation** | Postman Collection |

---

## 🗄️ Database Schema

```
User ─────────┐
              │ createdBy
Customer ─────┤
   │          │
   └─FollowUp │
              │
Challan ──────┤
   │          │
   └─ChallanItem ─── Product
                        │
                    StockMovement
```

**Key design decisions:**
- `Challan.items` store `productNameSnapshot`, `skuSnapshot`, `unitPriceSnapshot` — historical prices are preserved even if the product is later updated
- `currentStock` on `Product` is updated atomically within a `prisma.$transaction` when a challan is confirmed
- `StockMovement` records every IN/OUT event for full audit trail

---

## 🔐 Role-Based Access Control

| Role | Permissions |
|---|---|
| `ADMIN` | Full access to all modules + user management |
| `SALES` | CRM, Products (view), Challan creation |
| `WAREHOUSE` | Products, Inventory movements, Challans (view) |
| `ACCOUNTS` | Customers, confirmed Challans, financial dashboard |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- npm

---

### Option A: Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/mini-erp-crm-portal.git
cd mini-erp-crm-portal

# 2. Copy environment files
cp server/.env.example server/.env
# Edit server/.env to set JWT_SECRET

# 3. Start all services
docker-compose up --build -d

# 4. Wait ~30 seconds, then run migrations + seed
docker-compose exec server npx prisma migrate deploy
docker-compose exec server npx ts-node prisma/seed.ts
```

Access:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api

---

### Option B: Local Development

#### 1. Setup Backend

```bash
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env:
#   DATABASE_URL="postgresql://postgres:password@localhost:5432/mini_erp"
#   JWT_SECRET="your-super-secret-key-change-in-production"
#   NODE_ENV=development
#   PORT=5000

# Run database migrations
npx prisma migrate dev

# Seed realistic demo data
npm run seed

# Start dev server
npm run dev
```

#### 2. Setup Frontend

```bash
cd client

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env:
#   VITE_API_URL=http://localhost:5000/api

# Start dev server
npm run dev
```

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@erp-demo.com` | `Admin@123` |
| Sales | `sales@erp-demo.com` | `Sales@123` |
| Warehouse | `warehouse@erp-demo.com` | `Warehouse@123` |
| Accounts | `accounts@erp-demo.com` | `Accounts@123` |

---

## 📡 REST API Reference

All API routes are prefixed with `/api`.

### Authentication & User Management
| Method | Endpoint | Description | Role |
|---|---|---|---|
| `POST` | `/auth/login` | Login and receive JWT | All |
| `GET` | `/auth/me` | Get current user profile | All |
| `GET` | `/auth/users` | List employee user accounts | `ADMIN` |
| `POST` | `/auth/register` | Create new staff account | `ADMIN` |
| `PATCH` | `/auth/users/:id/status` | Activate / Deactivate user account | `ADMIN` |


### Customers
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/customers` | List with pagination, search, filter |
| `POST` | `/customers` | Create customer |
| `GET` | `/customers/:id` | Get customer details |
| `PUT` | `/customers/:id` | Update customer |
| `DELETE` | `/customers/:id` | Deactivate customer |
| `GET` | `/customers/:id/followups` | List follow-ups |
| `POST` | `/customers/:id/followups` | Add follow-up |

### Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/products` | List with pagination, search, filter |
| `POST` | `/products` | Create product |
| `GET` | `/products/:id` | Get product |
| `PUT` | `/products/:id` | Update product |
| `DELETE` | `/products/:id` | Deactivate product |

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/inventory/movements` | List all stock movements |
| `GET` | `/inventory/low-stock` | Products below threshold |
| `POST` | `/inventory/movement` | Record IN/OUT/ADJUSTMENT |

### Sales Challans
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/challans` | List with pagination and filters |
| `POST` | `/challans` | Create DRAFT challan |
| `GET` | `/challans/:id` | Get challan details |
| `PUT` | `/challans/:id` | Update DRAFT challan |
| `POST` | `/challans/:id/confirm` | **Confirm + atomically deduct stock** |
| `POST` | `/challans/:id/cancel` | Cancel challan |

### Dashboard
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/dashboard/stats` | KPIs, charts, low-stock, recent activity |

---

## 🧪 Running Tests

Integration tests cover all critical business logic:

```bash
cd server

# Ensure test database is available (uses same DATABASE_URL or set TEST_DATABASE_URL)
npm test

# With coverage
npm test -- --coverage
```

### Test Coverage

1. ✅ Login with valid credentials
2. ✅ Login rejected with wrong password
3. ✅ Customer creation via CRM API
4. ✅ Product creation with unique SKU
5. ✅ Stock IN movement updates stock level
6. ✅ Stock OUT movement reduces stock level
7. ✅ Insufficient stock OUT is rejected (400)
8. ✅ DRAFT challan created without deducting stock
9. ✅ **CRITICAL: Full transaction rollback** when one item has insufficient stock
10. ✅ Challan confirmed with atomic stock deduction across multiple products
11. ✅ RBAC enforced: SALES cannot delete customers (403)

---

## 🔑 Critical Business Logic

### 1. Atomic Inventory Deduction on Challan Confirmation

```typescript
// server/src/services/challan.service.ts
await prisma.$transaction(async (tx) => {
  for (const item of challan.items) {
    const product = await tx.product.findUnique({ where: { id: item.productId } });
    if (product.currentStock < item.quantity) {
      throw new InsufficientStockError(product.name, product.currentStock, item.quantity);
    }
    await tx.product.update({
      where: { id: item.productId },
      data: { currentStock: { decrement: item.quantity } }
    });
    // Stock movement is also written inside same transaction
  }
  return tx.challan.update({ where: { id }, data: { status: 'CONFIRMED' } });
});
```

If **any product** has insufficient stock, the entire transaction rolls back — no partial deductions.

### 2. Historical Price Snapshots

When a challan is created, product name, SKU, and price are snapshotted into `ChallanItem`. This means:
- Future price changes don't alter historical orders
- Deactivated products still appear correctly on old challans

### 3. Non-Negative Stock Enforcement

Stock OUT requests are validated against current stock **before** the movement is recorded. This applies to both manual inventory adjustments and challan confirmations.

---

## 📁 Project Structure

```
mini-erp-crm-portal/
├── client/                         # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/             # Reusable UI: Badge, Modal, Pagination, Spinner
│   │   │   └── layout/             # Sidebar, Topbar
│   │   ├── context/                # AuthContext (JWT + user state)
│   │   ├── layouts/                # MainLayout wrapper
│   │   ├── pages/                  # Route-level page components
│   │   ├── routes/                 # ProtectedRoute RBAC wrapper
│   │   ├── services/               # Axios API service modules
│   │   └── types/                  # Shared TypeScript interfaces
│   ├── Dockerfile
│   └── nginx.conf
│
├── server/                         # Express + Prisma backend
│   ├── prisma/
│   │   ├── schema.prisma           # Database schema
│   │   ├── migrations/             # SQL migration history
│   │   └── seed.ts                 # Realistic Indian business seed data
│   ├── src/
│   │   ├── config/                 # Prisma client, env validation
│   │   ├── controllers/            # HTTP request/response handlers
│   │   ├── middleware/             # Auth, error handling, RBAC
│   │   ├── routes/                 # Route definitions
│   │   ├── services/               # Business logic layer
│   │   ├── utils/                  # Response helpers, AppError hierarchy
│   │   └── __tests__/             # Integration tests
│   └── Dockerfile
│
├── postman/                        # Postman API collection
│   └── Mini-ERP-CRM.postman_collection.json
│
└── docker-compose.yml              # Full-stack orchestration
```

---

## 🐳 Docker Compose Services

| Service | Port | Description |
|---|---|---|
| `db` | 5432 | PostgreSQL 15 with persistent volume |
| `server` | 5000 | Express API + Prisma |
| `client` | 3000 | React app via Nginx |

---

## 🛡️ Security Implementation

- **JWT** signed with HS256, configured expiry via `JWT_EXPIRES_IN`
- **bcryptjs** password hashing with salt rounds = 12
- **Helmet.js** HTTP security headers
- **express-rate-limit** on auth endpoints (15 req/min)
- **Zod** request body validation on all mutating endpoints
- **CORS** configured to allow only the frontend origin in production
- Role verification on every protected route (`authorizeRoles` middleware)

---

## 📌 Postman Collection

Import `postman/Mini-ERP-CRM.postman_collection.json` into Postman.

The **Login** request automatically saves the JWT token to the `token` collection variable, which is used by all subsequent requests via the collection-level Bearer Auth.

Set the `baseUrl` variable to your server URL (default: `http://localhost:5000/api`).

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes with proper TypeScript types
4. Run tests: `npm test`
5. Submit a pull request

---

*Built as a technical case study demonstrating production-grade full-stack engineering.*
