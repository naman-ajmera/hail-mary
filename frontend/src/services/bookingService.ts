import { request } from './apiClient'
import type { CreateBookingRequest, BookingResponse } from '../types/booking'

/**
 * Service to communicate with the Spring Boot Booking Service (:8082) via API Gateway (:8080).
 */

/**
 * Creates a booking by submitting selected seats to POST /api/bookings.
 */
export async function createBooking(payload: CreateBookingRequest): Promise<BookingResponse> {
  return await request<BookingResponse>('/api/bookings', {
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

