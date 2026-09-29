# Diagnostic Test Booking & Simulated Payment Backend Service

Production-grade, high-concurrency backend API service built with **Node.js**, **Express**, **Prisma ORM**, **PostgreSQL**, and **Redis**. 

This system handles diagnostic center catalog browsing, automated 7-day slot generation via nightly cron jobs, 10-minute temporary Redis slot locking during booking, and idempotent simulated payment processing.

---

## 📋 Table of Contents
1. [Key Features](#-key-features)
2. [Tech Stack](#-tech-stack)
3. [Important Assumptions](#-important-assumptions)
4. [How to Run Locally](#-how-to-run-locally)
   - [Option A: Docker Compose (Recommended)](#option-a-docker-compose-recommended)
   - [Option B: Local Node.js Development](#option-b-local-nodejs-development)
5. [Database & Schema Design](#-database--schema-design)
6. [Booking & Payment State Machine](#-booking--payment-state-machine)
7. [Complete API Endpoints Reference](#-complete-api-endpoints-reference)
   - [1. Authentication & User Management](#1-authentication--user-management-apiusers)
   - [2. Diagnostic Centers Catalog](#2-diagnostic-centers-catalog-apidiagnostic-centers)
   - [3. Diagnostic Tests Catalog](#3-diagnostic-tests-catalog-apitests)
   - [4. Center-Test Pricing Mappings](#4-center-test-pricing-mappings-apicenter-tests)
   - [5. Availability Slots & Cron Generation](#5-availability-slots--cron-generation-apislots)
   - [6. Slot Bookings & 10-Min Redis Locks](#6-slot-bookings--10-min-redis-locks-apibookings)
   - [7. Payments & Idempotent Webhooks](#7-payments--idempotent-webhooks-apipayments)
   - [8. System Health Check](#8-system-health-check-health)
8. [Future Improvements](#-future-improvements)

---

## 🚀 Key Features

- **Automated Slot Generation (Cron)**: Nightly cron job at `03:30 AM IST` generates 1-hour availability slots for the next 7 days for all diagnostic center test mappings.
- **Concurrency Control & Redis Locking**: Temporary 10-minute Redis lock (`TTL: 600s`) prevents race conditions and double bookings. Locked slots are dynamically filtered out and hidden from other users.
- **Idempotent Webhook Payment Processing**: Secure payment webhook processing with deduplication locks and transaction safety.
- **Database Schema & ORM**: Managed using **Prisma ORM** with **PostgreSQL**.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (`v20+`)
- **Framework**: Express.js (`v5+`)
- **Database**: PostgreSQL (`v16`)
- **ORM**: Prisma ORM (`v6+`)
- **In-Memory Store & Lock**: Redis (`ioredis v6+`)
- **Scheduler**: `node-cron`
- **Authentication**: JWT (`jsonwebtoken`) & `bcrypt`
- **Containerization**: Docker & Docker Compose

---

## 💡 Important Assumptions

1. **Slot Duration**: Every availability slot is strictly **1 hour** long.
2. **Diagnostic Center Operating Hours**: Diagnostic centers operate from **10:00 AM IST to 06:00 PM IST** (8 1-hour slots per day per center-test mapping: `10-11`, `11-12`, `12-13`, `13-14`, `14-15`, `15-16`, `16-17`, `17-18`).
3. **10-Minute Payment Window & Redis Lock**:
   - When a user initiates a booking (`POST /api/bookings`), a 10-minute lock (`TTL: 600s`) is set in Redis (`slot_lock:<slot_id>`).
   - The slot is immediately hidden from other users during slot availability searches (`GET /api/slots`).
   - If payment succeeds within 10 minutes, the slot is marked as `booked` in PostgreSQL and the Redis lock is removed.
   - If payment fails or is canceled, the Redis lock is removed so the slot becomes visible and available again for other users.
4. **Timezone**: All slot calculations and scheduled cron jobs run according to **IST (Indian Standard Time, UTC+5:30)**.

---

## 🖥️ How to Run Locally

### Environment Variables Setup

Create a `.env` file in the project root:

```env
PORT=5000
NODE_ENV=development

# Database URLs (Local PostgreSQL or Supabase)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eve_backend?sslmode=disable"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/eve_backend?sslmode=disable"

# JWT Secret
JWT_SECRET="DiagBooking@2026#SecretKey"
JWT_EXPIRES_IN="1d"

# Redis URL
REDIS_URL="redis://localhost:6379"
```

---

### Option A: Docker Compose (Recommended)

Run the entire application stack (Node.js App + PostgreSQL + Redis) with a single command:

```bash
# Build and start all services in detached mode
docker compose up --build -d

# View logs
docker compose logs -f app

# Stop containers
docker compose down
```

The server will be available at `http://localhost:5000`.

---

### Option B: Local Node.js Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Prisma Migrations & Client Generation**:
   ```bash
   npm run prisma:generate
   npm run db:push
   ```

3. **Seed Initial Database Data** (Optional):
   ```bash
   npm run db:seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 🗄️ Database & Schema Design

Managed via `prisma/schema.prisma`:

```
User (1) ───< Booking (N)
DiagnosticCenter (1) ───< DiagnosticCenterTest (N) >─── (1) Test
DiagnosticCenterTest (1) ───< AvailabilitySlot (N)
AvailabilitySlot (1) ───< Booking (N)
Booking (1) ───? Payment (1)
```

### Models Summary:
1. `users`: User profiles (name, email, password_hash, phone_number, address, age, gender).
2. `diagnostic_centers`: Diagnostic laboratory locations.
3. `tests`: Diagnostic tests catalog (CBC, Lipid Profile, Thyroid, etc.).
4. `diagnostic_center_tests`: Junction table assigning tests to centers with pricing.
5. `availability_slots`: 1-hour time slots (`start_time`, `end_time`, `status: open|booked`).
6. `bookings`: User bookings (`status: pending|booked|completed|canceled`).
7. `payments`: Payment records (`status: pending|success|failed`, `mop`, `event_id`, `receipt`).

---

## 🔄 Booking & Payment State Machine

```
[Available Slot]
      │
      ▼
 (POST /api/bookings) ──► Slot Locked in Redis (10 min TTL)
      │                   Booking Status: "pending"
      │
      ├─── Payment Success within 10 mins ──► DB Slot Status: "booked"
      │                                       DB Booking Status: "booked"
      │                                       Redis Lock: Removed
      │
      └─── Payment Failure / Timeout ────────► DB Booking Status: "canceled"
                                              Redis Lock: Removed (Slot Available again)
```

---

## 🌐 Complete API Endpoints Reference

### 1. Authentication & User Management (`/api/users`)

#### Register User
- **Method**: `POST`
- **Endpoint**: `/api/users/signup`
- **Request Body**:
  ```json
  {
    "name": "Rahul Sharma",
    "email": "rahul.sharma@example.in",
    "password": "Password123!",
    "phone_number": "+919876543210",
    "address": "Indiranagar, Bengaluru",
    "age": 29,
    "gender": "Male"
  }
  ```

#### Login User
- **Method**: `POST`
- **Endpoint**: `/api/users/login`
- **Request Body**:
  ```json
  {
    "email": "rahul.sharma@example.in",
    "password": "Password123!"
  }
  ```

#### Get User Profile by ID
- **Method**: `GET`
- **Endpoint**: `/api/users/:id`

---

### 2. Diagnostic Centers Catalog (`/api/diagnostic-centers`)

#### Create Diagnostic Center
- **Method**: `POST`
- **Endpoint**: `/api/diagnostic-centers`
- **Request Body**:
  ```json
  {
    "name": "Apollo Diagnostics - Indiranagar",
    "location": "100 Feet Road, Indiranagar, Bengaluru, Karnataka"
  }
  ```

#### Get All Diagnostic Centers
- **Method**: `GET`
- **Endpoint**: `/api/diagnostic-centers`

#### Get Diagnostic Center Details by ID
- **Method**: `GET`
- **Endpoint**: `/api/diagnostic-centers/:id`

#### Get All Tests Offered by a Center
- **Method**: `GET`
- **Endpoint**: `/api/diagnostic-centers/:id/tests`

#### Update Diagnostic Center Details
- **Method**: `PUT`
- **Endpoint**: `/api/diagnostic-centers/:id`
- **Request Body**:
  ```json
  {
    "name": "Apollo Diagnostics - Indiranagar Main Branch",
    "location": "Indiranagar 100ft Road, Bengaluru"
  }
  ```

#### Delete Diagnostic Center
- **Method**: `DELETE`
- **Endpoint**: `/api/diagnostic-centers/:id`

---

### 3. Diagnostic Tests Catalog (`/api/tests`)

#### Create Diagnostic Test
- **Method**: `POST`
- **Endpoint**: `/api/tests`
- **Request Body**:
  ```json
  {
    "name": "Full Body Lipid Profile",
    "description": "Measures cholesterol, HDL, LDL, and triglycerides.",
    "disease": "Cardiovascular Risk"
  }
  ```

#### Get All Diagnostic Tests
- **Method**: `GET`
- **Endpoint**: `/api/tests`

#### Get Test Details by ID
- **Method**: `GET`
- **Endpoint**: `/api/tests/:id`

#### Get All Diagnostic Centers Offering a Specific Test
- **Method**: `GET`
- **Endpoint**: `/api/tests/:id/centers`

#### Update Diagnostic Test Details
- **Method**: `PUT`
- **Endpoint**: `/api/tests/:id`

#### Delete Diagnostic Test
- **Method**: `DELETE`
- **Endpoint**: `/api/tests/:id`

---

### 4. Center-Test Pricing Mappings (`/api/center-tests`)

#### Create Center-Test Mapping with Pricing
- **Method**: `POST`
- **Endpoint**: `/api/center-tests`
- **Request Body**:
  ```json
  {
    "diagnostic_center_id": "<DIAGNOSTIC_CENTER_UUID>",
    "test_id": "<TEST_UUID>",
    "price": 499.00
  }
  ```

#### Get All Center-Test Mappings
- **Method**: `GET`
- **Endpoint**: `/api/center-tests`

#### Get Center-Test Mapping Details by ID
- **Method**: `GET`
- **Endpoint**: `/api/center-tests/:id`

#### Delete Center-Test Mapping
- **Method**: `DELETE`
- **Endpoint**: `/api/center-tests/:id`

---

### 5. Availability Slots & Cron Generation (`/api/slots`)

#### Create Custom Availability Slot
- **Method**: `POST`
- **Endpoint**: `/api/slots`
- **Request Body**:
  ```json
  {
    "diagnostic_center_test_id": "<CENTER_TEST_UUID>",
    "start_time": "2026-09-30T10:00:00+05:30",
    "end_time": "2026-09-30T11:00:00+05:30"
  }
  ```

#### Trigger 7-Day Slot Generation (10 AM - 6 PM IST)
- **Method**: `POST`
- **Endpoint**: `/api/slots/generate-7days`
- **Response**:
  ```json
  {
    "success": true,
    "message": "Generated 1-hour availability slots for the next 7 days (160 new slots created)",
    "data": { "createdCount": 160 }
  }
  ```

#### Get All Slots (Filters Out Redis Locked Slots)
- **Method**: `GET`
- **Endpoint**: `/api/slots`
- **Query Parameters**: `centerTestId`, `status`, `diagnostic_center_id`, `test_id`

#### Get Slots for Center & Test (Query Params)
- **Method**: `GET`
- **Endpoint**: `/api/slots/center-test?diagnostic_center_id=<CENTER_ID>&test_id=<TEST_ID>`

#### Get Slots for Center & Test (URL Params)
- **Method**: `GET`
- **Endpoint**: `/api/slots/center/:centerId/test/:testId`

#### Get Slot Details by ID
- **Method**: `GET`
- **Endpoint**: `/api/slots/:id`

#### Update Slot Status (`open` / `booked`)
- **Method**: `PATCH`
- **Endpoint**: `/api/slots/:id/status`
- **Request Body**:
  ```json
  {
    "status": "booked"
  }
  ```

---

### 6. Slot Bookings & 10-Min Redis Locks (`/api/bookings`)

#### Create Booking (Locks Slot in Redis for 10 Minutes)
- **Method**: `POST`
- **Endpoint**: `/api/bookings`
- **Request Body**:
  ```json
  {
    "user_id": "<USER_UUID>",
    "slot_id": "<SLOT_UUID>"
  }
  ```

#### Get All Bookings / User Bookings
- **Method**: `GET`
- **Endpoint**: `/api/bookings`
- **Query Parameters**: `userId`

#### Get Booking Details by ID
- **Method**: `GET`
- **Endpoint**: `/api/bookings/:id`

#### Cancel Booking (Releases Redis Lock & Slot)
- **Method**: `PATCH`
- **Endpoint**: `/api/bookings/:id/cancel`

---

### 7. Payments & Idempotent Webhooks (`/api/payments`)

#### Create / Initialize Payment Simulation
- **Method**: `POST`
- **Endpoint**: `/api/payments`
- **Request Body**:
  ```json
  {
    "booking_id": "<BOOKING_UUID>",
    "mop": "UPI",
    "amount": 499.00
  }
  ```

#### Process Payment Webhook (Idempotent Event Handler)
- **Method**: `POST`
- **Endpoint**: `/api/payments/webhook`
- **Request Body**:
  ```json
  {
    "event_id": "evt_wh_seed_1001",
    "payment_id": "<PAYMENT_UUID>",
    "status": "success",
    "receipt": "REC-20260929-1001"
  }
  ```

#### Get Payment Details by ID
- **Method**: `GET`
- **Endpoint**: `/api/payments/:id`

---

### 8. System Health Check (`/health`)

#### System Health Check
- **Method**: `GET`
- **Endpoint**: `/health`

---

## 🔮 Future Improvements

If given more time, the following features would be implemented:

1. **Role-Based Access Control (RBAC)**:
   - Implement authorization roles (`ADMIN`, `DIAGNOSTIC_CENTER_ADMIN`, `PATIENT`).
   - Restrict slot generation and diagnostic center test mapping updates strictly to center admins.

2. **Automated Testing Suite with Jest**:
   - Write comprehensive unit tests and API integration tests using **Jest** and **Supertest**.
   - Add test coverage for concurrent booking race conditions and Redis lock expiration behaviors.

3. **Real-time WebSockets / Server-Sent Events (SSE)**:
   - Push real-time slot lock/unlock status updates to clients when another user holds or releases a slot.
