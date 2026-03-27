# 🎢 Amusement Park Management System

A full-stack web application designed to manage operations of an amusement park, including ticket booking, activity tracking, and daily reporting.

---

## 📌 Overview

This project simulates a real-world amusement park management system where users can:

* Create and manage tickets
* View available park activities
* Generate daily operational reports

It demonstrates full-stack development skills, including API design, database management, and frontend integration.

---

## 🚀 Features

* 🎟️ Ticket creation and management
* 📊 Daily report generation
* 🎡 Activity listing and tracking
* 🧩 RESTful API architecture
* ⚡ Modern frontend with real-time interaction

---

## 🛠️ Tech Stack

**Frontend:**

* React (Client)

**Backend:**

* Node.js
* Express

**Database:**

* SQL (Relational Database)

  * Uses migrations and seed scripts for schema and initial data

**Other Tools:**

* Yarn Workspaces
* REST API

---

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/amusement-park-management.git
cd amusement-park-management
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Setup Database

Make sure you have an SQL database running (e.g., PostgreSQL / MySQL / SQLite).

```bash
cd server
yarn migrate
yarn seed
```

This will:

* Create database tables (tickets, activities, etc.)
* Populate initial sample data

---

## ▶️ Run the Application

**Start Backend Server:**

```bash
yarn workspace server dev
```

**Start Frontend Client:**

```bash
yarn workspace client dev
```

---

## 📡 API Endpoints

### 🎟️ Tickets

* **Create Ticket**

```http
POST /api/tickets
```

* **Get All Tickets**

```http
GET /api/tickets
```

---

### 📊 Reports

* **Daily Report**

```http
GET /api/reports/daily?date=YYYY-MM-DD
```

---

### 🎡 Activities

* **List Activities**

```http
GET /api/activities
```

---

## 📂 Project Structure

```
amusement-park-management/
│
├── client/        # Frontend (React)
├── server/        # Backend (Node.js + Express)
│   ├── migrations/  # SQL schema migrations
│   ├── seeds/       # Initial data scripts
│   └── models/      # Database models
│
├── package.json   # Root config with workspaces
└── README.md
```

---

## 💡 Key Learnings

* Designing relational database schemas using SQL
* Writing migrations and seed scripts
* Building scalable REST APIs
* Structuring a full-stack monorepo using Yarn workspaces
* Integrating frontend with backend services

---

## 🔮 Future Improvements

* User authentication & roles (Admin/User)
* Payment integration for ticket booking
* Advanced SQL reporting & analytics
* Deployment (AWS / Docker / CI/CD)

---

## 🤝 Contributing

Contributions are welcome! Feel free to fork the repo and submit a pull request.

---

## 📧 Contact

If you have any questions or feedback, feel free to reach out.

---

⭐ If you found this project helpful, consider giving it a star!
