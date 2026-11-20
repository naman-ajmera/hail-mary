import type { FormEvent } from 'react'
import type { User } from '../types/user'
import {
  FilmIcon,
  MapPinIcon,
  SearchIcon,
  TicketIcon,
  UserIcon,
  ChevronDownIcon,
  XIcon,
} from './common/Icons'

interface NavbarProps {
  selectedCity: string
  onOpenCityModal: () => void
  activeCategory: string
  onSelectCategory: (category: string) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  onExecuteSearch: () => void
  currentUser: User | null
  onOpenAuthModal: () => void
  onSignOut: () => void
  onOpenMyBookingsModal: () => void
  bookingsCount: number
}

export function Navbar({
  selectedCity,
  onOpenCityModal,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onExecuteSearch,
  currentUser,
  onOpenAuthModal,
  onSignOut,
  onOpenMyBookingsModal,
  bookingsCount,
}: NavbarProps) {
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    onExecuteSearch()
  }

  return (
    <header className="hm-navbar">
      {/* Primary Top Bar */}
      <div className="hm-navbar__top">
        <div className="hm-navbar__container">
          {/* Brand Logo */}
          <div className="hm-navbar__brand" onClick={() => onSelectCategory('ALL')}>
            <span className="hm-navbar__logo-icon">🎬</span>
            <div className="hm-navbar__logo-text">
              <span className="hm-navbar__brand-name">Hail Mary</span>
              <span className="hm-navbar__brand-tagline">Tickets & Shows</span>
            </div>
          </div>

          {/* Search Box */}
          <form className="hm-navbar__search-form" onSubmit={handleSearchSubmit}>
            <SearchIcon className="hm-navbar__search-icon" width={18} height={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for movies, live concerts, venues or categories..."
              className="hm-navbar__search-input"
              aria-label="Search events"
            />
            {searchQuery && (
              <button
                type="button"
                className="hm-navbar__search-clear"
                onClick={() => {
                  onSearchChange('')
                  onExecuteSearch()
                }}
                aria-label="Clear search"
              >
                <XIcon width={14} height={14} />
              </button>
            )}
          </form>

          {/* Right Controls: City Selector & User Actions */}
          <div className="hm-navbar__actions">
            {/* City Selector Button */}
            <button
              type="button"
              className="hm-city-btn"
              onClick={onOpenCityModal}
              title="Change your current city"
            >
              <MapPinIcon width={16} height={16} className="hm-city-btn__icon" />
              <span className="hm-city-btn__name">{selectedCity}</span>
              <ChevronDownIcon width={14} height={14} className="hm-city-btn__arrow" />
            </button>

            {/* My Bookings link */}
            <button
              type="button"
              className="hm-navbar__link-btn"
              onClick={onOpenMyBookingsModal}
              title="View your booked tickets"
            >
              <TicketIcon width={16} height={16} />
              <span className="hm-hide-mobile">My Bookings</span>
              {bookingsCount > 0 && (
                <span className="hm-nav-badge">{bookingsCount}</span>
              )}
            </button>

            {/* Auth CTA / User Profile */}
            {currentUser ? (
              <div className="hm-user-profile-menu">
                <div className="hm-user-avatar-pill">
                  <UserIcon width={14} height={14} />
                  <span>{currentUser.name}</span>
                </div>
                <button
                  type="button"
                  className="hm-button hm-button--small hm-button--outline"
                  onClick={onSignOut}
                  title="Sign out of account"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="hm-button hm-button--primary hm-button--small"
                onClick={onOpenAuthModal}
              >
                <UserIcon width={16} height={16} />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Category Bar */}
      <nav className="hm-navbar__subnav">
        <div className="hm-navbar__container hm-navbar__subnav-inner">
          <div className="hm-category-pills">
            <button
              type="button"
              className={`hm-category-pill ${activeCategory === 'ALL' ? 'hm-category-pill--active' : ''}`}
              onClick={() => onSelectCategory('ALL')}
            >
              All Shows
            </button>
            <button
              type="button"
              className={`hm-category-pill ${activeCategory === 'MOVIE' ? 'hm-category-pill--active' : ''}`}
              onClick={() => onSelectCategory('MOVIE')}
            >
              <FilmIcon width={15} height={15} />
              Movies
            </button>
            <button
              type="button"
              className={`hm-category-pill ${activeCategory === 'CONCERT' ? 'hm-category-pill--active' : ''}`}
              onClick={() => onSelectCategory('CONCERT')}
            >
              <TicketIcon width={15} height={15} />
              Live Events & Concerts
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}

export default Navbar
