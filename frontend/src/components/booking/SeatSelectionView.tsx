import { useState, useMemo, useEffect, useCallback } from 'react'
import type { EventItem } from '../../types/api'
import type { Showtime, Seat, BookingResponse } from '../../types/booking'
import type { User } from '../../types/user'
import { generateSeatMatrix } from '../../data/showtimesData'
import { getBookedSeats } from '../../services/bookingService'
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
  onOpenAuthModal?: () => void
}

export function SeatSelectionView({
  event,
  showtime,
  currentUser,
  onBackToDetails,
  onBookingSuccess,
  onOpenAuthModal,
}: SeatSelectionViewProps) {
  // Generate base seats for this auditorium
  const rawSeats = useMemo(() => generateSeatMatrix(showtime), [showtime])

  // Seats with booked status merged in from backend
  const [seats, setSeats] = useState<Seat[]>(rawSeats)
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [warningMessage, setWarningMessage] = useState<string | null>(null)

  // Fetch booked seats from backend and mark them as RESERVED
  const fetchAndMergeBookedSeats = useCallback(async () => {
    try {
      const bookedSeatIds = await getBookedSeats(showtime.id)
      const bookedSet = new Set(bookedSeatIds)
      setSeats(rawSeats.map((seat) =>
        bookedSet.has(seat.id) ? { ...seat, status: 'RESERVED' as const } : seat
      ))
      // Also deselect any seat that became booked
      setSelectedSeatIds((prev) => prev.filter((id) => !bookedSet.has(id)))
    } catch {
      // If backend unavailable, just use the raw generated seats
      setSeats(rawSeats)
    }
  }, [showtime.id, rawSeats])

  useEffect(() => {
    fetchAndMergeBookedSeats()
  }, [fetchAndMergeBookedSeats])

  const maxAllowedSeats = 6

  // Toggle seat selection
  const handleToggleSeat = (seat: Seat) => {
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
    const seatMap = new Map(seats.map((s) => [s.id, s]))
    return selectedSeatIds.map((id) => seatMap.get(id)!).filter(Boolean)
  }, [seats, selectedSeatIds])

  // Open payment dialog
  const handleProceedToPayment = () => {
    if (selectedSeatIds.length === 0) return
    if (!currentUser) {
      setWarningMessage('Please sign in to proceed with your booking reservation.')
      if (onOpenAuthModal) {
        onOpenAuthModal()
      }
      return
    }
    setIsPaymentModalOpen(true)
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
            seats={seats}
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
            isSubmitting={false}
            error={null}
          />
        </div>
      </div>

      {/* Checkout / Stripe Payment Modal Step */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        event={event}
        showtime={showtime}
        selectedSeats={selectedSeats}
        currentUser={currentUser}
        onClose={() => setIsPaymentModalOpen(false)}
        onBookingSuccess={(booking, seats, paymentMethod) => {
          setIsPaymentModalOpen(false)
          onBookingSuccess(booking, seats, paymentMethod)
        }}
      />
    </div>
  )
}
