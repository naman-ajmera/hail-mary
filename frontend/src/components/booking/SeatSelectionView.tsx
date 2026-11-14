import { useState, useMemo } from 'react'
import type { EventItem } from '../../types/api'
import type { Showtime, Seat, BookingResponse } from '../../types/booking'
import type { User } from '../../types/user'
import { generateSeatMatrix } from '../../data/showtimesData'
import { createBooking } from '../../services/bookingService'
import { SeatMatrix } from './SeatMatrix'
import { BookingSummaryPanel } from './BookingSummaryPanel'
import { PaymentModal } from '../checkout/PaymentModal'
import { MapPinIcon, CalendarIcon, ChevronDownIcon } from '../common/Icons'

interface SeatSelectionViewProps {
  event: EventItem
  showtime: Showtime
  currentUser: User | null
  onBackToDetails: () => void
  onBookingSuccess: (booking: BookingResponse, selectedSeats: Seat[], paymentMethod: string) => void
}

export function SeatSelectionView({
  event,
  showtime,
  currentUser,
  onBackToDetails,
  onBookingSuccess,
}: SeatSelectionViewProps) {
  // Generate seats for this auditorium
  const initialSeats = useMemo(() => generateSeatMatrix(showtime), [showtime])
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)

  const maxAllowedSeats = 6

  // Toggle seat selection
  const handleToggleSeat = (seat: Seat) => {
    setBookingError(null)
    setWarningMessage(null)

    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds((prev) => prev.filter((id) => id !== seat.id))
    } else {
      if (selectedSeatIds.length >= maxAllowedSeats) {
        setWarningMessage(`You can book a maximum of ${maxAllowedSeats} tickets per transaction.`)
        return
      }
      setSelectedSeatIds((prev) => [...prev, seat.id])
    }
  }

  const handleRemoveSeat = (seatId: string) => {
    setSelectedSeatIds((prev) => prev.filter((id) => id !== seatId))
  }

  // Selected seat objects
  const selectedSeats = useMemo(() => {
    const seatMap = new Map(initialSeats.map((s) => [s.id, s]))
    return selectedSeatIds.map((id) => seatMap.get(id)!).filter(Boolean)
  }, [initialSeats, selectedSeatIds])

  // Open payment dialog
  const handleProceedToPayment = () => {
    if (selectedSeatIds.length === 0) return
    setIsPaymentModalOpen(true)
  }

  // Submit to Spring Boot booking-service (POST /api/bookings)
  const handleExecutePaymentAndBooking = async (paymentMethod: string) => {
    setIsSubmitting(true)
    setBookingError(null)

    try {
      const response = await createBooking({
        eventId: String(event.id),
        showId: showtime.id,
        seatIds: selectedSeatIds,
      })

      setIsPaymentModalOpen(false)
      onBookingSuccess(response, selectedSeats, paymentMethod)
    } catch (err: unknown) {
      console.warn('Booking creation failed via API Gateway:', err)
      const msg = err instanceof Error ? err.message : 'Unknown booking error'
      setBookingError(
        `Failed to complete booking with Booking Service (:8082): ${msg}. Check that booking-service is active.`
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="hm-seat-selection-page">
      {/* Top Showtime Bar */}
      <div className="hm-seat-topbar">
        <div className="hm-container hm-seat-topbar__inner">
          <div className="hm-seat-topbar__info">
            <h2 className="hm-seat-topbar__title">{event.title}</h2>
            <div className="hm-seat-topbar__meta">
              <span>
                <MapPinIcon width={14} height={14} /> {showtime.venueName}
              </span>
              <span>•</span>
              <span>{showtime.screen}</span>
              <span>•</span>
              <span>
                <CalendarIcon width={14} height={14} /> {showtime.date} at {showtime.time}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="hm-button hm-button--secondary hm-button--small"
            onClick={onBackToDetails}
          >
            <span>Change Showtime</span>
            <ChevronDownIcon width={14} height={14} style={{ transform: 'rotate(90deg)' }} />
          </button>
        </div>
      </div>

      {warningMessage && (
        <div className="hm-container" style={{ marginTop: '1rem' }}>
          <div className="hm-toast-warning">
            ⚠️ {warningMessage}
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="hm-container hm-seat-layout">
        <div className="hm-seat-layout__matrix">
          <SeatMatrix
            seats={initialSeats}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={handleToggleSeat}
            maxSeats={maxAllowedSeats}
          />
        </div>

        <div className="hm-seat-layout__summary">
          <BookingSummaryPanel
            event={event}
            showtime={showtime}
            selectedSeats={selectedSeats}
            onRemoveSeat={handleRemoveSeat}
            onConfirmBooking={handleProceedToPayment}
            isSubmitting={isSubmitting}
            error={bookingError}
          />
        </div>
      </div>

      {/* Checkout / Payment Modal Step */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        event={event}
        showtime={showtime}
        selectedSeats={selectedSeats}
        currentUser={currentUser}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirmPayment={handleExecutePaymentAndBooking}
        isProcessing={isSubmitting}
        error={bookingError}
      />
    </div>
  )
}
