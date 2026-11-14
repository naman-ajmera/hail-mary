package com.ticketbooking.auth.dto;

public record AuthResponse(
        String token,
        String tokenType,
        String userId,
        String email,
        String name,
        String role
) {
}
