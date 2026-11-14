# API Gateway

Spring Boot 3.5.7 + Spring Cloud 2025.0.0 (Gateway Server WebFlux), Java 21.

## Start

```bash
cd api-gateway
mvn spring-boot:run
```

## Verify

```bash
curl http://localhost:8080/actuator/health
```

Expected: `{ "status": "UP" }` (JSON formatting may vary).

Requests to `/api/auth/**` forward to port 8085, `/api/events/**` and `/api/shows/**` to 8081, `/api/bookings/**` to 8082, `/api/payments/**` to 8083, and `/api/search/**` to 8084. Until a target service starts, requests to its route will fail (typically 5xx); this is expected.

Authentication:
- Gateway applies `AuthenticationFilter` to validate JWT bearer tokens.
- Public endpoints: `/api/auth/**`, `GET /api/events/**`, `GET /api/search/**`, `/actuator/**`.
- Protected endpoints (such as `POST /api/bookings/**`) require a valid `Authorization: Bearer <token>` header.
- Upon successful validation, the gateway injects `X-User-Id`, `X-User-Email`, and `X-User-Roles` headers for downstream services.

The gateway preserves paths. For example, the Event Service should expose `GET /api/events`.

Override upstream addresses using `AUTH_SERVICE_URL`, `EVENT_SERVICE_URL`, `BOOKING_SERVICE_URL`, `PAYMENT_SERVICE_URL`, `SEARCH_SERVICE_URL`.

For local React development, configure the Vite `/api` proxy to `http://localhost:8080`; this avoids browser CORS configuration. Do not add a second CORS policy unless needed.

This setup uses direct routing, not service discovery or instance load balancing. Add authentication, rate limiting, observability and Stripe webhook signature verification before production use. Stripe webhook verification belongs in the Payment Service and requires the original request body.
