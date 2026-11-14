import { useState, useEffect } from 'react'
import type { EventItem } from '../../types/api'
import { Badge } from '../common/Badge'
import { CalendarIcon, MapPinIcon, StarIcon, TicketIcon } from '../common/Icons'

interface HeroBannerProps {
  items: EventItem[]
  onSelectEvent: (event: EventItem) => void
}

export function HeroBanner({ items, onSelectEvent }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance spotlight every 6 seconds
  useEffect(() => {
    if (items.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [items.length])

  if (!items || items.length === 0) return null

  const current = items[currentIndex]

  return (
    <div className="hm-hero">
      <div
        className="hm-hero__backdrop"
        style={{ backgroundImage: `url(${current.backdropUrl || current.posterUrl})` }}
      >
        <div className="hm-hero__gradient" />
      </div>

      <div className="hm-hero__container">
        <div className="hm-hero__content">
          <div className="hm-hero__meta">
            <Badge variant="accent">FEATURED SPOTLIGHT</Badge>
            <Badge variant="outline">{current.category}</Badge>
            {current.formats.length > 0 && (
              <span className="hm-hero__format">{current.formats[0]}</span>
            )}
          </div>

          <h1 className="hm-hero__title">{current.title}</h1>

          <div className="hm-hero__details">
            <span className="hm-hero__rating">
              <StarIcon width={16} height={16} />
              <strong>{current.rating.toFixed(1)}</strong>
              <small>({current.votesCount} votes)</small>
            </span>
            <span className="hm-hero__dot">•</span>
            <span className="hm-hero__info">
              <MapPinIcon width={14} height={14} /> {current.city}
            </span>
            <span className="hm-hero__dot">•</span>
            <span className="hm-hero__info">
              <CalendarIcon width={14} height={14} /> {current.date || 'Now Showing'}
            </span>
            <span className="hm-hero__dot">•</span>
            <span className="hm-hero__duration">{current.duration}</span>
          </div>

          <p className="hm-hero__description">{current.description}</p>

          <div className="hm-hero__tags">
            {current.genres.map((g) => (
              <span key={g} className="hm-tag">
                {g}
              </span>
            ))}
          </div>

          <div className="hm-hero__actions">
            <button
              type="button"
              className="hm-button hm-button--primary"
              onClick={() => onSelectEvent(current)}
            >
              <TicketIcon width={18} height={18} />
              <span>Book Tickets From €{current.priceFrom.toFixed(2)}</span>
            </button>
          </div>
        </div>

        {/* Carousel indicator dots */}
        {items.length > 1 && (
          <div className="hm-hero__indicators">
            {items.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                className={`hm-hero__dot-btn ${idx === currentIndex ? 'hm-hero__dot-btn--active' : ''}`}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

