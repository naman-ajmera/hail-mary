package com.ticketbooking.booking.dto;

public record ConfirmBookingRequest(
    String paymentMethod,
    String paymentIntentId
) {}
