---
name: diagnostic-booking-backend
description: Comprehensive guide, FastAPI architectural standards, state machine rules, idempotency patterns, and edge-case handling for building the Diagnostic Test Booking & Payment Backend Service in Python/FastAPI.
---

# Diagnostic Test Booking System - Engineering Skill Guide (FastAPI)

This skill guide establishes industry-grade practices, software patterns, and security guidelines for building a production-ready Diagnostic Test Booking Backend using **Python 3.11+**, **FastAPI**, **SQLAlchemy 2.0 (Async)**, **Pydantic v2**, **PostgreSQL**, and **Redis**.

---

## 1. Architectural Blueprint & Layered Design

The backend must follow a clean **Layered Architecture** with strict Separation of Concerns:

```
HTTP Request ➔ Endpoint (Router) ➔ Dependency Injection ➔ Service ➔ Repository ➔ SQLAlchemy DB / Redis
```

1. **Endpoints (`/app/endpoints`)**: FastAPI APIRouter handlers. Responsible for HTTP request parsing, response model serialization, status codes, and injecting services via `Depends()`.
2. **Schemas (`/app/schemas`)**: Pydantic v2 data models for request validation, query parameters, and response serialization.
3. **Services (`/app/services`)**: Business domain logic, booking state machine transitions, payment integration, and idempotency checks.
4. **Repositories (`/app/repositories`)**: Data access layer for executing async SQLAlchemy queries (`select`, `insert`, `update`) and transaction boundaries.
5. **Models (`/app/models`)**: SQLAlchemy 2.0 Declarative ORM models representing database tables and foreign key relationships.
6. **Core (`/app/core`)**: Cross-cutting concerns: JWT authentication (`security.py`), custom HTTP exceptions (`exceptions.py`), and FastAPI dependencies (`dependencies.py`).

---

## 2. Core Domain Requirements & Technical Specifications

### A. Authentication & Security
- **Password Hashing**: `passlib[bcrypt]` with strong salt.
- **JWT Auth**: `python-jose` or `PyJWT` for issuing and decoding Access Tokens with configurable `SECRET_KEY` and expiry.
- **Security Dependency**: FastAPI `OAuth2PasswordBearer` and `get_current_user` dependency injecting authenticated user context.
- **Input Validation**: Pydantic v2 schemas (`EmailStr`, `Field(min_length=...)`).

### B. Diagnostic Services & Providers Catalog
- **Providers**: Diagnostic centres with `id`, `name`, `location`, `created_at`.
- **Diagnostic Services**: Catalog items with `id`, `provider_id`, `name`, `description`, `price`.
- **Read APIs**: Public/authenticated endpoints to search, filter, and retrieve centres and tests. Redis caching for provider catalogs.

### C. Appointment Booking System & State Machine

#### Booking Entity Fields
`id`, `user_id`, `provider_id`, `service_id`, `appointment_datetime`, `amount`, `status`, `idempotency_key`, `created_at`, `updated_at`.

#### Booking Status State Machine
```
           ┌───────────────┐
           │    PENDING    │
           └───────┬───────┘
                   │
         ┌─────────┼─────────┐
         ▼         ▼         ▼
  ┌───────────┐ ┌────────┐ ┌───────────┐
  │ CONFIRMED │ │ FAILED │ │ CANCELLED │
  └───────────┘ └────────┘ └───────────┘
```

#### Allowed State Transitions Matrix
| Current State | Target State | Allowed? | Notes |
| :--- | :--- | :--- | :--- |
| `PENDING` | `CONFIRMED` | ✅ Yes | Webhook payment SUCCESS or instant payment success |
| `PENDING` | `FAILED` | ✅ Yes | Webhook payment FAILED or payment processing error |
| `PENDING` | `CANCELLED` | ✅ Yes | User explicit cancellation before payment completion |
| `CONFIRMED` | `CANCELLED` | ⚠️ Conditional | Refund policy check required (if implemented) |
| `CONFIRMED` | `FAILED` | ❌ No | Terminal state cannot regress |
| `FAILED` | `CONFIRMED` | ❌ No | Terminal state cannot switch without a new payment/booking |
| Any Terminal | `PENDING` | ❌ No | Impossible transition |

---

## 3. Payment Processing & Webhook Idempotency

### A. Simulated Payment Endpoint (`POST /payments/`)
- Accepts `appointment_id`, `payment_method`, optional `simulated_outcome` (`SUCCESS` | `FAILED`).
- Verifies appointment exists, belongs to authenticated user, and is currently in `PENDING` state.
- Simulates payment provider transaction, updates appointment status, and returns response.

### B. Idempotent Payment Webhook (`POST /payments/webhook/`)
Webhooks may be delivered multiple times by payment providers. **Idempotency is mandatory.**

#### Idempotency Protocol:
1. **Event Deduplication Check**:
   - Check if `event_id` exists in `webhook_events` table or Redis key `lock:webhook:<event_id>`.
   - If already processed, return `HTTP 200 OK` with `{ "status": "already_processed" }` immediately.
2. **Transactional Database Update**:
   - Open Async DB Session transaction (`async with session.begin():`).
   - Lock appointment record: `stmt = select(Appointment).where(Appointment.id == id).with_for_update()`.
   - If appointment state is already `CONFIRMED` or `FAILED`, ignore duplicate transition.
   - Update appointment status to `CONFIRMED` or `FAILED`.
   - Record `WebhookEvent` entry to guarantee deduplication.

---

## 4. Industry-Grade FastAPI Practices

### Security & Input Sanitization
- **Parameterized SQL**: Use SQLAlchemy ORM / Core expressions exclusively. Never use raw string interpolation.
- **CORS & Middleware**: Configure `CORSMiddleware` and `TrustedHostMiddleware`.
- **Rate Limiting**: Apply Redis-backed sliding window rate limiting for authentication and payment endpoints using `slowapi` or custom middleware.

### Error Handling & Response Format
- Standardized custom exception handlers in `app/core/exceptions.py`.
  ```json
  {
    "success": false,
    "error": {
      "code": "APPOINTMENT_ALREADY_CONFIRMED",
      "message": "This appointment has already been confirmed."
    }
  }
  ```

### Concurrency & Data Integrity
- **Database Row Locking**: Use `.with_for_update()` in SQLAlchemy select statements when modifying appointment statuses.
- **Numeric Precision**: Use `Numeric(10, 2)` or `Decimal` for currency amounts (`amount`, `price`).

### Observability & Testing
- **Structured JSON Logging**: Configure `structlog` or `loguru` with correlation IDs.
- **Automated Pytest Suite**:
  - `pytest-asyncio` with an isolated test database (PostgreSQL container or SQLite in-memory).
  - Integration tests for auth, appointment lifecycle, and idempotency logic.

---

## 5. Directory Structure Checklist

- [x] Structure recorded: `app/` (models, schemas, repositories, services, endpoints, core, utils), `tests/`, `migrations/` (Alembic).
- [ ] Database models and schemas defined once user provides schema specifications.
