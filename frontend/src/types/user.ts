export interface User {
  id: string
  name: string
  email: string
  role?: string
  phone?: string
}

export interface AuthResponse {
  token: string
  tokenType: string
  userId: string
  email: string
  name: string
  role: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
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
