# Project Context: Diagnostic Test Booking & Payment Backend Service (Node.js / Express)

This document serves as the project context memory bank for the Diagnostic Test Booking & Simulated Payment Backend system built with **Node.js**, **Express**, **PostgreSQL (`pg` Pool)**, and **Redis**.

---

## 1. Project Goal & Requirements Summary

The objective is to build a robust, production-grade backend service for managing diagnostic test bookings and handling simulated payment processing with idempotent webhooks using **Node.js**, **Express**, **PostgreSQL (`pg` pool)**, and **Redis**.

### Core Modules & API Endpoints:
1. **Authentication System** (`/src/controllers/auth.controller.js`):
   - `POST /api/auth/signup`: Register new user account.
   - `POST /api/auth/login`: Authenticate and issue JWT token.
   - `JWT Auth Middleware`: Security middleware for protected routes (`req.user`).
   - Request payload validation middleware.

2. **Diagnostic Centers & Tests** (`/src/controllers/center.controller.js`, `test.controller.js`):
   - `GET /api/centers`: Retrieve list of diagnostic centers.
   - `GET /api/tests`: Retrieve diagnostic tests catalog.
   - `GET /api/center-tests`: Retrieve tests available at diagnostic centers with pricing.

3. **Availability & Slot Booking** (`/src/controllers/booking.controller.js`):
   - `GET /api/slots`: Check available slots for a diagnostic center test.
   - `POST /api/bookings`: Create a new booking (`user_id`, `slot_id`).
   - `GET /api/bookings`: List user bookings.
   - Initial status MUST be `pending`.

4. **Simulated Payment Service** (`/src/controllers/payment.controller.js`):
   - `POST /api/payments`: Trigger payment simulation (`booking_id`, `mop`, `amount`).
   - Updates payment status (`pending`, `success`, `failed`) and updates booking status (`booked`, `failed`).

5. **Payment Webhook (Idempotent)** (`/src/controllers/webhook.controller.js`):
   - `POST /api/payments/webhook`: Accept payment webhook events (`event_id`, `payment_id`, `status`, `receipt`).
   - **Idempotency Mandate**:
     - Uses `event_id` UNIQUE constraint on `payments` table & Redis deduplication lock.
     - Database transaction (`BEGIN ... COMMIT`) with `FOR UPDATE` row lock.

---

## 2. Project Directory Structure

```
d:\Eve_Backend_Project\
├── src/
│   ├── app.js                      # Express application & middleware setup
│   ├── server.js                   # HTTP server entry point
│   ├── config/
│   │   └── database.js             # PostgreSQL connection pool setup
│   ├── controllers/                # Request handlers
│   ├── services/                   # Core business logic & state machine
│   ├── repositories/               # Data access layer (PostgreSQL SQL queries)
│   ├── routes/                     # Express API routes
│   ├── middleware/                 # Auth, Validation & Error middlewares
│   ├── schemas/                    # Input validation schemas
│   ├── utils/                      # Helper utilities
│   └── constants/                  # Constants & Enums
├── migrations/
│   ├── 001_init_schema.sql         # Database tables DDL
│   └── migrate.js                  # Migration runner script
├── .env
├── package.json
└── README.md
```

---

## 3. Booking & Payment State Machine

### Booking Statuses:
- `pending`: Booking created, awaiting payment.
- `booked`: Payment succeeded, slot confirmed.
- `completed`: Diagnostic test completed.
- `expired`: Booking expired due to unpaid slot timeout.
- `canceled`: Canceled by user or system.

### Payment Statuses:
- `pending`: Payment initiated.
- `success`: Payment processed successfully.
- `failed`: Payment processing failed.

---

## 4. Confirmed Database Schemas

### 1. `users`
- `id` (UUID, Primary Key)
- `name` (VARCHAR(255), NOT NULL)
- `phone_number` (VARCHAR(20))
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `address` (TEXT)
- `age` (INTEGER)
- `gender` (VARCHAR(20))
- `relationship_status` (VARCHAR(50))
- `created_at`, `updated_at`

### 2. `diagnostic_centers`
- `id` (UUID, Primary Key)
- `name` (VARCHAR(255), NOT NULL)
- `location` (TEXT, NOT NULL)
- `created_at`, `updated_at`

### 3. `tests`
- `id` (UUID, Primary Key)
- `name` (VARCHAR(255), NOT NULL)
- `description` (TEXT)
- `disease` (VARCHAR(255))
- `created_at`, `updated_at`

### 4. `diagnostic_center_tests` (Junction Table with Pricing)
- `id` (UUID, Primary Key)
- `diagnostic_center_id` (UUID, FK -> `diagnostic_centers.id`)
- `test_id` (UUID, FK -> `tests.id`)
- `price` (NUMERIC(10, 2), NOT NULL)
- `created_at`, `updated_at`

### 5. `availability_slots`
- `id` (UUID, Primary Key)
- `diagnostic_center_test_id` (UUID, FK -> `diagnostic_center_tests.id`)
- `start_time` (TIMESTAMP WITH TIME ZONE)
- `end_time` (TIMESTAMP WITH TIME ZONE)
- `status` (VARCHAR(20), DEFAULT `'open'`, CHECK: `open`, `booked`)
- `created_at`, `updated_at`

### 6. `payments`
- `id` (UUID, Primary Key)
- `mop` (VARCHAR(50), Mode of Payment: CARD, UPI, NETBANKING, MOCK)
- `status` (VARCHAR(20), DEFAULT `'pending'`, CHECK: `pending`, `success`, `failed`)
- `event_id` (VARCHAR(255), UNIQUE for Webhook Idempotency)
- `receipt` (VARCHAR(255))
- `amount` (NUMERIC(10, 2))
- `created_at`, `updated_at`

### 7. `bookings`
- `id` (UUID, Primary Key)
- `user_id` (UUID, FK -> `users.id`)
- `slot_id` (UUID, FK -> `availability_slots.id`)
- `payment_id` (UUID, FK -> `payments.id`, NULLABLE)
- `status` (VARCHAR(20), DEFAULT `'pending'`, CHECK: `pending`, `booked`, `completed`, `expired`, `canceled`)
- `created_at`, `updated_at`

---

## 5. Migrations File

The schema migration is located at:
- SQL DDL File: [`migrations/001_init_schema.sql`](file:///d:/Eve_Backend_Project/migrations/001_init_schema.sql)
- Migration Runner: [`migrations/migrate.js`](file:///d:/Eve_Backend_Project/migrations/migrate.js)
- NPM Command: `npm run migrate`
