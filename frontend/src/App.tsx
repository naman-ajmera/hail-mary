import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Routes,
  Route,
  useNavigate,
  useSearchParams,
  useParams,
  useLocation,
  Navigate,
} from 'react-router-dom'
import type { EventItem, CategoryFilter } from './types/api'
import type { Showtime, Seat, BookingResponse } from './types/booking'
import type { User, SavedBooking } from './types/user'
import { getEvents, getEventById } from './services/eventService'
import { searchEvents } from './services/searchService'
import { getStoredUser, logout } from './services/authService'
import { getShowtimeById } from './data/showtimesData'
import { SPOTLIGHT_ITEMS } from './data/displayMetadata'
import { Navbar } from './components/Navbar'
import { HeroBanner } from './components/discovery/HeroBanner'
import { EventShelf } from './components/discovery/EventShelf'
import { EventDetailView } from './components/details/EventDetailView'
import { SeatSelectionView } from './components/booking/SeatSelectionView'
import { BookingSuccessModal } from './components/booking/BookingSuccessModal'
import { CitySelectorModal } from './components/common/CitySelectorModal'
import { AuthModal } from './components/auth/AuthModal'
import { MyBookingsModal } from './components/user/MyBookingsModal'
import { ShelfSkeleton } from './components/common/LoadingSkeleton'
import { ErrorAlert, EmptyState } from './components/common/StateAlerts'
import { Badge } from './components/common/Badge'
import { SparklesIcon } from './components/common/Icons'
import './App.css'

/**
 * Sub-component for `/events/:id`
 */
function EventDetailRoute({
  backendEvents,
  selectedCity,
  onSelectShowtime,
  onBackToHome,
}: {
  backendEvents: EventItem[]
  selectedCity: string
  onSelectShowtime: (event: EventItem, showtime: Showtime) => void
  onBackToHome: () => void
}) {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let isCurrent = true

    // Check if event is already loaded in memory
    const existing =
      backendEvents.find((e) => String(e.id) === id) ||
      SPOTLIGHT_ITEMS.find((e) => String(e.id) === id)

    if (existing) {
      setEvent(existing)
      setIsLoading(false)
      return
    }

    // Otherwise fetch by ID (supports page refresh on /events/:id)
    setIsLoading(true)
    setError(null)

    getEventById(id)
      .then((item) => {
        if (!isCurrent) return
        if (item) {
          setEvent(item)
        } else {
          setError(`We could not find an event with id "${id}".`)
        }
      })
      .catch((err) => {
        if (!isCurrent) return
        console.error('Failed to load event:', err)
        setError('Failed to load event details. Please try again.')
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [id, backendEvents])

  if (isLoading) {
    return (
      <div className="hm-container" style={{ marginTop: '2.5rem' }}>
        <ShelfSkeleton count={4} />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="hm-container" style={{ marginTop: '2.5rem' }}>
        <EmptyState
          title="Event Not Found"
          message={error || 'The requested event could not be found.'}
          onReset={onBackToHome}
        />
      </div>
    )
  }

  return (
    <EventDetailView
      event={event}
      selectedCity={selectedCity}
      onBackToHome={onBackToHome}
      onSelectShowtime={(st) => onSelectShowtime(event, st)}
    />
  )
}

/**
 * Sub-component for `/events/:id/book/:showtimeId`
 */
function SeatSelectionRoute({
  selectedCity,
  currentUser,
  onBackToDetails,
  onBookingSuccess,
  onOpenAuthModal,
}: {
  selectedCity: string
  currentUser: User | null
  onBackToDetails: (eventId: string) => void
  onBookingSuccess: (
    booking: BookingResponse,
    seats: Seat[],
    paymentMethod: string,
    event: EventItem,
    showtime: Showtime
  ) => void
  onOpenAuthModal: () => void
}) {
  const { id, showtimeId } = useParams<{ id: string; showtimeId: string }>()
  const [event, setEvent] = useState<EventItem | null>(null)
  const [showtime, setShowtime] = useState<Showtime | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    if (!id || !showtimeId) return
    let isCurrent = true
    setIsLoading(true)

    getEventById(id)
      .then((evt) => {
        if (!isCurrent) return
        if (evt) {
          setEvent(evt)
          const resolvedShowtime = getShowtimeById(id, showtimeId, selectedCity)
          setShowtime(resolvedShowtime)
        }
      })
      .catch((err) => {
        console.error('Failed to load event for booking:', err)
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false)
      })

    return () => {
      isCurrent = false
    }
  }, [id, showtimeId, selectedCity])

  if (isLoading || !event || !showtime) {
    return (
      <div className="hm-container" style={{ marginTop: '2.5rem' }}>
        <ShelfSkeleton count={4} />
      </div>
    )
  }

  return (
    <SeatSelectionView
      event={event}
      showtime={showtime}
      currentUser={currentUser}
      onBackToDetails={() => onBackToDetails(event.id)}
      onBookingSuccess={(booking, seats, paymentMethod) =>
        onBookingSuccess(booking, seats, paymentMethod, event, showtime)
      }
      onOpenAuthModal={onOpenAuthModal}
    />
  )
}

