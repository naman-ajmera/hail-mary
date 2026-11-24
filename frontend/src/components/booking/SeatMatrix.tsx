import type { Seat, SeatTier } from '../../types/booking'

interface SeatMatrixProps {
  seats: Seat[]
  selectedSeatIds: string[]
  onToggleSeat: (seat: Seat) => void
  maxSeats?: number
}

export function SeatMatrix({
  seats,
  selectedSeatIds,
  onToggleSeat,
}: SeatMatrixProps) {
  // Group seats by Tier, then by Row (Screen is at top, so Standard is closest to screen, VIP is furthest)
  const tierOrder: { tier: SeatTier; label: string; priceDescription: string }[] = [
    { tier: 'STANDARD', label: 'Standard Classic', priceDescription: 'Front auditorium seating closest to the screen' },
    { tier: 'PREMIUM', label: 'Premium Circle', priceDescription: 'Optimal viewing angle and Dolby sound balance' },
    { tier: 'VIP', label: 'VIP Recliners', priceDescription: 'Elevated luxury recliners with extra legroom at the back' },
  ]

  const selectedSet = new Set(selectedSeatIds)

  return (
    <div className="hm-seat-matrix-wrapper">
      {/* Screen Indicator */}
      <div className="hm-screen-indicator">
        <div className="hm-screen-arc" />
        <span className="hm-screen-text">ALL EYES THIS WAY — SCREEN</span>
      </div>

      {/* Tiers & Seat Grid */}
      <div className="hm-seat-tiers">
        {tierOrder.map(({ tier, label, priceDescription }) => {
          const tierSeats = seats.filter((s) => s.tier === tier)
          if (tierSeats.length === 0) return null

          const tierPrice = tierSeats[0]?.price || 0
          // Unique rows in this tier
          const rowLetters = Array.from(new Set(tierSeats.map((s) => s.row)))

          return (
            <div key={tier} className="hm-seat-tier-section">
              <div className="hm-tier-header">
                <div className="hm-tier-title-row">
                  <span className={`hm-tier-badge hm-tier-badge--${tier.toLowerCase()}`}>{tier}</span>
                  <h4 className="hm-tier-label">{label}</h4>
                  <span className="hm-tier-price">€{tierPrice.toFixed(2)} / seat</span>
                </div>
                <small className="hm-tier-desc">{priceDescription}</small>
              </div>

              <div className="hm-tier-grid">
                {rowLetters.map((rowLetter) => {
                  const rowSeats = tierSeats.filter((s) => s.row === rowLetter)
                  return (
                    <div key={rowLetter} className="hm-seat-row">
                      <span className="hm-row-label">{rowLetter}</span>

                      <div className="hm-row-seats">
                        {rowSeats.map((seat) => {
                          const isSelected = selectedSet.has(seat.id)
                          const isReserved = seat.status === 'RESERVED'

                          // Insert middle aisle break after seat 6
                          const isAisleBreak = seat.number === 6

                          return (
                            <div
                              key={seat.id}
                              className={`hm-seat-container ${isAisleBreak ? 'hm-aisle-break' : ''}`}
                            >
                              <button
                                type="button"
                                disabled={isReserved}
                                className={`hm-seat-btn ${
                                  isSelected
                                    ? 'hm-seat-btn--selected'
                                    : isReserved
                                    ? 'hm-seat-btn--reserved'
                                    : 'hm-seat-btn--available'
                                } hm-seat-btn--tier-${tier.toLowerCase()}`}
                                onClick={() => onToggleSeat(seat)}
                                title={
                                  isReserved
                                    ? `Seat ${seat.id} is already reserved`
                                    : `Seat ${seat.id} (${tier}) - €${seat.price.toFixed(2)}`
                                }
                                aria-label={`Seat ${seat.id}, ${tier}, €${seat.price.toFixed(2)}`}
                              >
                                {seat.number}
                              </button>
                            </div>
                          )
                        })}
                      </div>

                      <span className="hm-row-label">{rowLetter}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Seat Status Legend */}
      <div className="hm-seat-legend">
        <div className="hm-legend-item">
          <span className="hm-legend-box hm-legend-box--available" />
          <span>Available</span>
        </div>
        <div className="hm-legend-item">
          <span className="hm-legend-box hm-legend-box--selected" />
          <span>Selected</span>
        </div>
        <div className="hm-legend-item">
          <span className="hm-legend-box hm-legend-box--reserved" />
          <span>Sold / Reserved</span>
        </div>
      </div>
    </div>
  )
}

