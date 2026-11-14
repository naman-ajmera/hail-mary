export interface User {
  id: string
  name: string
  email: string
  phone?: string
}

export interface SavedBooking {
  bookingId: string
  eventId: string
  eventTitle: string
  eventCategory: string
  posterUrl: string
  venueName: string
  city: string
  date: string
  time: string
  screen: string
  seatIds: string[]
  totalAmount: number
  status: string
  createdAt: string
  paymentMethod: string
}

