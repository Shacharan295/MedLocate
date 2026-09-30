# MedLocate — MERN Stack Pharmacy Medicine Locator & Reservation System

MedLocate is a full-stack MERN (MongoDB, Express, React, Node.js) web application designed to help patients locate medicines across nearby pharmacies in real time, compare pricing and distance, inspect availability on an interactive Leaflet map, and place guaranteed, race-condition-protected holds for in-store pickup.

The system features:
- **Patients**: Progressive-radius medicine search, emergency availability mode, interactive geospatial map, atomic 30-minute reservation holds, status tracking, and in-app notifications.
- **Pharmacy Staff**: Store profile management, real-time inventory CRUD, low-stock threshold alerts, incoming reservation fulfillment, and POS batch synchronization API.
- **Platform Admins**: Verification oversight for pharmacies, user directory auditing, platform performance reports, and order volume metrics.

---

## Architecture Overview

```
                        [ Client Tier: React.js + Vite ]
         (Tailwind CSS, Leaflet Maps, Context API, Axios Interceptors)
                                      |
                                      | REST APIs / JSON (Bearer JWT)
                                      v
                      [ Application Tier: Node.js + Express ]
       (MVC Architecture, Auth/Role Middleware, Atomic Services, Node-Cron)
                                      |
                                      | Mongoose ODM / 2dsphere Queries
                                      v
                          [ Data Tier: MongoDB Atlas ]
   (Collections: Users, Pharmacies, Medicines, Inventory, Reservations, Notifications)
```

---

## Core Technical Features

### 1. Geospatial 2dsphere Proximity Search
Pharmacies store location using the GeoJSON `Point` format:
```json
{
  "type": "Point",
  "coordinates": [80.2337, 13.0418] // [longitude, latitude]
}
```
MongoDB's native `2dsphere` index executes high-performance `$geoNear` aggregation queries, sorting candidate pharmacies by exact spherical distance in meters and pruning unindexed candidates before inventory joins.

### 2. Progressive Search Radius & Emergency Search Mode
- **Progressive Radius Search**: Automatically expands search perimeter ($2\text{ km} \to 5\text{ km} \to 10\text{ km} \to 25\text{ km}$) until pharmacies with available stock are located.
- **Emergency Mode**: Scans up to 35 km immediately, prioritizing verified stores with highest stock and displaying verified healthcare facilities and emergency desks if no retail inventory exists.
- **Zero Hallucination Guarantee**: Fallbacks only display authentic database-verified medical stores.

### 3. Concurrency Protection & Zero Over-Booking
To prevent race conditions when multiple users attempt to reserve the last unit of a medicine (`stock: 1`), MedLocate executes single-document atomic operations:
```javascript
const inventory = await Inventory.findOneAndUpdate(
  { _id: inventoryId, quantity: { $gte: requestedQty } },
  { $inc: { quantity: -requestedQty } },
  { new: true }
);
if (!inventory) {
  return res.status(409).json({ message: "Insufficient stock available." });
}
```
If two requests arrive concurrently, WiredTiger locks the document. Exactly one update satisfies the `{ quantity: { $gte: qty } }` condition; the other returns `null` and yields an HTTP `409 Conflict`. Database stock never becomes negative.

### 4. Automated 30-Minute Hold Expiration & Inventory Recovery
- Reservations are created with `status: 'PENDING'` and an `expiresAt` timestamp (now + 30 minutes).
- A background `node-cron` worker queries pending expired reservations every 60 seconds.
- Expired reservations are updated to `'EXPIRED'`, and reserved quantities are atomically restored to public inventory via `$inc: { quantity: item.quantity }`.
- When patients cancel their reservation, stock is restored immediately.

### 5. Point of Sale (POS) Synchronization Pipeline
External pharmacy Point of Sale systems can synchronize stock in batch via `POST /api/inventory/sync`. Active holds are reconciled to prevent in-store sales from overriding online reservations.

---

## Demo Credentials (Pre-Seeded)

For rapid college project evaluations, one-click demo login buttons are available on the home page and login screen.