export function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  // Dynamic state mirrored with URL query parameters
  const selectedCity = searchParams.get('city') || 'All Cities'
  const activeCategory = (searchParams.get('category') as CategoryFilter) || 'ALL'
  const searchQuery = searchParams.get('q') || ''

  // Local search input buffer for controlled typing
  const [searchInputValue, setSearchInputValue] = useState<string>(searchQuery)

  // Keep search input in sync if URL query changes externally (e.g. back button)
  useEffect(() => {
    setSearchInputValue(searchQuery)
  }, [searchQuery])

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [location.pathname])

  // Booking Confirmation State
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResponse | null>(null)
  const [confirmedBookingSeats, setConfirmedBookingSeats] = useState<Seat[]>([])
  const [confirmedEvent, setConfirmedEvent] = useState<EventItem | null>(null)
  const [confirmedShowtime, setConfirmedShowtime] = useState<Showtime | null>(null)

  // User & Saved Bookings State (Persisted in localStorage with JWT)
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser())

  const [savedBookings, setSavedBookings] = useState<SavedBooking[]>(() => {
    try {
      const stored = localStorage.getItem('hm_saved_bookings')
      return stored ? (JSON.parse(stored) as SavedBooking[]) : []
    } catch {
      return []
    }
  })

  // Data & Network State
  const [backendEvents, setBackendEvents] = useState<EventItem[]>([])
  const [searchResults, setSearchResults] = useState<EventItem[] | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState<number>(0)

  // Modals
  const [isCityModalOpen, setIsCityModalOpen] = useState<boolean>(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState<boolean>(false)

  // Initial load from GET /api/events
  useEffect(() => {
    let isCurrent = true

    async function loadData() {
      try {
        const items = await getEvents()
        if (isCurrent) {
          setBackendEvents(items)
          setApiError(null)
        }
      } catch (err) {
        if (isCurrent) {
          console.warn('API Gateway /api/events unavailable:', err)
          setApiError(
            'Could not reach API Gateway at http://localhost:8080/api/events. Showing spotlight showcase. Ensure your backend microservices and gateway are running.'
          )
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isCurrent = false
    }
  }, [retryKey])

  // Search trigger function invoked on filter changes
  const triggerSearch = useCallback(
    async (city: string, category: string, query: string) => {
      const hasQuery = query.trim().length > 0
      const hasCityFilter = city !== 'All Cities'
      const hasCategoryFilter = category !== 'ALL'

      if (!hasQuery && !hasCityFilter && !hasCategoryFilter) {
        setSearchResults(null)
        return
      }

      setIsLoading(true)
      try {
        const results = await searchEvents({
          q: query,
          city,
          category,
        })
        setSearchResults(results)
      } catch (err) {
        console.warn('API Gateway /api/search failed:', err)
        // Fallback local filtering over loaded events + spotlights
        const combined = [...backendEvents, ...SPOTLIGHT_ITEMS]
        const filtered = combined.filter((item) => {
          const matchesQuery =
            !hasQuery ||
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.city.toLowerCase().includes(query.toLowerCase()) ||
            item.category.toLowerCase().includes(query.toLowerCase())

          const matchesCity = !hasCityFilter || item.city.toLowerCase() === city.toLowerCase()
          const matchesCategory = !hasCategoryFilter || item.category === category

          return matchesQuery && matchesCity && matchesCategory
        })
        setSearchResults(filtered)
      } finally {
        setIsLoading(false)
      }
    },
    [backendEvents]
  )

  // Trigger search whenever URL search params change
  useEffect(() => {
    triggerSearch(selectedCity, activeCategory, searchQuery)
  }, [selectedCity, activeCategory, searchQuery, triggerSearch])

  // Synchronize filter updates into URL search parameters
  const updateUrlParams = useCallback(
    (updates: { category?: string; city?: string; q?: string }) => {
      const newParams = new URLSearchParams(searchParams)

      if (updates.category !== undefined) {
        if (updates.category && updates.category !== 'ALL') {
          newParams.set('category', updates.category)
        } else {
          newParams.delete('category')
        }
      }

      if (updates.city !== undefined) {
        if (updates.city && updates.city !== 'All Cities') {
          newParams.set('city', updates.city)
        } else {
          newParams.delete('city')
        }
      }

      if (updates.q !== undefined) {
        if (updates.q.trim()) {
          newParams.set('q', updates.q.trim())
        } else {
          newParams.delete('q')
        }
      }

      const queryString = newParams.toString()
      navigate(queryString ? `/?${queryString}` : '/')
    },
    [searchParams, navigate]
  )

  const handleCitySelect = (city: string) => {
    updateUrlParams({ city })
  }

  const handleCategorySelect = (cat: CategoryFilter) => {
    updateUrlParams({ category: cat })
  }

  const handleSearchSubmit = () => {
    updateUrlParams({ q: searchInputValue })
  }

  const handleResetFilters = () => {
    setSearchInputValue('')
    navigate('/')
  }

  const handleRetry = () => {
    setIsLoading(true)
    setRetryKey((prev) => prev + 1)
  }

  // Navigation handlers
  const handleOpenEventDetail = (item: EventItem) => {
    navigate(`/events/${item.id}`)
  }

  const handleSelectShowtime = (event: EventItem, showtime: Showtime) => {
    navigate(`/events/${event.id}/book/${showtime.id}`)
  }

  // Booking completion & persistence
  const handleBookingSuccess = (
    booking: BookingResponse,
    seats: Seat[],
    paymentMethod: string,
    event: EventItem,
    showtime: Showtime
  ) => {
    setConfirmedBooking(booking)
    setConfirmedBookingSeats(seats)
    setConfirmedEvent(event)
    setConfirmedShowtime(showtime)

    const subtotal = seats.reduce((acc, s) => acc + s.price, 0)
    const totalAmount = subtotal + seats.length * 1.5

    const newRecord: SavedBooking = {
      bookingId: booking.bookingId,
      eventId: String(event.id),
      eventTitle: event.title,
      eventCategory: event.category,
      posterUrl: event.posterUrl,
      venueName: showtime.venueName,
      city: showtime.city,
      date: showtime.date,
      time: showtime.time,
      screen: showtime.screen,
      seatIds: booking.seatIds,
      totalAmount,
      status: booking.status,
      createdAt: booking.createdAt,
      paymentMethod,
    }

    setSavedBookings((prev) => {
      const updated = [newRecord, ...prev]
      localStorage.setItem('hm_saved_bookings', JSON.stringify(updated))
      return updated
    })
  }

  const handleCloseBookingSuccess = () => {
    setConfirmedBooking(null)
    setConfirmedBookingSeats([])
    setConfirmedEvent(null)
    setConfirmedShowtime(null)
    navigate('/')
  }

  const handleSignOut = () => {
    logout()
    setCurrentUser(null)
    setIsBookingsModalOpen(false)
  }

  const handleViewTicketFromHistory = (saved: SavedBooking) => {
    setIsBookingsModalOpen(false)

    // Reconstruct temporary booking view state
    const reconstructedEvent: EventItem = {
      id: saved.eventId,
      title: saved.eventTitle,
      category: saved.eventCategory,
      city: saved.city,
      posterUrl: saved.posterUrl,
      backdropUrl: saved.posterUrl,
      rating: 8.8,
      votesCount: '10K',
      duration: '2h 15m',
      genres: [saved.eventCategory],
      formats: ['Digital'],
      languages: ['English'],
      venue: saved.venueName,
      priceFrom: 12.0,
      description: 'Reserved booking pass.',
      isBackendSource: true,
    }

    const reconstructedShowtime: Showtime = {
      id: 'show-history',
      eventId: saved.eventId,
      venueId: 'venue-history',
      venueName: saved.venueName,
      city: saved.city,
      date: saved.date,
      time: saved.time,
      screen: saved.screen,
      format: 'Standard',
      priceTiers: { VIP: 18, PREMIUM: 14, STANDARD: 11 },
    }

    const reconstructedSeats: Seat[] = saved.seatIds.map((id) => ({
      id,
      row: id.charAt(0),
      number: parseInt(id.slice(1)) || 1,
      tier: 'STANDARD',
      price: saved.totalAmount / (saved.seatIds.length || 1),
      status: 'SELECTED',
    }))

    const reconstructedBooking: BookingResponse = {
      bookingId: saved.bookingId,
      eventId: saved.eventId,
      showId: 'show-history',
      seatIds: saved.seatIds,
      status: saved.status,
      createdAt: saved.createdAt,
    }

    setConfirmedEvent(reconstructedEvent)
    setConfirmedShowtime(reconstructedShowtime)
    setConfirmedBooking(reconstructedBooking)
    setConfirmedBookingSeats(reconstructedSeats)
  }

  // Filtered lists for Discovery View
  const allDisplayItems = useMemo(
    () => (searchResults !== null ? searchResults : [...backendEvents, ...SPOTLIGHT_ITEMS]),
    [searchResults, backendEvents]
  )
  const movieItems = useMemo(
    () => allDisplayItems.filter((item) => item.category.toUpperCase() === 'MOVIE'),
    [allDisplayItems]
  )
  const concertItems = useMemo(
    () =>
      allDisplayItems.filter(
        (item) => item.category.toUpperCase() === 'CONCERT' || item.category.toUpperCase() === 'EVENT'
      ),
    [allDisplayItems]
  )

  return (
    <div className="hm-app">
      {/* Global Navigation Bar */}
      <Navbar
        selectedCity={selectedCity}
        onOpenCityModal={() => setIsCityModalOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => handleCategorySelect(cat as CategoryFilter)}
        searchQuery={searchInputValue}
        onSearchChange={setSearchInputValue}
        onExecuteSearch={handleSearchSubmit}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenMyBookingsModal={() => setIsBookingsModalOpen(true)}
        bookingsCount={savedBookings.length}
        isBackendConnected={apiError === null && !isLoading && backendEvents.length > 0}
      />

      {/* Main Dynamic View Router */}
      <main className="hm-main">
        <Routes>
          {/* View 1: Homepage & Discovery */}
          <Route
            path="/"
            element={
              <>
                {apiError && (
                  <div className="hm-container" style={{ marginTop: '1rem' }}>
                    <ErrorAlert
                      title="API Gateway Offline or Connecting"
                      message={apiError}
                      onRetry={handleRetry}
                    />
                  </div>
                )}

                {/* Spotlight Banner on Discovery */}
                {searchResults === null && activeCategory === 'ALL' && searchQuery === '' && (
                  <HeroBanner
                    items={SPOTLIGHT_ITEMS}
                    onSelectEvent={handleOpenEventDetail}
                  />
                )}

                <div className="hm-container">
                  {/* Active Filter Pill */}
                  {(selectedCity !== 'All Cities' || activeCategory !== 'ALL' || searchQuery.trim() !== '') && (
                    <div className="hm-active-filter-bar">
                      <div className="hm-active-filter-bar__text">
                        <SparklesIcon width={16} height={16} />
                        <span>
                          Filtering by: <strong>{selectedCity}</strong>
                          {activeCategory !== 'ALL' && (
                            <>
                              {' '}
                              • Category: <strong>{activeCategory}</strong>
                            </>
                          )}
                          {searchQuery && (
                            <>
                              {' '}
                              • Keyword: <strong>"{searchQuery}"</strong>
                            </>
                          )}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="hm-button hm-button--small hm-button--secondary"
                        onClick={handleResetFilters}
                      >
                        Clear All Filters
                      </button>
                    </div>
                  )}

                  {/* Loading Skeleton */}
                  {isLoading ? (
                    <div style={{ marginTop: '2rem' }}>
                      <ShelfSkeleton count={4} />
                    </div>
                  ) : searchResults !== null ? (
                    searchResults.length === 0 ? (
                      <EmptyState
                        title="No matching events or movies found"
                        message={`We couldn't find any listings in ${selectedCity} matching your current filters.`}
                        onReset={handleResetFilters}
                      />
                    ) : (
                      <EventShelf
                        title={searchQuery ? `Search Results for "${searchQuery}"` : `Events in ${selectedCity}`}
                        subtitle="Live results returned through Spring Cloud API Gateway"
                        items={searchResults}
                        badge={<Badge variant="accent">Filtered View</Badge>}
                        onSelectItem={handleOpenEventDetail}
                      />
                    )
                  ) : (
                    <>
                      {(activeCategory === 'ALL' || activeCategory === 'MOVIE') && (
                        <EventShelf
                          title="Now Showing in Theatres"
                          subtitle="Latest blockbusters and critically acclaimed releases"
                          items={movieItems}
                          onSelectItem={handleOpenEventDetail}
                        />
                      )}

                      {(activeCategory === 'ALL' || activeCategory === 'CONCERT') && (
                        <EventShelf
                          title="Live Events & Concerts"
                          subtitle="Music concerts, stand-up comedy, and live performances"
                          items={concertItems}
                          badge={<Badge variant="accent">Live Events</Badge>}
                          onSelectItem={handleOpenEventDetail}
                        />
                      )}
                    </>
                  )}
                </div>
              </>
            }
          />

          {/* View 2: Movie & Event Details */}
          <Route
            path="/events/:id"
            element={
              <EventDetailRoute
                backendEvents={backendEvents}
                selectedCity={selectedCity}
                onSelectShowtime={handleSelectShowtime}
                onBackToHome={() => navigate('/')}
              />
            }
          />

          {/* View 3: Seat Selection & Booking */}
          <Route
            path="/events/:id/book/:showtimeId"
            element={
              <SeatSelectionRoute
                selectedCity={selectedCity}
                currentUser={currentUser}
                onBackToDetails={(eventId) => navigate(`/events/${eventId}`)}
                onBookingSuccess={handleBookingSuccess}
                onOpenAuthModal={() => setIsAuthModalOpen(true)}
              />
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Footer */}
      <footer className="hm-footer">
        <div className="hm-container hm-footer__inner">
          <div className="hm-footer__col">
            <div className="hm-footer__brand">🎬 Hail Mary</div>
            <p>Your premier entertainment ticketing hub for movies and live events in Ireland.</p>
          </div>
          <div className="hm-footer__col">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a
                  href="#movies"
                  onClick={(e) => {
                    e.preventDefault()
                    handleCategorySelect('MOVIE')
                  }}
                >
                  Movies
                </a>
              </li>
              <li>
                <a
                  href="#events"
                  onClick={(e) => {
                    e.preventDefault()
                    handleCategorySelect('CONCERT')
                  }}
                >
                  Live Events
                </a>
              </li>
              <li>
                <a
                  href="#city"
                  onClick={(e) => {
                    e.preventDefault()
                    setIsCityModalOpen(true)
                  }}
                >
                  Change City
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="hm-footer__bottom">
          <small>© 2026 Hail Mary Ticket Systems.</small>
        </div>
      </footer>

      {/* City Selector Modal */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        currentCity={selectedCity}
        onSelectCity={handleCitySelect}
        onClose={() => setIsCityModalOpen(false)}
      />

      {/* Booking Success Confirmation Modal with QR Ticket Pass */}
      {confirmedBooking && confirmedEvent && confirmedShowtime && (
        <BookingSuccessModal
          isOpen={confirmedBooking !== null}
          booking={confirmedBooking}
          event={confirmedEvent}
          showtime={confirmedShowtime}
          selectedSeats={confirmedBookingSeats}
          onClose={handleCloseBookingSuccess}
        />
      )}

      {/* Auth Modal (Sign In / Registration) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => setCurrentUser(user)}
      />

      {/* My Bookings Modal */}
      <MyBookingsModal
        isOpen={isBookingsModalOpen && currentUser !== null}
        bookings={savedBookings}
        onClose={() => setIsBookingsModalOpen(false)}
        onViewTicket={handleViewTicketFromHistory}
      />
    </div>
  )
}

export default App
