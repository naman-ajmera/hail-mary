import { request } from './apiClient'
import type {
  CreateBookingRequest,
  ConfirmBookingRequest,
  BookingResponse,
  StripeConfigResponse,
} from '../types/booking'

/**
 * Service to communicate with the Spring Boot Booking Service (:8082) via API Gateway (:8080).
 */

/**
 * Creates a booking by submitting selected seats to POST /api/bookings.
 * Initializes a Stripe PaymentIntent and returns the client secret.
 */
export async function createBooking(payload: CreateBookingRequest): Promise<BookingResponse> {
  return await request<BookingResponse>('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Confirms an existing booking after payment authorization via POST /api/bookings/{id}/confirm.
 */
export async function confirmBooking(
  bookingId: string,
  payload: ConfirmBookingRequest
): Promise<BookingResponse> {
  return await request<BookingResponse>(`/api/bookings/${encodeURIComponent(bookingId)}/confirm`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Retrieves an existing booking by its UUID from GET /api/bookings/{id}.
 */
export async function getBookingById(bookingId: string): Promise<BookingResponse> {
  return await request<BookingResponse>(`/api/bookings/${encodeURIComponent(bookingId)}`)
}

/**
 * Retrieves all bookings for the authenticated user from GET /api/bookings.
 */
export async function getUserBookings(): Promise<BookingResponse[]> {
  return await request<BookingResponse[]>('/api/bookings')
}

/**
 * Retrieves the Stripe publishable key and currency config from GET /api/bookings/config.
 */
export async function getStripeConfig(): Promise<StripeConfigResponse> {
  return await request<StripeConfigResponse>('/api/bookings/config')
}

/**
 * Retrieves the list of already-booked seat IDs for a given showtime
 * from GET /api/bookings/shows/{showId}/booked-seats.
 */
export async function getBookedSeats(showId: string): Promise<string[]> {
  return await request<string[]>(`/api/bookings/shows/${encodeURIComponent(showId)}/booked-seats`)
}
