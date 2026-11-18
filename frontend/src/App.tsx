import { useState, useEffect, useCallback } from 'react'
import type { EventItem, CategoryFilter } from './types/api'
import type { Showtime, Seat, BookingResponse } from './types/booking'
import type { User, SavedBooking } from './types/user'
import { getEvents } from './services/eventService'
import { searchEvents } from './services/searchService'
import { getStoredUser, logout } from './services/authService'
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

type AppView = 'DISCOVERY' | 'EVENT_DETAIL' | 'SEAT_SELECTION'

export function App() {
  // Navigation & View Flow
  const [currentView, setCurrentView] = useState<AppView>('DISCOVERY')
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<EventItem | null>(null)
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null)

  // Booking Confirmation State
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResponse | null>(null)
  const [confirmedBookingSeats, setConfirmedBookingSeats] = useState<Seat[]>([])

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

  // Filtering & Search State
  const [selectedCity, setSelectedCity] = useState<string>('All Cities')
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')

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

  // Search trigger function invoked on user action
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

  const handleCitySelect = (city: string) => {
    setSelectedCity(city)
    triggerSearch(city, activeCategory, searchQuery)
  }

  const handleCategorySelect = (cat: CategoryFilter) => {
    setActiveCategory(cat)
    if (currentView !== 'DISCOVERY') {
      setCurrentView('DISCOVERY')
    }
    triggerSearch(selectedCity, cat, searchQuery)
  }

  const handleSearchSubmit = () => {
    if (currentView !== 'DISCOVERY') {
      setCurrentView('DISCOVERY')
    }
    triggerSearch(selectedCity, activeCategory, searchQuery)
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedCity('All Cities')
    setActiveCategory('ALL')
    setSearchResults(null)
  }

  const handleRetry = () => {
    setIsLoading(true)
    setRetryKey((prev) => prev + 1)
  }

  // Navigation handlers
  const handleOpenEventDetail = (item: EventItem) => {
    setSelectedEventForDetail(item)
    setCurrentView('EVENT_DETAIL')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectShowtime = (showtime: Showtime) => {
    setSelectedShowtime(showtime)
    setCurrentView('SEAT_SELECTION')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Booking completion & persistence
  const handleBookingSuccess = (
    booking: BookingResponse,
    seats: Seat[],
    paymentMethod: string
  ) => {
    setConfirmedBooking(booking)
    setConfirmedBookingSeats(seats)

    if (selectedEventForDetail && selectedShowtime) {
      const subtotal = seats.reduce((acc, s) => acc + s.price, 0)
      const totalAmount = subtotal + seats.length * 1.50

      const newRecord: SavedBooking = {
        bookingId: booking.bookingId,
        eventId: String(selectedEventForDetail.id),
        eventTitle: selectedEventForDetail.title,
        eventCategory: selectedEventForDetail.category,
        posterUrl: selectedEventForDetail.posterUrl,
        venueName: selectedShowtime.venueName,
        city: selectedShowtime.city,
        date: selectedShowtime.date,
        time: selectedShowtime.time,
        screen: selectedShowtime.screen,
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
  }

  const handleCloseBookingSuccess = () => {
    setConfirmedBooking(null)
    setConfirmedBookingSeats([])
    setCurrentView('DISCOVERY')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSignOut = () => {
    logout()
    setCurrentUser(null)
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

    setSelectedEventForDetail(reconstructedEvent)
    setSelectedShowtime(reconstructedShowtime)
    setConfirmedBooking(reconstructedBooking)
    setConfirmedBookingSeats(reconstructedSeats)
  }

  // Filtered lists for Discovery View
  const allDisplayItems = searchResults !== null ? searchResults : [...backendEvents, ...SPOTLIGHT_ITEMS]
  const movieItems = allDisplayItems.filter((item) => item.category.toUpperCase() === 'MOVIE')
  const concertItems = allDisplayItems.filter(
    (item) => item.category.toUpperCase() === 'CONCERT' || item.category.toUpperCase() === 'EVENT'
  )

  return (
    <div className="hm-app">
      {/* Global Navigation Bar */}
      <Navbar
        selectedCity={selectedCity}
        onOpenCityModal={() => setIsCityModalOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => handleCategorySelect(cat as CategoryFilter)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onExecuteSearch={handleSearchSubmit}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
        onOpenMyBookingsModal={() => setIsBookingsModalOpen(true)}
        bookingsCount={savedBookings.length}
        isBackendConnected={apiError === null && !isLoading && backendEvents.length > 0}
      />

      {/* Main View Router */}
      <main className="hm-main">
        {currentView === 'SEAT_SELECTION' && selectedEventForDetail && selectedShowtime ? (
          /* ===============================================================
             View 3: Seat Selection, Booking Summary & Checkout Payment
             =============================================================== */
          <SeatSelectionView
            event={selectedEventForDetail}
            showtime={selectedShowtime}
            currentUser={currentUser}
            onBackToDetails={() => setCurrentView('EVENT_DETAIL')}
            onBookingSuccess={handleBookingSuccess}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        ) : currentView === 'EVENT_DETAIL' && selectedEventForDetail ? (
          /* ===============================================================
             View 2: Movie/Event Details & Showtimes
             =============================================================== */
          <EventDetailView
            event={selectedEventForDetail}
            selectedCity={selectedCity}
            onBackToHome={() => setCurrentView('DISCOVERY')}
            onSelectShowtime={handleSelectShowtime}
          />
        ) : (
          /* ===============================================================
             View 1: Discovery & Homepage
             =============================================================== */
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
                      {activeCategory !== 'ALL' && <> • Category: <strong>{activeCategory}</strong></>}
                      {searchQuery && <> • Keyword: <strong>"{searchQuery}"</strong></>}
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
                      badge={<Badge variant="primary">Cinema</Badge>}
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
        )}
      </main>

      {/* Global Footer */}
      <footer className="hm-footer">
        <div className="hm-container hm-footer__inner">
          <div className="hm-footer__col">
            <div className="hm-footer__brand">🎬 Hail Mary</div>
            <p>
              Your premier entertainment ticketing hub for movies and live events in Ireland.
            </p>
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
          <small>© 2026 Hail Mary Ticket Systems. Built with React 19, TypeScript & Spring Cloud Gateway.</small>
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
      {selectedEventForDetail && selectedShowtime && (
        <BookingSuccessModal
          isOpen={confirmedBooking !== null}
          booking={confirmedBooking}
          event={selectedEventForDetail}
          showtime={selectedShowtime}
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
        isOpen={isBookingsModalOpen}
        bookings={savedBookings}
        onClose={() => setIsBookingsModalOpen(false)}
        onViewTicket={handleViewTicketFromHistory}
      />
    </div>
  )
}

export default App
