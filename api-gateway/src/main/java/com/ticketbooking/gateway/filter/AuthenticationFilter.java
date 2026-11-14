package com.ticketbooking.gateway.filter;

import com.ticketbooking.gateway.util.JwtUtils;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtils jwtUtils;

    public AuthenticationFilter(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

        if (isSecured(request)) {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            if (!jwtUtils.validateToken(token)) {
                return onError(exchange, "Unauthorized: Invalid or expired token", HttpStatus.UNAUTHORIZED);
            }

            String userId = jwtUtils.extractUserId(token);
            String email = jwtUtils.extractEmail(token);
            String role = jwtUtils.extractRole(token);

            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("X-User-Id", userId != null ? userId : "")
                    .header("X-User-Email", email != null ? email : "")
                    .header("X-User-Roles", role != null ? role : "")
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        }

        // For public endpoints: if token is present and valid, forward user headers
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtils.validateToken(token)) {
                String userId = jwtUtils.extractUserId(token);
                String email = jwtUtils.extractEmail(token);
                String role = jwtUtils.extractRole(token);

                ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                        .header("X-User-Id", userId != null ? userId : "")
                        .header("X-User-Email", email != null ? email : "")
                        .header("X-User-Roles", role != null ? role : "")
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            }
        }

        return chain.filter(exchange);
    }

    private boolean isSecured(ServerHttpRequest request) {
        String path = request.getPath().toString();
        HttpMethod method = request.getMethod();

        // Public endpoints
        if (path.startsWith("/api/auth") || path.startsWith("/actuator")) {
            return false;
        }

        // Public read-only catalogue endpoints
        if (method == HttpMethod.GET && (
                path.startsWith("/api/events") ||
                path.startsWith("/api/shows") ||
                path.startsWith("/api/search")
        )) {
            return false;
        }

        // All other routes require authentication (e.g. /api/bookings/**, POST /api/events/**)
        return true;
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        response.getHeaders().setContentType(MediaType.APPLICATION_JSON);
        byte[] bytes = String.format("{\"error\": \"%s\", \"status\": %d}", err, httpStatus.value())
                .getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }

    @Override
    public int getOrder() {
        return -1; // Execute before routing filters
    }
}