| Role | Email | Password | Pre-linked Entity |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@medlocate.demo` | `password123` | Rahul Sharma (Chennai) |
| **Pharmacy Staff** | `pharmacy@medlocate.demo` | `password123` | Apollo Pharmacy - T. Nagar |
| **Admin** | `admin@medlocate.demo` | `password123` | System Administrator |

---

## Tech Stack

- **Frontend**: React 18, Vite, React Router v6, Tailwind CSS, Leaflet & React-Leaflet, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js, Mongoose ODM, JSON Web Tokens (JWT), BcryptJS, Node-Cron, Nodemailer architecture.
- **Database**: MongoDB (Atlas-ready with embedded high-fidelity in-memory engine fallback for instant offline execution).

---

## Directory Structure

```
MedLocate/
├── client/
│   ├── src/
│   │   ├── components/       # StatusBadge, PharmacyMap, ReservationModal, etc.
│   │   ├── context/          # AuthContext, LocationContext, NotificationContext
│   │   ├── hooks/            # useAuth, useLocation, useNotifications
│   │   ├── pages/
│   │   │   ├── patient/      # Search, Pharmacies, Reservations, Dashboard
│   │   │   ├── pharmacy/     # Inventory, Reservations, Profile, Dashboard
│   │   │   ├── admin/        # Verifications, User Directory, Reports
│   │   │   ├── Home.jsx, Login.jsx, Register.jsx, PharmacyRegister.jsx
│   │   ├── services/         # Axios API service layer
│   │   ├── App.jsx           # RoleRoute & ProtectedRoute layout
│   │   ├── main.jsx          # Providers & entry point
│   │   └── index.css         # Tailwind & Leaflet styles
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/               # db.js (MongoDB Atlas & In-Memory fallback)
│   ├── controllers/          # auth, medicine, inventory, reservation, etc.
│   ├── middleware/           # authMiddleware, roleMiddleware, errorMiddleware
│   ├── models/               # User, Pharmacy, Medicine, Inventory, Reservation, Notification
│   ├── routes/               # Modular Express API routes
│   ├── scripts/              # seed.js (Chennai data), testConcurrency.js
│   ├── services/             # reservationService, notificationService, cronService
│   ├── utils/                # jwt.js
│   ├── app.js                # Express app & CORS
│   ├── server.js             # HTTP listener & cron initializers
│   ├── .env.example
│   └── package.json
│
├── .env.example
├── README.md
└── package.json
```

---

## Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on Node v24)
- **npm**: v9.0.0 or higher

### 1. Install All Dependencies
From the project root:
```bash
npm run install:all
```
*(Or navigate into `server` and `client` individually and run `npm install`)*

### 2. Configure Environment Variables
Copy `.env.example` in `server/`:
```bash
cp server/.env.example server/.env
```
Default `.env` configuration:
```env
PORT=5000
CLIENT_URL=http://localhost:5173
MONGO_URI=mongodb://127.0.0.1:27017/medlocate
USE_MEMORY_DB=true
JWT_SECRET=medlocate_super_secret_jwt_key_2026
JWT_EXPIRES_IN=7d
RESERVATION_EXPIRY_MINUTES=30
LOW_STOCK_THRESHOLD=10
```
> **Note**: Setting `USE_MEMORY_DB=true` enables MongoDB Memory Server, which provides a 100% real MongoDB engine (with real 2dsphere indexing and atomic operations) without requiring a locally installed MongoDB Windows service or external Atlas connection. If you have MongoDB Atlas, set `USE_MEMORY_DB=false` and provide your `MONGO_URI`.

---

## Running the Application

### Option A: Run Both Client & Server Concurrently (Recommended)
From the project root:
```bash
npm run dev
```

### Option B: Run Individually
**Terminal 1 (Backend Server):**
```bash
cd server
npm run dev
```
*Backend runs on `http://localhost:5000`*

**Terminal 2 (Frontend Client):**
```bash
cd client
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## Database Seeding

To seed Chennai pharmacies, sample medicines, inventory, and demo user accounts:
```bash
npm run seed
```
*(Or inside `server`: `node scripts/seed.js`)*

---

## Concurrency & Over-Booking Test

To verify atomic stock decrements and prove race condition immunity under concurrent load:
```bash
npm run test:concurrency
```
**Test Output Verification:**
```
====================================================
 STARTING CONCURRENCY & RACE CONDITION TEST
