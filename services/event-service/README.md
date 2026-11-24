# Event Service

Spring Boot event catalogue service backed by Spring Data JPA and an in-memory H2 database.

## Requirements
- Java 21
- Maven 3.9+

## Run
```bash
mvn spring-boot:run
```

Service URL: `http://localhost:8081`

## Endpoints
- `GET /api/events` — Retrieve all events (supports `?city=Dublin` and `?category=MOVIE` query filters)
- `GET /api/events/{id}` — Retrieve event details by ID
- `GET /actuator/health` — Health check

Test via API Gateway (:8080):
```bash
curl http://localhost:8080/api/events
curl "http://localhost:8080/api/events?city=Dublin&category=MOVIE"
curl http://localhost:8080/api/events/1
```

## Data Seeding & Images
- On startup, `DataInitializer` seeds 5 standard events into H2:
  - `1`: Interstellar: The Horizon Premiere (Movie, Dublin)
  - `2`: Dublin Neon Beats Live 2026 (Concert, Dublin)
  - `movie-001`: The Example Movie: Echoes (Movie, Dublin)
  - `concert-001`: Live Music Night: Acoustic Sessions (Concert, Dublin)
  - `movie-002`: The Space Adventure: Odyssey Cork (Movie, Cork)
- Image assets use high-resolution Unsplash images stored directly in the event records.
