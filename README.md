# 🛍️ ShopEase — Smart Inventory Management System

> **Enterprise-Grade Multi-Role Inventory, Forecasting & E-Commerce Platform**  
> Built with **React 19**, **Spring Boot 3 (Java 17)**, **Python AI Service**, and **MongoDB Atlas**.

---

## 🌟 Demo Credentials (Instant Access)

ShopEase includes pre-configured, pre-approved accounts so reviewers and users can test all roles immediately upon visiting `/login`:

| Role | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **🛡️ Admin** | `admin@shopease.com` | `AdminPassword123!` | Complete Admin Suite (`/admin/*`), Products, Transactions, Analytics, Forecasting, Restock, Approvals, Alerts |
| **🏬 Store Manager** | `manager@shopease.com` | `ManagerPassword123!` | Inventory operations, Restock orders, Product logs, Stock updates |
| **👤 Customer** | `user@shopease.com` | `UserPassword123!` | Public Storefront (`/`, `/user-dashboard`), Live Cart (`/cart`), Checkout, Order history |

> 💡 **Quick Login Tip**: On the `/login` page, you can simply click the **🛡️ Admin**, **🏬 Manager**, or **👤 Customer** button to instantly auto-fill credentials!

---

## 🚀 Key Features

### 1. 🛒 Customer Storefront
- **Modern Responsive Design**: Hero banner, curated trending collections, live product catalog.
- **Real-Time Stock Status**: Dynamic badges for `In Stock`, `Low Stock`, and `Out of Stock`.
- **Interactive Cart**: Real-time quantity adjustments, price calculations, and seamless checkout.

### 2. 🛡️ Admin & Store Management Suite
- **Analytics & KPIs**: Real-time metrics on total revenue, active orders, low stock items, and sales trends.
- **Product Catalog Management**: Add, update, delete, and restock products with image previews.
- **Transaction History**: Audit logs for every purchase, restock, and inventory movement.
- **Reporting Engine**: 1-click export of inventory and financial reports in both **PDF** and **Excel (.xlsx)** formats.
- **Automated Alerts**: Low-stock thresholds automatically trigger real-time notifications.

### 3. 🤖 Machine Learning Sales Forecasting
- **Linear Regression Model**: Analyzes historical sales velocity to forecast 7-day demand for each product.
- **AI-Powered Restock Advice**: Recommends optimal reorder quantities to avoid stockouts.

### 4. 🔐 Security & Communication
- **Spring Security 6 & JWT**: Role-based access control (RBAC) with token expiration.
- **BCrypt Encryption**: Passwords securely hashed with salted rounds.
- **Email Notifications**: Integrated with Gmail SMTP (`JavaMailSender`) for password reset requests and vendor purchase orders.

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    React 19 Frontend                        │
│         (React Router v7, Bootstrap 5, Axios, CSS Var)      │
└──────────────┬───────────────────────────────┬──────────────┘
               │ /api/* (REST + JWT)            │ Direct Data
               ▼                               ▼
┌─────────────────────────────┐    ┌──────────────────────────┐
│   Spring Boot 3 Backend     │    │  Python Flask AI Service │
│ (Java 17, Spring Security)  │    │  (scikit-learn, pandas)  │
└──────────────┬──────────────┘    └───────────┬──────────────┘
               │                               │
               └───────────────┬───────────────┘
                               ▼
                ┌─────────────────────────────┐
                │     MongoDB Atlas Cloud     │
                │        (inventory_db)       │
                └─────────────────────────────┘
```

- **Frontend**: React 19, React Router v7, React-Bootstrap, Bootstrap Icons, Animate.css
- **Backend**: Java 17, Spring Boot 3, Spring Data MongoDB, Spring Security, JWT (jjwt 0.11.5), Apache POI, iText7
- **AI Service**: Python 3.10+, Flask, scikit-learn, pandas, numpy, pymongo
- **Database**: MongoDB Atlas Cluster (`inventory_db`)

---

## 💻 Local Setup & Execution

### Prerequisites
- **Node.js** (v18+) & **npm**
- **Java Development Kit (JDK 17+)**
- **Maven** (3.8+)
- **Python** (3.9+)

### 1. Clone the Repository
```bash
git clone https://github.com/Mbarathm345672005/inventory-management-system-user-store-manager-and-admin-.git
cd inventory-management-system-user-store-manager-and-admin-
```

### 2. Run the Spring Boot Backend
```bash
cd inventory-backend
mvn spring-boot:run
```
*Backend runs at: `http://localhost:8080`*

### 3. Run the Python AI Service
```bash
cd ../inventory-ai-service
pip install -r requirements.txt
python app.py
```
*AI service runs at: `http://localhost:5000`*

### 4. Run the React Frontend
```bash
cd ../inventory-frontend
npm install
npm start
```
*Frontend opens at: `http://localhost:3000`*

---

## ☁️ Deployment / Hosting Guide

| Service | Recommended Platform | Configuration |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) or [Netlify](https://netlify.com) | Root: `inventory-frontend`<br>Build: `npm run build`<br>Output: `build`<br>Env: `REACT_APP_API_BASE_URL=<your-backend-url>` |
| **Backend** | [Render](https://render.com) | Root: `inventory-backend`<br>Build: `mvn clean package -DskipTests`<br>Start: `java -jar target/inventory-backend-0.0.1-SNAPSHOT.jar` |
| **AI Service** | [Render](https://render.com) | Root: `inventory-ai-service`<br>Build: `pip install -r requirements.txt`<br>Start: `gunicorn app:app` |
| **Database** | [MongoDB Atlas](https://www.mongodb.com/atlas) | Pre-configured and connected (`inventory_db`) |

---

## 👨‍💻 Author
- **Barath M** — [GitHub Profile](https://github.com/Mbarathm345672005)
