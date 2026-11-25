package com.ticketbooking.booking.dto;

public record StripeConfigResponse(
    String publishableKey,
    String currency
) {}
