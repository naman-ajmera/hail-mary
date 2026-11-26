/**
 * Seating and Booking Types matching backend Booking Service.
 */

export type SeatTier = 'VIP' | 'PREMIUM' | 'STANDARD'

export interface Seat {
  id: string // e.g. "A4"
  row: string // e.g. "A"
  number: number // e.g. 4
  tier: SeatTier
  price: number
  status: 'AVAILABLE' | 'SELECTED' | 'RESERVED'
}

export interface Showtime {
  id: string
  eventId: string
  venueId: string
  venueName: string
  city: string
  date: string // e.g. "2026-11-04"
  time: string // e.g. "17:30"
  screen: string // e.g. "Screen 2 (IMAX)"
  format: string // e.g. "IMAX 3D" or "Dolby Atmos"
  priceTiers: Record<SeatTier, number>
}

// Request payload matching BookingController CreateBookingRequest
export interface CreateBookingRequest {
  eventId: string
  showId: string
  seatIds: string[]
  totalAmount?: number
  currency?: string
}

export interface ConfirmBookingRequest {
  paymentMethod?: string
  paymentIntentId?: string
}

// Response matching BookingController BookingResponse
export interface BookingResponse {
  bookingId: string
  userId?: string
  eventId: string
  showId: string
  seatIds: string[]
  totalAmount?: number
  currency?: string
  status: string
  stripePaymentIntentId?: string
  stripeClientSecret?: string
  paymentMethod?: string
  publishableKey?: string
  createdAt: string
  updatedAt?: string
}

export interface StripeConfigResponse {
  publishableKey: string
  currency: string
}

export interface BookingOrderDraft {
  eventId: string
  eventTitle: string
  eventCategory: string
  posterUrl: string
  venueName: string
  city: string
  date: string
  time: string
  screen: string
  format: string
  seats: Seat[]
  subtotal: number
  convenienceFee: number
  total: number
}
