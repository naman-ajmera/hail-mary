import type { SavedBooking } from '../../types/user'
import { Badge } from '../common/Badge'
import { TicketIcon, CalendarIcon, MapPinIcon, XIcon } from '../common/Icons'

interface MyBookingsModalProps {
  isOpen: boolean
  bookings: SavedBooking[]
  onClose: () => void
  onViewTicket: (booking: SavedBooking) => void
}

export function MyBookingsModal({
  isOpen,
  bookings,
  onClose,
  onViewTicket,
}: MyBookingsModalProps) {
  if (!isOpen) return null

  return (
    <div className="hm-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="hm-modal-card hm-modal-card--bookings" onClick={(e) => e.stopPropagation()}>
        <div className="hm-modal-header">
          <div className="hm-modal-title">
            <TicketIcon width={22} height={22} />
            <h3>My Bookings</h3>
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

        <div className="hm-bookings-content">
          {bookings.length === 0 ? (
            <div className="hm-empty-bookings-box">
              <TicketIcon width={48} height={48} className="hm-empty-icon" />
              <h4>No Bookings Found</h4>
              <p>You haven't reserved any tickets yet. Explore movies and live events to start booking!</p>
              <button
                type="button"
                className="hm-button hm-button--primary hm-button--small"
                onClick={onClose}
              >
                Browse What's On
              </button>
            </div>
          ) : (
            <div className="hm-bookings-list">
              {bookings.map((b) => (
                <div key={b.bookingId} className="hm-booking-record-card">
                  <img src={b.posterUrl} alt={b.eventTitle} className="hm-booking-poster" />

                  <div className="hm-booking-details">
                    <div className="hm-booking-top-line">
                      <h4 className="hm-booking-title">{b.eventTitle}</h4>
                      <Badge variant="warning">{b.status}</Badge>
                    </div>

                    <p className="hm-booking-meta-line">
                      <MapPinIcon width={13} height={13} /> {b.venueName}, {b.city}
                    </p>
                    <p className="hm-booking-meta-line">
                      <CalendarIcon width={13} height={13} /> {b.date} at {b.time} ({b.screen})
                    </p>

                    <div className="hm-booking-tags-line">
                      <span>Seats: <strong>{b.seatIds.join(', ')}</strong></span>
                      <span>•</span>
                      <span>Total: <strong>€{b.totalAmount.toFixed(2)}</strong></span>
                    </div>

                    <div className="hm-booking-ref-box">
                      <small>Booking Ref: <code>{b.bookingId.slice(0, 16)}...</code></small>
                    </div>
                  </div>

                  <div className="hm-booking-actions">
                    <button
                      type="button"
                      className="hm-button hm-button--small hm-button--secondary"
                      onClick={() => {
                        onViewTicket(b)
                      }}
                    >
                      <TicketIcon width={14} height={14} />
                      <span>View Pass</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

