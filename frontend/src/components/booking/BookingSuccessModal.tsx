import type { EventItem } from '../../types/api'
import type { Showtime, Seat, BookingResponse } from '../../types/booking'
import { Badge } from '../common/Badge'
import { CheckCircleIcon, MapPinIcon, CalendarIcon, TicketIcon, XIcon } from '../common/Icons'

interface BookingSuccessModalProps {
  isOpen: boolean
  booking: BookingResponse | null
  event: EventItem
  showtime: Showtime
  selectedSeats: Seat[]
  onClose: () => void
}

export function BookingSuccessModal({
  isOpen,
  booking,
  event,
  showtime,
  selectedSeats,
  onClose,
}: BookingSuccessModalProps) {
  if (!isOpen || !booking) return null

  const seatSubtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0)
  const total = seatSubtotal + selectedSeats.length * 1.50

  return (
    <div className="hm-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="hm-modal-card hm-modal-card--ticket" onClick={(e) => e.stopPropagation()}>
        {/* Header with success check */}
        <div className="hm-ticket-header">
          <div className="hm-ticket-success-icon">
            <CheckCircleIcon width={32} height={32} />
          </div>
          <div>
            <h3>Booking Created Successfully!</h3>
            <p className="hm-ticket-subtitle">
              Your ticket request has been acknowledged by the Booking Microservice.
            </p>
          </div>
          <button
            type="button"
            className="hm-icon-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XIcon width={20} height={20} />
          </button>
        </div>

        {/* Digital Boarding Pass Ticket */}
        <div className="hm-digital-ticket">
          <div className="hm-ticket-top">
            <div className="hm-ticket-brand">
              <span>🎬 Hail Mary Tickets</span>
              <Badge variant="warning">{booking.status}</Badge>
            </div>
            <div className="hm-ticket-id">
              <small>Booking Reference (UUID):</small>
              <code>{booking.bookingId}</code>
            </div>
          </div>

          <div className="hm-ticket-body">
            <div className="hm-ticket-movie">
              <img src={event.posterUrl} alt={event.title} className="hm-ticket-poster" />
              <div className="hm-ticket-info">
                <h4>{event.title}</h4>
                <div className="hm-ticket-meta">
                  <Badge variant="primary">{event.category}</Badge>
                  <span>{showtime.format}</span>
                </div>
                <p className="hm-ticket-venue">
                  <MapPinIcon width={14} height={14} /> {showtime.venueName}, {showtime.city}
                </p>
                <p className="hm-ticket-datetime">
                  <CalendarIcon width={14} height={14} /> {showtime.date} at {showtime.time} ({showtime.screen})
                </p>
              </div>
            </div>

            <div className="hm-ticket-seats-box">
              <div className="hm-ticket-seat-col">
                <small>Seats Confirmed</small>
                <strong>{booking.seatIds.join(', ')}</strong>
              </div>
              <div className="hm-ticket-seat-col">
                <small>Tickets Count</small>
                <strong>{booking.seatIds.length}</strong>
              </div>
              <div className="hm-ticket-seat-col">
                <small>Amount</small>
                <strong>€{total.toFixed(2)}</strong>
              </div>
            </div>

            {/* Stylized Barcode / QR Preview */}
            <div className="hm-ticket-barcode-wrap">
              <div className="hm-ticket-barcode-lines" />
              <small className="hm-ticket-barcode-number">{booking.bookingId.slice(0, 18).toUpperCase()}</small>
            </div>
          </div>

          <div className="hm-ticket-footer">
            <small>Created at: {new Date(booking.createdAt).toLocaleString()}</small>
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="hm-modal-actions" style={{ marginTop: '1.5rem', gap: '0.75rem' }}>
          <button
            type="button"
            className="hm-button hm-button--outline"
            onClick={() => window.print()}
          >
            <TicketIcon width={16} height={16} />
            <span>Print Ticket</span>
          </button>
          <button
            type="button"
            className="hm-button hm-button--primary"
            onClick={onClose}
          >
            Done & Return to Home
          </button>
        </div>
      </div>
    </div>
  )
}

