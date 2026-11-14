/**
 * Backend API response formats matching Spring Boot microservices.
 */

// Matches GET /api/events from event-service (EventController.java)
export interface BackendEvent {
  id: number | string;
  title: string;
  category: 'MOVIE' | 'CONCERT' | string;
  city: string;
}

// Matches GET /api/search from search-service (SearchController.java)
export interface BackendSearchResult {
  eventId: string;
  title: string;
  city: string;
  category: string;
  date: string; // ISO date YYYY-MM-DD from LocalDate
}

/**
 * Display-enrichment fields for UI presentation
 * (Used until backend models include media, rating, duration, etc.)
 */
export interface DisplayMetadata {
  posterUrl: string;
  backdropUrl?: string;
  rating?: number;
  votesCount?: string;
  duration?: string;
  genres?: string[];
  formats?: string[];
  languages?: string[];
  venue?: string;
  priceFrom?: number;
  description?: string;
}

/**
 * Unified frontend model consumed by React components.
 */
export interface EventItem {
  id: string;
  title: string;
  category: 'MOVIE' | 'CONCERT' | 'WORKSHOP' | 'THEATRE' | string;
  city: string;
  date?: string;
  // Visual presentation fields
  posterUrl: string;
  backdropUrl: string;
  rating: number;
  votesCount: string;
  duration: string;
  genres: string[];
  formats: string[];
  languages: string[];
  venue: string;
  priceFrom: number;
  description: string;
  isBackendSource: boolean; // Flag to indicate whether record originated from real API
}

export type CategoryFilter = 'ALL' | 'MOVIE' | 'CONCERT' | 'THEATRE' | 'WORKSHOP';

