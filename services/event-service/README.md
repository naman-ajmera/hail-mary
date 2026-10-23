# Event Service

Spring Boot event catalogue service.

## Requirements
- Java 21
- Maven 3.9+ (or add Maven Wrapper)

## Run
```bash
mvn spring-boot:run
```

Service URL: `http://localhost:8081`

## Endpoints
- `GET /api/events` — temporary hard-coded sample response
- `GET /actuator/health` — health check

Test:
```bash
curl http://localhost:8081/api/events
curl http://localhost:8081/actuator/health
```

If the API Gateway is running and configured, test through it:
```bash
curl http://localhost:8080/api/events
```

JPA, PostgreSQL and Flyway dependencies are included for the next step, but the current endpoint uses sample data. Flyway is disabled until a migration is added; Hibernate schema generation is set to `validate`.
