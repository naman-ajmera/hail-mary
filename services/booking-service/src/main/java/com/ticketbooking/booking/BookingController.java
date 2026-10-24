package com.ticketbooking.booking;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {
    private final Map<String, Booking> data = new ConcurrentHashMap<>();

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking create(@Valid @RequestBody CreateRequest r) {
        var b = new Booking(UUID.randomUUID().toString(), r.eventId(), r.showId(), List.copyOf(r.seatIds()), "PENDING",
                Instant.now().toString());
        data.put(b.bookingId(), b);
        return b;
    }

    @GetMapping("/{id}")
    public Booking get(@PathVariable String id) {
        var b = data.get(id);
        if (b == null)
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found");
        return b;
    }

    public record CreateRequest(@NotBlank String eventId, @NotBlank String showId,
            @NotEmpty List<@NotBlank String> seatIds) {
    }

    public record Booking(String bookingId, String eventId, String showId, List<String> seatIds, String status,
            String createdAt) {
    }
}