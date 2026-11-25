package com.ticketbooking.booking.dto;

import java.math.BigDecimal;
import java.util.List;

public record BookingResponse(
    String bookingId,
    String userId,
    String eventId,
    String showId,
    List<String> seatIds,
    BigDecimal totalAmount,
    String currency,
    String status,
    String stripePaymentIntentId,
    String stripeClientSecret,
    String paymentMethod,
    String publishableKey,
    String createdAt,
    String updatedAt
) {}
