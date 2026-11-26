# Hail Mary — Frontend Application

Online movie and live event ticketing web application built with **React 19**, **TypeScript**, and **Vite**, integrating with a Spring Boot Java microservices backend orchestrated by Spring Cloud API Gateway.

Part of the **MSc Software Engineering** project.

---

## 🏗️ Architecture & Network Ports

```
[ Frontend (React 19 + TypeScript) ] :5173
                │
                │ (Vite Proxy: /api/*)
                ▼
[ Spring Cloud API Gateway ]         :8080
   ├── /api/events/**, /api/shows/** ──▶ [ Event Service ]   :8081
   ├── /api/bookings/**              ──▶ [ Booking Service ] :8082
   ├── /api/payments/**              ──▶ [ Payment Service ] :8083
   └── /api/search/**                ──▶ [ Search Service ]  :8084
```

---

## 🌟 Implemented Features

1. **Homepage & Entertainment Discovery**:
   - Featured Hero carousel with spotlight movies and live concerts.
   - Categorized shelves (*Now Showing in Theatres*, *Live Events & Concerts*).
   - Live integration with `GET /api/events`.
2. **City Filtering & Search**:
   - Location selector for Irish cities (*Dublin, Cork, Galway, Limerick*).
   - Real-time search query connection to `GET /api/search?q={query}&city={city}&category={category}`.
3. **Movie & Event Details**:
   - Full backdrop hero, trailer previews, synopsis, ratings, runtime, and experience formats (IMAX 3D, Dolby Atmos, 4DX).
4. **Calendar Date & Showtime Selection**:
   - 7-day date selector strip (*Today*, *Tomorrow*, etc.).
   - Cinema and arena venue groupings (Cineworld, ODEON, Omniplex, The Gate Cinema) with clickable showtimes.
5. **Interactive BookMyShow-Style Auditorium Seat Matrix**:
   - Illuminated screen arc (*"ALL EYES THIS WAY — SCREEN"*).
   - Tiered seating: **VIP Recliners**, **Premium Circle**, and **Standard Classic**.
   - Interactive seat states (Available, Selected, Reserved), center aisle separation, and max 6 tickets limit.
6. **Booking Summary & Reservation Countdown**:
   - Real-time price breakdown (ticket subtotal + convenience fees = grand total).
   - 10-minute hold reservation timer (`10:00` countdown).
7. **Checkout & Payment Step**:
   - Payment method selector: Stripe.
   - Prepared for future payment microservice integration.
8. **Real Backend Booking Dispatch**:
   - Submits `{ eventId, showId, seatIds }` directly to `POST /api/bookings` in `booking-service`.
9. **Digital Boarding-Pass E-Ticket**:
   - Confirmed ticket pass showing real UUID reference, barcode representation, status badge (`PENDING`), and print ticket trigger.
10. **Authentication & User Profile**:
    - Sign In / Registration modal with **1-Click Demo Login** for academic evaluation (`alex.murphy@university.ie`).
    - User avatar and session persistence in `localStorage`.
11. **My Bookings Dashboard**:
    - Accessible from the navigation bar to inspect past and upcoming booking passes anytime.

---

## 🚀 Running the Frontend

### Prerequisites
* Node.js (v18+)
* npm (v9+)

### Installation & Development
```bash
cd frontend
npm install
npm run dev
```

The application will be running at **`http://localhost:5173`**.

### Production Build & Linting
```bash
npm run lint    # Runs ESLint checks
npm run build   # Validates TypeScript & compiles bundle to /dist
```
