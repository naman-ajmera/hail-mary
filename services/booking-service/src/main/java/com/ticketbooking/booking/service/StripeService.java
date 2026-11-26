package com.ticketbooking.booking.service;

import com.stripe.Stripe;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class StripeService {

    private static final Logger log = LoggerFactory.getLogger(StripeService.class);

    private final String secretKey;
    private final String publishableKey;
    private final String defaultCurrency;

    public StripeService(
            @Value("${stripe.secret-key:sk_test_placeholder_hail_mary}") String secretKey,
            @Value("${stripe.publishable-key:pk_test_placeholder_hail_mary}") String publishableKey,
            @Value("${stripe.currency:eur}") String defaultCurrency) {
        this.secretKey = secretKey;
        this.publishableKey = publishableKey;
        this.defaultCurrency = defaultCurrency != null ? defaultCurrency.toLowerCase() : "eur";

        if (isRealStripeKey(secretKey)) {
            Stripe.apiKey = secretKey;
            log.info("Stripe API initialized with secret key ({}...)", secretKey.substring(0, Math.min(12, secretKey.length())));
        } else {
            log.warn("Stripe secret key is using placeholder/test mock mode. Realistic mock payment intents will be generated.");
        }
    }

    public record PaymentIntentResult(String paymentIntentId, String clientSecret) {}

    public PaymentIntentResult createPaymentIntent(BigDecimal amount, String currency, String bookingId, String description) {
        String curr = (currency != null && !currency.isBlank()) ? currency.toLowerCase() : defaultCurrency;
        long amountInCents = amount.multiply(BigDecimal.valueOf(100)).longValue();
        if (amountInCents < 50) {
            amountInCents = 50; // Stripe minimum is 50 cents
        }

        if (isRealStripeKey(secretKey)) {
            try {
                PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                        .setAmount(amountInCents)
                        .setCurrency(curr)
                        .setDescription(description != null ? description : "Hail Mary Ticket Booking #" + bookingId)
                        .putMetadata("bookingId", bookingId)
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods.builder().setEnabled(true).build()
                        )
                        .build();

                PaymentIntent intent = PaymentIntent.create(params);
                log.info("Successfully created Stripe PaymentIntent id={} for bookingId={}", intent.getId(), bookingId);
                return new PaymentIntentResult(intent.getId(), intent.getClientSecret());
            } catch (Exception e) {
                log.error("Stripe PaymentIntent creation failed with error: {}. Falling back to test mock intent.", e.getMessage());
            }
        }

        // Mock test fallback for instant local testing
        String mockId = "pi_test_" + UUID.randomUUID().toString().replace("-", "");
        String mockSecret = mockId + "_secret_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        return new PaymentIntentResult(mockId, mockSecret);
    }

    public boolean isRealStripeKeyConfigured() {
        return isRealStripeKey(secretKey);
    }

    public String getPublishableKey() {
        return publishableKey;
    }

    public String getDefaultCurrency() {
        return defaultCurrency;
    }

    private static boolean isRealStripeKey(String key) {
        return key != null && (key.startsWith("sk_test_") || key.startsWith("sk_live_")) && !key.contains("placeholder");
    }
}
