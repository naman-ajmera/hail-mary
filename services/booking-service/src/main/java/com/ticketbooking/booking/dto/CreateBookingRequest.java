package com.ticketbooking.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.math.BigDecimal;
import java.util.List;

public record CreateBookingRequest(
    @NotBlank(message = "eventId is required")
    String eventId,

    @NotBlank(message = "showId is required")
    String showId,

    @NotEmpty(message = "seatIds cannot be empty")
    List<@NotBlank String> seatIds,

    BigDecimal totalAmount,

    String currency
) {}
