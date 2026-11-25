package com.ticketbooking.booking;

import com.ticketbooking.booking.dto.BookingResponse;
import com.ticketbooking.booking.dto.ConfirmBookingRequest;
import com.ticketbooking.booking.dto.CreateBookingRequest;
import com.ticketbooking.booking.dto.StripeConfigResponse;
import com.ticketbooking.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    /**
     * Creates a new booking in PENDING status and initializes a Stripe PaymentIntent.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @Valid @RequestBody CreateBookingRequest request) {
        return bookingService.createBooking(userId, request);
    }

    /**
     * Confirms an existing booking after successful Stripe payment execution.
     */
    @PostMapping("/{id}/confirm")
    public BookingResponse confirm(
            @PathVariable String id,
            @RequestBody(required = false) ConfirmBookingRequest request) {
        return bookingService.confirmBooking(id, request);
    }

    /**
     * Fetches details of a specific booking by ID.
     */
    @GetMapping("/{id}")
    public BookingResponse get(@PathVariable String id) {
        return bookingService.getBooking(id);
    }

    /**
     * Retrieves all bookings for the authenticated user passed via X-User-Id header.
     */
    @GetMapping
    public List<BookingResponse> list(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        return bookingService.getUserBookings(userId);
    }

    /**
     * Retrieves all unavailable/booked seat IDs for a given showtime
     * so that the frontend can disable and grey them out.
     */
    @GetMapping("/shows/{showId}/booked-seats")
    public List<String> getBookedSeats(@PathVariable String showId) {
        return bookingService.getBookedSeatsForShow(showId);
    }

    /**
     * Returns Stripe configuration metadata (publishable key & default currency)
     * so the frontend can dynamically initialize Stripe Elements.
     */
    @GetMapping("/config")
    public StripeConfigResponse getStripeConfig() {
        return new StripeConfigResponse(
                bookingService.getStripeService().getPublishableKey(),
                bookingService.getStripeService().getDefaultCurrency()
        );
    }
}
