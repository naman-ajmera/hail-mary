package com.ticketbooking.auth.dto;

import com.ticketbooking.auth.entity.User;

public record UserDto(
        String id,
        String email,
        String name,
        String role
) {
    public static UserDto fromEntity(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getName(), user.getRole());
    }
}
