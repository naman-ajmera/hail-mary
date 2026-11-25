package com.ticketbooking.booking.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
public class BookingEntity {

    @Id
    @Column(name = "booking_id", nullable = false, updatable = false)
    private String bookingId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "show_id", nullable = false)
    private String showId;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "booking_seats", joinColumns = @JoinColumn(name = "booking_id"))
    @Column(name = "seat_id")
    private List<String> seatIds = new ArrayList<>();

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "currency", nullable = false)
    private String currency;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "stripe_payment_intent_id")
    private String stripePaymentIntentId;

    @Column(name = "stripe_client_secret")
    private String stripeClientSecret;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "created_at", nullable = false)
    private String createdAt;

    @Column(name = "updated_at")
    private String updatedAt;

    public BookingEntity() {}

    public BookingEntity(String bookingId, String userId, String eventId, String showId, List<String> seatIds,
                         BigDecimal totalAmount, String currency, String status, String stripePaymentIntentId,
                         String stripeClientSecret, String paymentMethod, String createdAt, String updatedAt) {
        this.bookingId = bookingId;
        this.userId = userId;
        this.eventId = eventId;
        this.showId = showId;
        this.seatIds = seatIds != null ? new ArrayList<>(seatIds) : new ArrayList<>();
        this.totalAmount = totalAmount;
        this.currency = currency;
        this.status = status;
        this.stripePaymentIntentId = stripePaymentIntentId;
        this.stripeClientSecret = stripeClientSecret;
        this.paymentMethod = paymentMethod;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public String getBookingId() { return bookingId; }
    public void setBookingId(String bookingId) { this.bookingId = bookingId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getShowId() { return showId; }
    public void setShowId(String showId) { this.showId = showId; }

    public List<String> getSeatIds() { return seatIds; }
    public void setSeatIds(List<String> seatIds) {
        this.seatIds = seatIds != null ? new ArrayList<>(seatIds) : new ArrayList<>();
    }

    public BigDecimal getTotalAmount() { return totalAmount; }
    public void setTotalAmount(BigDecimal totalAmount) { this.totalAmount = totalAmount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getStripePaymentIntentId() { return stripePaymentIntentId; }
    public void setStripePaymentIntentId(String stripePaymentIntentId) { this.stripePaymentIntentId = stripePaymentIntentId; }

    public String getStripeClientSecret() { return stripeClientSecret; }
    public void setStripeClientSecret(String stripeClientSecret) { this.stripeClientSecret = stripeClientSecret; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
