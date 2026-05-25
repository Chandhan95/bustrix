# 🚌 BusTix — Enterprise Bus Booking Application

<div align="center">
  <img src="https://img.shields.io/badge/Spring%20Boot-3.2.5-green?style=for-the-badge&logo=spring" />
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/MySQL-8.0-orange?style=for-the-badge&logo=mysql" />
  <img src="https://img.shields.io/badge/JWT-Auth-purple?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Tailwind-CSS-cyan?style=for-the-badge&logo=tailwindcss" />
</div>

---

## 📋 Project Overview

BusTix is a **production-ready enterprise bus booking platform** with a full Spring Boot backend, React.js frontend, MySQL database, JWT authentication, QR code ticketing, email notifications, and a complete admin dashboard.

---

## ✨ Features

### 🔐 Authentication
- JWT-based authentication with BCrypt password hashing
- Role-based access control (ADMIN / USER)
- Email verification & password reset via email

### 🚍 Bus Search
- Search by source, destination, travel date & seats
- Sort by price, departure time, availability
- Filter by bus type (AC, Sleeper, Volvo, Luxury...)

### 💺 Seat Selection
- Interactive 2+2 seat map
- Real-time seat availability
- 10-minute seat locking to prevent double booking
- Auto-refresh every 30 seconds

### 🎫 Bookings
- Book up to 10 seats per transaction
- QR code ticket generation
- Booking cancellation (up to 2h before departure)
- Full booking history with pagination

### 📧 Email Notifications
- Welcome email on registration
- Booking confirmation with QR code
- Cancellation confirmation with refund info
- Password reset email

### 🛠️ Admin Dashboard
- Business analytics (charts, revenue, KPIs)
- Bus, Route, Schedule management (full CRUD)
- User management with role control
- Top routes analytics

---

## 🏗️ Architecture

```
buss/
├── backend/          ← Spring Boot (Maven)
│   └── src/main/java/com/busbooking/
│       ├── config/       ← SecurityConfig, CORS
│       ├── controller/   ← REST endpoints
│       ├── dto/          ← Request/Response DTOs
│       ├── entity/       ← JPA Entities
│       ├── exception/    ← Global exception handler
│       ├── repository/   ← JPA Repositories
│       ├── security/     ← JWT filter & service
│       ├── service/      ← Business logic
│       └── util/         ← QR code, PNR helpers
│   └── src/main/resources/
│       ├── application.properties
│       ├── logback-spring.xml
│       ├── schema.sql
│       └── templates/    ← Email HTML templates
└── frontend/         ← React 18 + Vite
    └── src/
        ├── api/          ← Axios instance + API modules
        ├── context/      ← AuthContext
        ├── pages/        ← All page components
        │   └── admin/    ← Admin-only pages
        └── components/   ← Reusable components
```

---

## 🛠️ Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Framer Motion |
| State      | Context API, react-hook-form                |
| HTTP       | Axios with JWT interceptors                 |
| Charts     | Recharts                                    |
| QR Code    | qrcode.react (frontend), ZXing (backend)    |
| Backend    | Spring Boot 3.2, Spring Security            |
| Auth       | JWT (JJWT 0.12), BCrypt                    |
| ORM        | Spring Data JPA + Hibernate                 |
| Database   | MySQL 8.0                                   |
| Email      | JavaMailSender + Thymeleaf templates         |
| Logging    | SLF4J + Logback (file + console)            |
| Build      | Maven (backend), npm (frontend)             |

---

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8.0
- Maven 3.8+

### 1. Database Setup
```sql
-- Run the schema
mysql -u root -p < backend/src/main/resources/schema.sql
```

### 2. Backend Setup
```bash
cd backend

# Configure application.properties
# Set: spring.datasource.password=yourpassword
# Set: spring.mail.username & spring.mail.password

mvn clean install
mvn spring-boot:run
# Backend runs at: http://localhost:8080/api
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs at: http://localhost:5173
```

---

## 🔑 Default Credentials

| Role  | Email                  | Password       |
|-------|------------------------|----------------|
| Admin | admin@bustix.com       | Admin@123456   |

---

## 📡 Key API Endpoints

| Method | Endpoint                    | Description            | Auth |
|--------|-----------------------------|------------------------|------|
| POST   | /api/auth/register          | Register user          | ❌   |
| POST   | /api/auth/login             | Login                  | ❌   |
| POST   | /api/buses/search           | Search buses           | ❌   |
| GET    | /api/buses/{id}/seats       | Get seat map           | ✅   |
| POST   | /api/bookings               | Create booking         | ✅   |
| GET    | /api/bookings/my            | My booking history     | ✅   |
| POST   | /api/bookings/{id}/cancel   | Cancel booking         | ✅   |
| GET    | /api/admin/dashboard        | Admin analytics        | 🔐 ADMIN |
| POST   | /api/admin/buses            | Add bus                | 🔐 ADMIN |
| POST   | /api/admin/routes           | Add route              | 🔐 ADMIN |
| POST   | /api/admin/schedules        | Add schedule           | 🔐 ADMIN |

---

## 🌍 Environment Variables

### Backend (`application.properties`)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bus_booking_db
spring.datasource.username=root
spring.datasource.password=YOUR_DB_PASSWORD

spring.mail.username=YOUR_GMAIL
spring.mail.password=YOUR_APP_PASSWORD

app.jwt.secret=YOUR_256_BIT_SECRET_KEY
```

---

## 📁 Logs
Logs are written to `./logs/`:
- `bus-booking-app.log` — all logs
- `bus-booking-app-error.log` — errors only
- `bookings.log` — booking activity

---

## 🏆 Production Build

```bash
# Backend
cd backend && mvn clean package
java -jar target/bus-booking-backend-1.0.0.jar

# Frontend
cd frontend && npm run build
# Serve dist/ folder with nginx or any static server
```

---

## 📄 License

MIT License — Built with ❤️ as an enterprise demonstration project.
