package com.ticketbooking.booking.service;

import com.ticketbooking.booking.dto.BookingResponse;
import com.ticketbooking.booking.dto.ConfirmBookingRequest;
import com.ticketbooking.booking.dto.CreateBookingRequest;
import com.ticketbooking.booking.entity.BookingEntity;
import com.ticketbooking.booking.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

@Service
public class BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingService.class);

    private final BookingRepository bookingRepository;
    private final StripeService stripeService;

    public BookingService(BookingRepository bookingRepository, StripeService stripeService) {
        this.bookingRepository = bookingRepository;
        this.stripeService = stripeService;
    }

    @Transactional
    public BookingResponse createBooking(String userId, CreateBookingRequest request) {
        // Check for seat conflicts with already CONFIRMED bookings for this show
        List<BookingEntity> existingConfirmed = bookingRepository.findByShowIdAndStatus(request.showId(), "CONFIRMED");
        Set<String> takenSeats = new HashSet<>();
        for (BookingEntity b : existingConfirmed) {
            takenSeats.addAll(b.getSeatIds());
        }

        for (String requestedSeat : request.seatIds()) {
            if (takenSeats.contains(requestedSeat)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Seat " + requestedSeat + " is already booked for this showtime.");
            }
        }

        String bookingId = UUID.randomUUID().toString();
        String currency = (request.currency() != null && !request.currency().isBlank())
                ? request.currency().toLowerCase()
                : stripeService.getDefaultCurrency();

        BigDecimal amount = request.totalAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            // Default calculation: €12.50 per seat + €1.50 fee
            amount = BigDecimal.valueOf(request.seatIds().size())
                    .multiply(BigDecimal.valueOf(12.50))
                    .add(BigDecimal.valueOf(1.50 * request.seatIds().size()));
        }

        // Create Stripe PaymentIntent
        StripeService.PaymentIntentResult intentResult = stripeService.createPaymentIntent(
                amount,
                currency,
                bookingId,
                "Tickets for event " + request.eventId() + ", show " + request.showId()
        );

        String now = Instant.now().toString();
        BookingEntity entity = new BookingEntity(
                bookingId,
                userId,
                request.eventId(),
                request.showId(),
                request.seatIds(),
                amount,
                currency,
                "PENDING",
                intentResult.paymentIntentId(),
                intentResult.clientSecret(),
                null,
                now,
                null
        );

        BookingEntity saved = bookingRepository.save(entity);
        log.info("Created PENDING booking id={} with paymentIntent={}", bookingId, intentResult.paymentIntentId());

        return mapToResponse(saved);
    }

    @Transactional
    public BookingResponse confirmBooking(String bookingId, ConfirmBookingRequest request) {
        BookingEntity entity = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found with id: " + bookingId));

        if ("CONFIRMED".equalsIgnoreCase(entity.getStatus())) {
            log.info("Booking id={} is already CONFIRMED", bookingId);
            return mapToResponse(entity);
        }

        entity.setStatus("CONFIRMED");
        entity.setPaymentMethod(request != null && request.paymentMethod() != null
                ? request.paymentMethod()
                : "Stripe Card Payment");
        entity.setUpdatedAt(Instant.now().toString());

        BookingEntity updated = bookingRepository.save(entity);
        log.info("Booking id={} confirmed successfully via {}", bookingId, entity.getPaymentMethod());

        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public BookingResponse getBooking(String bookingId) {
        return bookingRepository.findById(bookingId)
                .map(this::mapToResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found with id: " + bookingId));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(String userId) {
        if (userId == null || userId.isBlank()) {
            return Collections.emptyList();
        }
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<String> getBookedSeatsForShow(String showId) {
        if (showId == null || showId.isBlank()) {
            return Collections.emptyList();
        }
        List<BookingEntity> bookings = bookingRepository.findByShowId(showId);
        Set<String> bookedSeats = new LinkedHashSet<>();
        for (BookingEntity b : bookings) {
            // Count seats as unavailable if booking is CONFIRMED or PENDING (active in checkout)
            if (!"CANCELLED".equalsIgnoreCase(b.getStatus()) && !"FAILED".equalsIgnoreCase(b.getStatus())) {
                if (b.getSeatIds() != null) {
                    bookedSeats.addAll(b.getSeatIds());
                }
            }
        }
        return new ArrayList<>(bookedSeats);
    }

    public StripeService getStripeService() {
        return stripeService;
    }

    private BookingResponse mapToResponse(BookingEntity entity) {
        return new BookingResponse(
                entity.getBookingId(),
                entity.getUserId(),
                entity.getEventId(),
                entity.getShowId(),
                entity.getSeatIds(),
                entity.getTotalAmount(),
                entity.getCurrency(),
                entity.getStatus(),
                entity.getStripePaymentIntentId(),
                entity.getStripeClientSecret(),
                entity.getPaymentMethod(),
                stripeService.getPublishableKey(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
