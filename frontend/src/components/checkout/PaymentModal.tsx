import { useState, useEffect, type FormEvent } from 'react'
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import type { Stripe } from '@stripe/stripe-js'
import type { EventItem } from '../../types/api'
import type { Showtime, Seat, BookingResponse } from '../../types/booking'
import type { User } from '../../types/user'
import { createBooking, confirmBooking } from '../../services/bookingService'
import { getStripe } from '../../services/stripeClient'
import { TicketIcon, XIcon } from '../common/Icons'

interface PaymentModalProps {
  isOpen: boolean
  event: EventItem
  showtime: Showtime
  selectedSeats: Seat[]
  currentUser: User | null
  onClose: () => void
  onBookingSuccess: (booking: BookingResponse, selectedSeats: Seat[], paymentMethod: string) => void
}

/**
 * Subcomponent rendering the Stripe Card Element within the Elements provider context.
 */
function StripeCardForm({
  grandTotal,
  clientSecret,
  isProcessing,
  cardHolder,
  onCardHolderChange,
  onPaymentSubmitted,
  paymentError,
}: {
  grandTotal: number
  clientSecret: string
  isProcessing: boolean
  cardHolder: string
  onCardHolderChange: (name: string) => void
  onPaymentSubmitted: (paymentMethodDesc: string, paymentIntentId?: string) => Promise<void>
  paymentError: string | null
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [localError, setLocalError] = useState<string | null>(null)
  const [isAuthorizing, setIsAuthorizing] = useState(false)

  const handleStripePay = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!stripe || !elements) {
      // In case elements aren't ready yet
      setLocalError('Stripe checkout is still initializing. Please wait a moment.')
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      setLocalError('Card details are required.')
      return
    }

    setIsAuthorizing(true)

    try {
      const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardHolder,
          },
        },
      })

      if (error) {
        setLocalError(error.message || 'Payment authorization failed.')
        setIsAuthorizing(false)
        return
      }

      if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'requires_capture')) {
        await onPaymentSubmitted('Stripe Card (Test)', paymentIntent.id)
      } else {
        await onPaymentSubmitted('Stripe Card (Test)', paymentIntent?.id)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Payment error'
      setLocalError(msg)
    } finally {
      setIsAuthorizing(false)
    }
  }

  const busy = isProcessing || isAuthorizing

  return (
    <form onSubmit={handleStripePay} className="hm-payment-form">
      <div className="hm-stripe-badge">
        <span>⚡ Powered by Stripe (Test Mode)</span>
      </div>

      <div className="hm-form-group">
        <label htmlFor="cardholder-name">Cardholder Name</label>
        <input
          id="cardholder-name"
          type="text"
          value={cardHolder}
          onChange={(e) => onCardHolderChange(e.target.value)}
          className="hm-input"
          placeholder="e.g. Jane Doe"
          required
        />
      </div>

      <div className="hm-form-group">
        <label>Card Information (Number, MM/YY, CVC)</label>
        <div className="hm-stripe-card-container">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: '15px',
                  color: '#ffffff',
                  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
                  '::placeholder': { color: '#94a3b8' },
                  iconColor: '#f59e0b',
                },
                invalid: {
                  color: '#ef4444',
                  iconColor: '#ef4444',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="hm-stripe-test-hint">
        <span>Test card: <code>4242 •••• •••• 4242</code></span>
        <span>Any future date & 3-digit CVC</span>
      </div>

      {(localError || paymentError) && (
        <div className="hm-auth-error">{localError || paymentError}</div>
      )}

      <button
        type="submit"
        disabled={busy || !stripe}
        className="hm-button hm-button--primary hm-button--block hm-pay-submit-btn"
      >
        {busy ? 'Authorizing with Stripe...' : `Pay €${grandTotal.toFixed(2)} & Reserve Seats`}
      </button>
    </form>
  )
}

/**
 * Fallback simulator when no live Stripe keys are configured in local environment.
 */
function SimulatedCardForm({
  grandTotal,
  isProcessing,
  cardHolder,
  onCardHolderChange,
  onPaymentSubmitted,
  paymentError,
}: {
  grandTotal: number
  isProcessing: boolean
  cardHolder: string
  onCardHolderChange: (name: string) => void
  onPaymentSubmitted: (paymentMethodDesc: string) => Promise<void>
  paymentError: string | null
}) {
  const [testCard, setTestCard] = useState('4242 •••• •••• 4242')
  const [expiry, setExpiry] = useState('12/28')
  const [cvc, setCvc] = useState('123')

  const handleSimulatedSubmit = async (e: FormEvent) => {
    e.preventDefault()
    await onPaymentSubmitted(`Stripe Test Card (ending in ${testCard.slice(-4)})`)
  }

  return (
    <form onSubmit={handleSimulatedSubmit} className="hm-payment-form">
      <div className="hm-stripe-badge">
        <span>⚡ Stripe Test Simulator</span>
      </div>

      <div className="hm-form-group">
        <label htmlFor="sim-card-name">Cardholder Name</label>
        <input
          id="sim-card-name"
          type="text"
          value={cardHolder}
          onChange={(e) => onCardHolderChange(e.target.value)}
          className="hm-input"
          required
        />
      </div>

      <div className="hm-form-group">
        <label htmlFor="sim-card-num">Test Card Number</label>
        <input
          id="sim-card-num"
          type="text"
          value={testCard}
          onChange={(e) => setTestCard(e.target.value)}
          className="hm-input"
          required
        />
      </div>

      <div className="hm-form-row">
        <div className="hm-form-group">
          <label htmlFor="sim-card-exp">Expiry</label>
          <input
            id="sim-card-exp"
            type="text"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="hm-input"
            required
          />
        </div>
        <div className="hm-form-group">
          <label htmlFor="sim-card-cvc">CVC</label>
          <input
            id="sim-card-cvc"
            type="text"
            value={cvc}
            onChange={(e) => setCvc(e.target.value)}
            className="hm-input"
            required
          />
        </div>
      </div>

      <div className="hm-stripe-test-hint">
        <span>Stripe Test Mode: <code>4242 4242 4242 4242</code></span>
        <span>Instant sandbox authorization</span>
      </div>

      {paymentError && <div className="hm-auth-error">{paymentError}</div>}

      <button
        type="submit"
        disabled={isProcessing}
        className="hm-button hm-button--primary hm-button--block hm-pay-submit-btn"
      >
        {isProcessing ? 'Confirming with Booking Service...' : `Pay €${grandTotal.toFixed(2)} & Reserve Seats`}
      </button>
    </form>
  )
}

