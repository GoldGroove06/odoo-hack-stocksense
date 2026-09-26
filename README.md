# 📦 StockSense - Next-Gen Inventory & Warehouse Management ERP

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite%20%7C%20TailwindCSS%20v4-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%205-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Prisma%20ORM-4169E1?logo=postgresql&logoColor=white)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

**StockSense** is an enterprise-grade, Odoo-inspired Inventory and Warehouse Operations Management system designed for modern supply chains. It provides end-to-end traceability, real-time stock valuation using Weighted Average Cost (WAC), multi-warehouse routing, inward receipts, outward delivery orders, internal stock transfers, and automated physical count adjustments.

---

## 🚀 Key Features

### 📊 1. Real-Time Inventory Dashboard & Analytics
- Dynamic KPIs: Total SKU catalog count, On-Hand vs. Free-to-Use stock volume, Low-Stock threshold warnings, and pending warehouse operations.
- Real-time stock movement ledger and visual activity breakdown.

### 📥 2. Inward Receipts (`WH/IN`)
- Complete receipt lifecycle management (`Draft` ➔ `In Progress` ➔ `Ready` ➔ `Done / Validated`).
- Direct integration with verified Supplier databases.
- Automatic inventory replenishment: increases `onHand` and `freeToUse` stock upon validation.
- Real-time product cost recalibration via **Weighted Average Cost (WAC)** valuation.
- Strict validation guarding against past scheduled dates and catalog inconsistencies.

### 📤 3. Outward Deliveries (`WH/OUT`)
- Standard 3-step logistics workflow: **Pick** ➔ **Pack** ➔ **Validate & Dispatch**.
- Automated stock reservation and inventory decrement upon dispatch.
- Logistics metadata tracking (Carrier name, Tracking number, Vehicle numbers, Customer notes).
- Printable Delivery Challans & Invoices.

### 🔄 4. Internal Transfers (`WH/INT`)
- Seamless stock rebalancing between multiple warehouses and specific storage bin locations.
- Pick and drop timestamp tracking for warehouse staff operations.

### ⚖️ 5. Physical Inventory Adjustments
- Perform scheduled physical counts and cycle counts.
- Automated variance calculations (`Theoretical Qty` vs. `Counted Qty`) with instantaneous financial impact analysis.
- One-click validation reconciling ledger quantities with live physical counts.

### 🗄️ 6. Master Data & Warehouse Hierarchy
- Multi-Warehouse and Hierarchical Storage Locations (Racks, Aisles, Bins).
- Product Catalog with SKU indexing, Category tagging, and Unit of Measure (UOM) definitions.
- Bill of Materials (BOM) parent-child structure for manufacturing workflows.
- Supplier and Customer relationship directories.

### 🔐 7. Security & Role-Based Access Control
- JWT-based authentication with bcrypt password encryption.
- Multi-role authorization (`OWNER`, `INVENTORY_MANAGER`, `WAREHOUSE_STAFF`).
- OTP-based password reset mechanism via Nodemailer.

---

## 🏗️ Architecture & Workflow

```mermaid
flowchart TD
    subgraph Frontend["Frontend (React 19 + Tailwind v4 + Vite)"]
        UI[User Interface / Dashboards]
        API_SVC[Axios API Client + JWT Interceptors]
    end

    subgraph Backend["Backend (Node.js + Express 5)"]
        AUTH[Auth & Security Middleware]
        CTRL[Controllers: Receipts, Deliveries, Adjustments, Transfers]
        PRISMA[Prisma ORM Client]
    end

    subgraph Database["Database (PostgreSQL)"]
        DB[(StockSense Relational Database)]
    end

    UI --> API_SVC
    API_SVC -->|REST API Requests with Bearer Token| AUTH
    AUTH --> CTRL
    CTRL --> PRISMA
    PRISMA --> DB
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router DOM v7, Lucide Icons, Axios |
| **Backend** | Node.js, Express 5, Prisma ORM, JSON Web Tokens (JWT), Bcrypt, Nodemailer |
| **Database** | PostgreSQL |
| **Tooling** | Git, ESLint, Postman |

---

## 📋 API Reference

All backend endpoints are prefixed with `/api/v1`.

### 🔑 Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new organization user |
| `POST` | `/auth/login` | Authenticate user & receive JWT token |
| `GET` | `/auth/profile` | Retrieve logged-in user profile |
| `POST` | `/auth/forgot-password` | Request password reset OTP |
| `POST` | `/auth/reset-password` | Reset password using verified OTP |

### 📦 Inventory Operations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/receipts` | List all inward receipts |
| `POST` | `/receipts` | Create draft receipt order |
| `GET` | `/receipts/:id` | Get receipt details & line items |
| `PATCH` | `/receipts/:id` | Update receipt details |
| `DELETE` | `/receipts/:id` | Delete receipt order |
| `POST` | `/receipts/:id/validate` | Validate receipt & increase stock |
| `GET` | `/deliveries` | List outward delivery orders |
| `POST` | `/deliveries` | Create draft delivery order |
| `GET` | `/deliveries/:id` | Get delivery order details |
| `PATCH` | `/deliveries/:id` | Update delivery order |
| `DELETE` | `/deliveries/:id` | Delete delivery order |
| `POST` | `/deliveries/:id/pick` | Record picking stage |
| `POST` | `/deliveries/:id/pack` | Record packing stage |
| `POST` | `/deliveries/:id/validate` | Validate delivery & decrease stock |
| `GET` | `/transfers` | List internal transfers |
| `POST` | `/transfers` | Create internal transfer |
| `POST` | `/transfers/:id/validate` | Validate transfer & relocate stock |
| `GET` | `/adjustments` | List stock adjustments |
| `POST` | `/adjustments` | Create physical count adjustment |
| `POST` | `/adjustments/:id/validate` | Validate adjustment & correct stock |

