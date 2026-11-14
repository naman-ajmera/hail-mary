# Auth Service

Spring Boot authentication and user management service.

## Requirements
- Java 21
- Maven 3.9+

## Run
```bash
mvn spring-boot:run
```

Service URL: `http://localhost:8085`

## Endpoints
- `POST /api/auth/register` — Register a new user
  ```json
  {
    "name": "Alice",
    "email": "alice@example.com",
    "password": "password123"
  }
  ```
- `POST /api/auth/login` — Log in and receive a JWT
  ```json
  {
    "email": "alice@example.com",
    "password": "password123"
  }
  ```
- `GET /api/auth/me` — Get current user info (requires `Authorization: Bearer <token>`)
- `GET /actuator/health` — Health check
