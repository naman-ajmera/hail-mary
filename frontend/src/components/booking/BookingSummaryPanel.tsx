import type { EventItem } from '../../types/api'
import type { Showtime, Seat } from '../../types/booking'
import { useCountdown } from '../../hooks/useCountdown'
import { ClockIcon, TicketIcon, XIcon } from '../common/Icons'

interface BookingSummaryPanelProps {
  event: EventItem
  showtime: Showtime
  selectedSeats: Seat[]
  onRemoveSeat: (seatId: string) => void
  onConfirmBooking: () => void
  isSubmitting: boolean
  error: string | null
}

export function BookingSummaryPanel({
  event,
  showtime,
  selectedSeats,
  onRemoveSeat,
  onConfirmBooking,
  isSubmitting,
  error,
}: BookingSummaryPanelProps) {
  const { formattedTime, isExpired } = useCountdown(600)

  // Calculations
  const seatSubtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0)
  const convenienceFeePerTicket = 1.50
  const totalConvenienceFee = selectedSeats.length > 0 ? selectedSeats.length * convenienceFeePerTicket : 0
  const grandTotal = seatSubtotal + totalConvenienceFee

  const isButtonDisabled = selectedSeats.length === 0 || isSubmitting || isExpired

  return (
    <aside className="hm-booking-summary-panel">
      <div className="hm-summary-card">
        {/* Header */}
        <div className="hm-summary-header">
          <h3 className="hm-summary-title">Booking Summary</h3>
          <div className={`hm-countdown-badge ${isExpired ? 'hm-countdown-badge--expired' : ''}`}>
            <ClockIcon width={14} height={14} />
            <span>{isExpired ? 'Session Expired' : formattedTime}</span>
          </div>
        </div>

        {/* Event & Showtime Snapshot */}
        <div className="hm-summary-event">
          <img
            src={event.posterUrl}
            alt={event.title}
            className="hm-summary-poster"
          />
          <div className="hm-summary-meta">
            <h4 className="hm-summary-event-title">{event.title}</h4>
            <p className="hm-summary-venue">{showtime.venueName}</p>
            <p className="hm-summary-screen">{showtime.screen} • {showtime.format}</p>
            <p className="hm-summary-timing">
              <strong>{showtime.date}</strong> at <strong>{showtime.time}</strong>
            </p>
          </div>
        </div>

        {/* Selected Seats List */}
        <div className="hm-summary-seats-section">
          <div className="hm-summary-seats-header">
            <span>Selected Seats ({selectedSeats.length})</span>
            {selectedSeats.length > 0 && <small>Max 6 seats</small>}
          </div>

          {selectedSeats.length === 0 ? (
            <div className="hm-summary-no-seats">
              Please click on seats from the auditorium layout to proceed.
            </div>
          ) : (
            <div className="hm-selected-seat-chips">
              {selectedSeats.map((seat) => (
                <div key={seat.id} className="hm-seat-chip">
                  <span className="hm-seat-chip__id">{seat.id}</span>
                  <span className="hm-seat-chip__tier">({seat.tier})</span>
                  <span className="hm-seat-chip__price">€{seat.price.toFixed(2)}</span>
                  <button
                    type="button"
                    onClick={() => onRemoveSeat(seat.id)}
                    className="hm-seat-chip__remove"
                    title={`Remove seat ${seat.id}`}
                  >
                    <XIcon width={12} height={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cost Breakdown */}
        {selectedSeats.length > 0 && (
          <div className="hm-summary-pricing">
            <div className="hm-pricing-row">
              <span>Tickets Subtotal</span>
              <span>€{seatSubtotal.toFixed(2)}</span>
            </div>
            <div className="hm-pricing-row">
              <span>Booking Fee (€{convenienceFeePerTicket.toFixed(2)} × {selectedSeats.length})</span>
              <span>€{totalConvenienceFee.toFixed(2)}</span>
            </div>
            <div className="hm-pricing-divider" />
            <div className="hm-pricing-row hm-pricing-row--total">
              <span>Total Payable</span>
              <strong>€{grandTotal.toFixed(2)}</strong>
            </div>
          </div>
        )}

        {/* Error message if API Gateway / Booking Service fails */}
        {error && (
          <div className="hm-summary-error">
            <small>{error}</small>
          </div>
        )}

        {/* Submit Booking Action */}
        <div className="hm-summary-actions">
          <button
            type="button"
            disabled={isButtonDisabled}
            className="hm-button hm-button--primary hm-button--block"
            onClick={onConfirmBooking}
          >
            <TicketIcon width={18} height={18} />
            <span>
              {isSubmitting
                ? 'Connecting to Booking Service...'
                : selectedSeats.length === 0
                  ? 'Select Seats to Proceed'
                  : `Confirm Booking • €${grandTotal.toFixed(2)}`}
            </span>
          </button>
        </div>
      </div>
    </aside>
  )
}

