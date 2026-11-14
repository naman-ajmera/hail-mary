import type { EventItem } from '../../types/api'
import { Badge } from '../common/Badge'
import { CalendarIcon, MapPinIcon, StarIcon, TicketIcon } from '../common/Icons'

interface EventCardProps {
  item: EventItem
  onSelect: (item: EventItem) => void
}

export function EventCard({ item, onSelect }: EventCardProps) {
  const isMovie = item.category.toUpperCase() === 'MOVIE'

  return (
    <article className="hm-card" onClick={() => onSelect(item)}>
      <div className="hm-card__poster-wrapper">
        <img
          src={item.posterUrl}
          alt={item.title}
          className="hm-card__poster"
          loading="lazy"
        />

        {/* Top badges */}
        <div className="hm-card__top-badges">
          <Badge variant={isMovie ? 'primary' : 'accent'}>
            {item.category}
          </Badge>
          {item.isBackendSource && (
            <Badge variant="warning" className="hm-backend-badge" title="Retrieved live from Backend Microservice">
              API
            </Badge>
          )}
        </div>

        {/* Rating overlay */}
        <div className="hm-card__rating-pill">
          <StarIcon width={14} height={14} />
          <span>{item.rating.toFixed(1)}</span>
        </div>

        {/* Formats pill bar */}
        {item.formats && item.formats.length > 0 && (
          <div className="hm-card__formats">
            <span>{item.formats.slice(0, 2).join(' • ')}</span>
          </div>
        )}
      </div>

      <div className="hm-card__content">
        <h3 className="hm-card__title" title={item.title}>
          {item.title}
        </h3>

        <div className="hm-card__metadata">
          <span className="hm-card__meta-item">
            <MapPinIcon width={13} height={13} />
            <span>{item.city}</span>
          </span>
          <span className="hm-card__meta-item">
            <CalendarIcon width={13} height={13} />
            <span>{item.date || 'Available'}</span>
          </span>
        </div>

        <div className="hm-card__genres">
          {item.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="hm-card__genre-chip">
              {genre}
            </span>
          ))}
        </div>

        <div className="hm-card__footer">
          <div className="hm-card__price">
            <small>From</small>
            <strong>€{item.priceFrom.toFixed(2)}</strong>
          </div>

          <button
            type="button"
            className="hm-button hm-button--small hm-button--primary"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(item)
            }}
          >
            <TicketIcon width={14} height={14} />
            <span>Book</span>
          </button>
        </div>
      </div>
    </article>
  )
}

