import { MapPinIcon, XIcon } from './Icons'
import { POPULAR_CITIES } from '../../data/displayMetadata'

interface CitySelectorModalProps {
  isOpen: boolean
  currentCity: string
  onSelectCity: (city: string) => void
  onClose: () => void
}

export function CitySelectorModal({
  isOpen,
  currentCity,
  onSelectCity,
  onClose,
}: CitySelectorModalProps) {
  if (!isOpen) return null

  return (
    <div className="hm-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="hm-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="hm-modal-header">
          <div className="hm-modal-title">
            <MapPinIcon width={20} height={20} />
            <h3>Select Your City</h3>
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

        <p className="hm-modal-subtitle">
          Explore movies and live events tailored to your location.
        </p>

        <div className="hm-city-grid">
          {POPULAR_CITIES.map((city) => {
            const isSelected = city === currentCity
            return (
              <button
                key={city}
                type="button"
                className={`hm-city-pill ${isSelected ? 'hm-city-pill--active' : ''}`}
                onClick={() => {
                  onSelectCity(city)
                  onClose()
                }}
              >
                <MapPinIcon width={16} height={16} />
                <span>{city}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

