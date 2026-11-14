import { useState, type FormEvent } from 'react'
import type { EventItem } from '../../types/api'
import type { Showtime, Seat } from '../../types/booking'
import type { User } from '../../types/user'
import { TicketIcon, XIcon, CheckCircleIcon } from '../common/Icons'

interface PaymentModalProps {
  isOpen: boolean
  event: EventItem
  showtime: Showtime
  selectedSeats: Seat[]
  currentUser: User | null
  onClose: () => void
  onConfirmPayment: (paymentMethod: string) => void
  isProcessing: boolean
  error: string | null
}

export function PaymentModal({
  isOpen,
  event,
  showtime,
  selectedSeats,
  currentUser,
  onClose,
  onConfirmPayment,
  isProcessing,
  error,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'CARD' | 'REVOLUT' | 'PAYPAL'>('CARD')
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892')
  const [expiry, setExpiry] = useState('08/28')
  const [cvc, setCvc] = useState('321')
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'Alex Murphy')

  if (!isOpen) return null

  const seatSubtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0)
  const totalConvenienceFee = selectedSeats.length * 1.50
  const grandTotal = seatSubtotal + totalConvenienceFee

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const methodDescription =
      paymentMethod === 'CARD'
        ? `Credit Card (ending in ${cardNumber.slice(-4)})`
        : paymentMethod === 'REVOLUT'
        ? 'Revolut Pay'
        : 'PayPal'

    onConfirmPayment(methodDescription)
  }

  return (
    <div className="hm-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="hm-modal-card hm-modal-card--payment" onClick={(e) => e.stopPropagation()}>
        <div className="hm-modal-header">
          <div className="hm-modal-title">
            <TicketIcon width={22} height={22} />
            <h3>Complete Payment & Reserve Seats</h3>
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

        {/* Order Brief */}
        <div className="hm-payment-summary-box">
          <div className="hm-payment-summary-row">
            <span>Event & Venue:</span>
            <strong>{event.title} • {showtime.venueName}</strong>
          </div>
          <div className="hm-payment-summary-row">
            <span>Showtime:</span>
            <span>{showtime.date} at {showtime.time} ({showtime.screen})</span>
          </div>
          <div className="hm-payment-summary-row">
            <span>Seats:</span>
            <strong>{selectedSeats.map((s) => s.id).join(', ')} ({selectedSeats.length} seats)</strong>
          </div>
          <div className="hm-payment-summary-divider" />
          <div className="hm-payment-summary-row hm-payment-summary-row--total">
            <span>Total Payable:</span>
            <strong>€{grandTotal.toFixed(2)}</strong>
          </div>
        </div>

        {/* Payment Method Switcher */}
        <div className="hm-payment-method-tabs">
          <button
            type="button"
            className={`hm-pay-tab ${paymentMethod === 'CARD' ? 'hm-pay-tab--active' : ''}`}
            onClick={() => setPaymentMethod('CARD')}
          >
            💳 Card
          </button>
          <button
            type="button"
            className={`hm-pay-tab ${paymentMethod === 'REVOLUT' ? 'hm-pay-tab--active' : ''}`}
            onClick={() => setPaymentMethod('REVOLUT')}
          >
            ⚡ Revolut Pay
          </button>
          <button
            type="button"
            className={`hm-pay-tab ${paymentMethod === 'PAYPAL' ? 'hm-pay-tab--active' : ''}`}
            onClick={() => setPaymentMethod('PAYPAL')}
          >
            🅿️ PayPal
          </button>
        </div>

        {error && <div className="hm-auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="hm-payment-form">
          {paymentMethod === 'CARD' ? (
            <>
              <div className="hm-form-group">
                <label htmlFor="card-name">Cardholder Name</label>
                <input
                  id="card-name"
                  type="text"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  className="hm-input"
                  required
                />
              </div>

              <div className="hm-form-group">
                <label htmlFor="card-num">Card Number</label>
                <input
                  id="card-num"
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="hm-input"
                  required
                />
              </div>

              <div className="hm-form-row">
                <div className="hm-form-group">
                  <label htmlFor="card-exp">Expiry</label>
                  <input
                    id="card-exp"
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="hm-input"
                    required
                  />
                </div>
                <div className="hm-form-group">
                  <label htmlFor="card-cvc">CVC</label>
                  <input
                    id="card-cvc"
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    className="hm-input"
                    required
                  />
                </div>
              </div>
            </>
          ) : paymentMethod === 'REVOLUT' ? (
            <div className="hm-wallet-payment-info">
              <CheckCircleIcon width={28} height={28} />
              <h4>Instant Revolut One-Click Checkout</h4>
              <p>Authorize payment of €{grandTotal.toFixed(2)} securely via Revolut app.</p>
            </div>
          ) : (
            <div className="hm-wallet-payment-info">
              <CheckCircleIcon width={28} height={28} />
              <h4>PayPal Express Checkout</h4>
              <p>You will be redirected to PayPal to complete the €{grandTotal.toFixed(2)} transaction.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="hm-button hm-button--primary hm-button--block hm-pay-submit-btn"
          >
            {isProcessing ? 'Contacting Booking Service...' : `Pay €${grandTotal.toFixed(2)} & Reserve Seats`}
          </button>
        </form>

        <p className="hm-payment-note">
          🔒 Encrypted 256-bit checkout simulation. Prepared for teammate's Spring Cloud <code>payment-service</code> route on port <code>8083</code>.
        </p>
      </div>
    </div>
  )
}