export function PaymentModal({
  isOpen,
  event,
  showtime,
  selectedSeats,
  currentUser,
  onClose,
  onBookingSuccess,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'CARD'>('CARD')
  const [cardHolder, setCardHolder] = useState(currentUser?.name || 'Jane Doe')
  const [pendingBooking, setPendingBooking] = useState<BookingResponse | null>(null)
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [initError, setInitError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  const seatSubtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0)
  const totalConvenienceFee = selectedSeats.length * 1.5
  const grandTotal = seatSubtotal + totalConvenienceFee

  // Initialize booking & PaymentIntent when modal opens
  useEffect(() => {
    if (!isOpen) {
      setPendingBooking(null)
      setInitError(null)
      setPaymentError(null)
      return
    }

    let isCurrent = true
    setIsInitializing(true)
    setInitError(null)

    async function initCheckout() {
      try {
        const booking = await createBooking({
          eventId: String(event.id),
          showId: showtime.id,
          seatIds: selectedSeats.map((s) => s.id),
          totalAmount: grandTotal,
          currency: 'eur',
        })

        if (!isCurrent) return
        setPendingBooking(booking)

        // Attempt to load Stripe instance if a real publishable key was returned
        if (booking.publishableKey) {
          const s = await getStripe(booking.publishableKey)
          if (isCurrent) {
            setStripeInstance(s)
          }
        }
      } catch (err: unknown) {
        if (!isCurrent) return
        console.error('Failed to initialize booking with Stripe:', err)
        const msg = err instanceof Error ? err.message : 'Could not contact booking-service.'
        setInitError(msg)
      } finally {
        if (isCurrent) {
          setIsInitializing(false)
        }
      }
    }

    initCheckout()

    return () => {
      isCurrent = false
    }
  }, [isOpen, event.id, showtime.id, selectedSeats, grandTotal])

  if (!isOpen) return null

  // Handle final confirmation with backend
  const handlePaymentSubmitted = async (paymentMethodDesc: string, paymentIntentId?: string) => {
    if (!pendingBooking) return

    setIsProcessing(true)
    setPaymentError(null)

    try {
      const confirmed = await confirmBooking(pendingBooking.bookingId, {
        paymentMethod: paymentMethodDesc,
        paymentIntentId: paymentIntentId || pendingBooking.stripePaymentIntentId,
      })

      onBookingSuccess(confirmed, selectedSeats, paymentMethodDesc)
    } catch (err: unknown) {
      console.error('Booking confirmation failed:', err)
      const msg = err instanceof Error ? err.message : 'Failed to finalize booking with backend.'
      setPaymentError(msg)
    } finally {
      setIsProcessing(false)
    }
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
            <strong>
              {selectedSeats.map((s) => s.id).join(', ')} ({selectedSeats.length} seats)
            </strong>
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
            💳 Stripe Card
          </button>
        </div>

        {/* Modal Body: Loading, Error, or Form */}
        {isInitializing ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div className="hm-loading-spinner" style={{ margin: '0 auto 1rem auto' }} />
            <h4 style={{ color: '#fff', marginBottom: '0.25rem' }}>Setting up secure checkout...</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Reserving your seats and contacting Stripe test mode.
            </p>
          </div>
        ) : initError ? (
          <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
            <div className="hm-auth-error" style={{ marginBottom: '1rem' }}>
              ⚠️ {initError}
            </div>
            <button
              type="button"
              className="hm-button hm-button--small hm-button--primary"
              onClick={onClose}
            >
              Back to Seat Selection
            </button>
          </div>
        ) : (
          <>
            {(
              stripeInstance && pendingBooking?.stripeClientSecret ? (
                <Elements
                  stripe={stripeInstance}
                  options={{ clientSecret: pendingBooking.stripeClientSecret }}
                >
                  <StripeCardForm
                    grandTotal={grandTotal}
                    clientSecret={pendingBooking.stripeClientSecret}
                    isProcessing={isProcessing}
                    cardHolder={cardHolder}
                    onCardHolderChange={setCardHolder}
                    onPaymentSubmitted={handlePaymentSubmitted}
                    paymentError={paymentError}
                  />
                </Elements>
              ) : (
                <SimulatedCardForm
                  grandTotal={grandTotal}
                  isProcessing={isProcessing}
                  cardHolder={cardHolder}
                  onCardHolderChange={setCardHolder}
                  onPaymentSubmitted={handlePaymentSubmitted}
                  paymentError={paymentError}
                />
              )
            )}
          </>
        )}

        <p className="hm-payment-note">
          🔒 Secure 256-bit Stripe test-mode checkout. Bookings are persisted in H2 database via <code>booking-service</code> (:8082).
        </p>
      </div>
    </div>
  )
}
