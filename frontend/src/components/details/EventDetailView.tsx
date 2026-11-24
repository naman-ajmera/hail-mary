import { useState, useMemo } from 'react'
import type { EventItem } from '../../types/api'
import type { Showtime } from '../../types/booking'
import { generateShowtimes, getUpcomingDates, getVenuesForCity } from '../../data/showtimesData'
import { Badge } from '../common/Badge'
import {
  MapPinIcon,
  StarIcon,
  ClockIcon,
  FilmIcon,
} from '../common/Icons'

interface EventDetailViewProps {
  event: EventItem
  selectedCity: string
  onBackToHome: () => void
  onSelectShowtime: (showtime: Showtime) => void
}

export function EventDetailView({
  event,
  selectedCity,
  onBackToHome,
  onSelectShowtime,
}: EventDetailViewProps) {
  // Date strip state
  const upcomingDates = useMemo(() => getUpcomingDates(7), [])
  const [selectedDate, setSelectedDate] = useState<string>(upcomingDates[0].date)

  // Venues available in city
  const cityForVenues = selectedCity !== 'All Cities' ? selectedCity : event.city || 'Dublin'
  const venues = useMemo(() => getVenuesForCity(cityForVenues), [cityForVenues])

  // Generate showtimes for current event and date
  const allShowtimes = useMemo(
    () => generateShowtimes(event.id, cityForVenues, selectedDate),
    [event.id, cityForVenues, selectedDate]
  )

  return (
    <div className="hm-detail-page">
      {/* Breadcrumbs */}
      <div className="hm-container">
        <nav className="hm-breadcrumbs" aria-label="Breadcrumb">
          <button type="button" onClick={onBackToHome} className="hm-breadcrumb-link">
            Home
          </button>
          <span className="hm-breadcrumb-separator">/</span>
          <span className="hm-breadcrumb-category">{event.category}</span>
          <span className="hm-breadcrumb-separator">/</span>
          <span className="hm-breadcrumb-current">{event.title}</span>
        </nav>
      </div>

      {/* Hero Banner with Movie Backdrop */}
      <section className="hm-detail-hero">
        <div
          className="hm-detail-hero__backdrop"
          style={{ backgroundImage: `url(${event.backdropUrl || event.posterUrl})` }}
        >
          <div className="hm-detail-hero__gradient" />
        </div>

        <div className="hm-container hm-detail-hero__content">
          <div className="hm-detail-hero__layout">
            {/* Poster Card */}
            <div className="hm-detail-hero__poster-card">
              <img
                src={event.posterUrl}
                alt={event.title}
                className="hm-detail-hero__poster"
              />
            </div>

            {/* Movie Info */}
            <div className="hm-detail-hero__meta">
              <div className="hm-detail-hero__badges">
                <Badge variant="primary">{event.category}</Badge>
                {event.formats.map((fmt) => (
                  <Badge key={fmt} variant="secondary">
                    {fmt}
                  </Badge>
                ))}
              </div>

              <h1 className="hm-detail-hero__title">{event.title}</h1>

              <div className="hm-detail-hero__ratings-bar">
                <div className="hm-detail-hero__rating-badge">
                  <StarIcon width={18} height={18} />
                  <strong>{event.rating.toFixed(1)}</strong>
                  <span>/ 10</span>
                </div>
                <span className="hm-detail-hero__votes">({event.votesCount} votes on Hail Mary)</span>
              </div>

              <div className="hm-detail-hero__chips">
                <span className="hm-meta-chip">
                  <ClockIcon width={14} height={14} />
                  <span>{event.duration}</span>
                </span>
                <span className="hm-meta-chip">
                  <FilmIcon width={14} height={14} />
                  <span>{event.genres.join(', ')}</span>
                </span>
                <span className="hm-meta-chip">
                  <MapPinIcon width={14} height={14} />
                  <span>{cityForVenues}</span>
                </span>
              </div>

              <p className="hm-detail-hero__synopsis">{event.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking & Showtime Section */}
      <section className="hm-container hm-showtimes-section">
        <div className="hm-showtimes-header">
          <div className="hm-showtimes-title-group">
            <h2 className="hm-showtimes-title">Select Date & Showtime</h2>
            <p className="hm-showtimes-subtitle">
              Choose your preferred date, cinema venue, and showtime to book seats.
            </p>
          </div>

          <div className="hm-showtimes-legend">
            <span className="hm-legend-item">
              <span className="hm-dot hm-dot--available" /> Available
            </span>
            <span className="hm-legend-item">
              <span className="hm-dot hm-dot--almost-full" /> Filling Fast
            </span>
          </div>
        </div>

        {/* Date Selector Strip (BookMyShow style) */}
        <div className="hm-date-strip">
          {upcomingDates.map((item) => {
            const isSelected = item.date === selectedDate
            return (
              <button
                key={item.date}
                type="button"
                className={`hm-date-pill ${isSelected ? 'hm-date-pill--active' : ''}`}
                onClick={() => setSelectedDate(item.date)}
              >
                <span className="hm-date-pill__day">{item.dayName}</span>
                <span className="hm-date-pill__number">{item.dayNumber}</span>
                <span className="hm-date-pill__month">{item.monthName}</span>
              </button>
            )
          })}
        </div>

        {/* Venues and Showtimes List */}
        <div className="hm-venue-list">
          {venues.map((venue) => {
            // Find showtimes for this venue
            const venueShowtimes = allShowtimes.filter((st) => st.venueId === venue.venueId)
            if (venueShowtimes.length === 0) return null

            return (
              <div key={venue.venueId} className="hm-venue-card">
                <div className="hm-venue-card__header">
                  <div className="hm-venue-card__info">
                    <h3 className="hm-venue-card__name">
                      <MapPinIcon width={18} height={18} />
                      <span>{venue.venueName}</span>
                    </h3>
                    <p className="hm-venue-card__address">{venue.address}</p>
                  </div>
                  <div className="hm-venue-card__features">
                    <span className="hm-venue-feature">E-Tickets</span>
                    <span className="hm-venue-feature">Wheelchair Accessible</span>
                  </div>
                </div>

                {/* Screens and Showtimes */}
                <div className="hm-screen-group">
                  {venue.screens.map((screen) => {
                    const screenTimes = venueShowtimes.filter((st) => st.screen === screen.name)

                    return (
                      <div key={screen.name} className="hm-screen-row">
                        <div className="hm-screen-meta">
                          <span className="hm-screen-name">{screen.name}</span>
                          <span className="hm-screen-format">{screen.format}</span>
                        </div>

                        <div className="hm-showtimes-grid">
                          {screenTimes.map((st, idx) => (
                            <button
                              key={st.id}
                              type="button"
                              className={`hm-time-pill ${idx === 0 ? 'hm-time-pill--filling' : ''}`}
                              onClick={() => onSelectShowtime(st)}
                              title={`Click to select seats for ${st.time} at ${venue.venueName}`}
                            >
                              <span className="hm-time-pill__time">{st.time}</span>
                              <span className="hm-time-pill__price">From €{st.priceTiers.STANDARD.toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className="hm-back-bottom">
          <button
            type="button"
            className="hm-button hm-button--outline"
            onClick={onBackToHome}
          >
            ← Back to All Movies & Events
          </button>
        </div>
      </section>
    </div>
  )
}