====================================================
[Setup] Created test inventory for "Azithromycin 500mg" with EXACTLY 1 unit in stock.
[Execution] Firing 2 SIMULTANEOUS reservation requests for 1 unit each...
----------------------------------------------------
 Results from Simultaneous Requests:
 Request 1: BLOCKED -> Reason: "Insufficient stock available" (Status Code: 409)
 Request 2: SUCCESS -> Reservation Code: MED-XXXXX
----------------------------------------------------
 Verification: Final Stock in MongoDB = 0
====================================================
 TEST PASSED: Zero Over-Booking! Concurrency protected.
 Exactly 1 request succeeded and exactly 1 request was rejected with 409 Conflict.
 Final stock did NOT become negative.
====================================================
```

---

## REST API Reference

### Authentication
- `POST /api/auth/register` — Register patient or pharmacy account
- `POST /api/auth/login` — Sign in and retrieve JWT Bearer token
- `GET /api/auth/me` — Retrieve active user session and linked pharmacy

### Medicine Catalog & Geospatial Search
- `GET /api/medicines/search` — Progressive radius search (`?medicine=paracetamol&latitude=13.08&longitude=80.27&radius=10&emergency=false`)
- `GET /api/medicines` — Catalog lookup
- `GET /api/medicines/:id` — Medicine details
- `POST /api/medicines` — Add medicine to catalog (Admin/Pharmacy)

### Inventory Management
- `GET /api/inventory` — View pharmacy stock (`?lowStock=true`)
- `POST /api/inventory` — Add item to store stock
- `PUT /api/inventory/:id` — Modify stock count or price
- `DELETE /api/inventory/:id` — Remove stock record
- `POST /api/inventory/sync` — POS batch inventory reconciliation

### Reservations & Holds
- `POST /api/reservations` — Atomically hold medicine (`{ inventoryId, quantity }`)
- `GET /api/reservations` — Retrieve user/pharmacy reservation orders
- `GET /api/reservations/:id` — Order details
- `PATCH /api/reservations/:id` — Update status (`CONFIRMED`, `PICKED_UP`, `CANCELLED`)

### Pharmacies & Directory
- `GET /api/pharmacies/nearby` — Proximity locator using 2dsphere index
- `GET /api/pharmacies` — Pharmacy directory
- `PATCH /api/pharmacies/:id/verification` — Admin verification toggle
- `PUT /api/pharmacies/:id` — Update store details & coordinates

### Notifications & Alerts
- `GET /api/notifications` — Fetch user alerts and unread count
- `PATCH /api/notifications/:id/read` — Mark notification read
- `PATCH /api/notifications/read-all` — Mark all read

### Admin Oversight
- `GET /api/admin/users` — User directory with role filtering
- `GET /api/admin/pharmacies` — Store verifications dashboard
- `GET /api/admin/reports` — Operational analytics and fulfillment metrics

---

## Validation & College Project Demonstration Flow

1. **Patient Flow**:
   - Navigate to `http://localhost:5173/`
   - Use "One-Click Demo Login" as **Patient**
   - Click **Find Medicine**, search `"Paracetamol"`
   - Watch progressive radius expansion (`2km -> 5km -> 10km`)
   - Click a pharmacy on the list or on the Leaflet map
   - Click **Reserve for Pickup**
   - Select quantity, confirm the 30-minute hold
   - Receive pickup code (e.g. `MED-XXXXX`)
   - View updated reservation on **My Reservations**

2. **Pharmacy Flow**:
   - Log out and log in as **Pharmacy** (`pharmacy@medlocate.demo`)
   - See the incoming reservation appear under **Incoming Reservations**
   - Click **Confirm Hold** (transitions to `CONFIRMED`)
   - Click **Mark Picked Up** when patient arrives (transitions to `PICKED_UP`)
   - Navigate to **Inventory Management**, click **Sync POS Feed** to simulate automated batch POS inventory update

3. **Admin Flow**:
   - Log out and log in as **Admin** (`admin@medlocate.demo`)
   - Review **System Administration & Platform Reports**
   - Navigate to **Pharmacy Verifications**
   - Review pending dispensaries (e.g., Suburban Meds Velachery) and click **Approve Pharmacy**
   - Verify that the pharmacy now displays the green verified badge

---

## License
MIT License. Built for healthcare technology educational demonstration.