### 🏷️ Master Data & Configuration
| Method | Endpoint | Description |
|---|---|---|
| `GET`, `POST`, `PATCH`, `DELETE` | `/products` | Manage product catalog & inventory levels |
| `GET`, `POST`, `PATCH`, `DELETE` | `/categories` | Manage product categories |
| `GET`, `POST`, `PATCH`, `DELETE` | `/uom` | Manage Units of Measure (UOM) |
| `GET`, `POST`, `PATCH`, `DELETE` | `/warehouses` | Manage warehouse locations |
| `GET`, `POST`, `PATCH`, `DELETE` | `/locations` | Manage storage bin locations |
| `GET`, `POST`, `PATCH`, `DELETE` | `/suppliers` | Manage vendor directory |
| `GET`, `POST`, `PATCH`, `DELETE` | `/customers` | Manage customer directory |
| `GET` | `/movements` | Audit stock ledger & traceability logs |
| `GET` | `/dashboard/metrics` | Fetch aggregated dashboard metrics |

---

## ⚙️ Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18+ recommended)
- [PostgreSQL](https://www.postgresql.org/) database instance
- npm or yarn package manager

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/odoo-hack-stocksense.git
cd odoo-hack-stocksense
```

### 2. Backend Configuration & Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env
```

Configure your `.env` file with your database connection and secret keys:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/stocksense_db?schema=public"
JWT_SECRET="your_jwt_secret_key_here"
EMAIL_USER="your_email@example.com"
EMAIL_PASS="your_email_app_password"
```

Initialize the database schema and seed initial data:
```bash
# Push schema to PostgreSQL database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Seed demo master data
npm run seed

# Start backend server
npm run dev
```
The backend will run on `http://localhost:3000`.

### 3. Frontend Configuration & Setup
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create frontend environment file
cp .env.example .env
```

Ensure `.env` contains the API base URL:
```env
VITE_API_URL=http://localhost:3000/api/v1
```

Start the Vite development server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

---

## 📂 Project Structure

```text
odoo-hack-stocksense/
├── backend/
│   ├── config/              # Database connection & third-party configs
│   ├── controllers/         # Business logic (Receipts, Deliveries, Stock, Auth)
│   ├── middlewares/         # JWT verification, Role validation, Error handling
│   ├── prisma/
│   │   ├── schema.prisma    # Prisma PostgreSQL schema definition
│   │   └── seed.js          # Database seed scripts
│   ├── router/              # Express API route declarations
│   ├── services/            # Stock recalculation & valuation services
│   ├── utils/               # Helper utilities & email templates
│   ├── index.js             # Express application entry point
│   └── package.json
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── api/             # API client handlers
│   │   ├── components/      # Reusable UI components (Navbar, Modals, Tables)
│   │   ├── context/         # React Context providers (Auth, Theme)
│   │   ├── pages/
│   │   │   ├── dashboard/   # Analytics & KPI overview
│   │   │   ├── receipts/    # Inward receipts management
│   │   │   ├── delivery/    # Outward delivery orders & dispatch
│   │   │   ├── transfers/   # Internal warehouse movements
│   │   │   ├── adjustments/ # Physical stock counts
│   │   │   ├── Product/     # Product catalog & BOM
│   │   │   ├── settings/    # Warehouses, Locations, Categories, UOMs
│   │   │   └── auth/        # Login, Signup, Password reset
│   │   ├── services/        # Centralized Axios API instances
│   │   ├── App.jsx          # App routing and route guards
│   │   └── main.jsx         # React application entry point
│   ├── index.html
│   ├── vite.config.js       # Vite configuration
│   └── package.json
└── README.md
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute:
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
