import type { DisplayMetadata, EventItem } from '../types/api'

/**
 * ============================================================================
 * DISPLAY-ONLY METADATA & FALLBACK REPOSITORY
 * ============================================================================
 * Note: These visual assets and metadata enrich the real backend responses
 * (which currently return { id, title, category, city }) with posters, ratings,
 * and venue descriptions until the backend microservice adds media support.
 * ============================================================================
 */

export const DEFAULT_POSTERS: Record<string, string> = {
  MOVIE: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
  CONCERT: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
  THEATRE: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=600&q=80',
  WORKSHOP: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80',
  DEFAULT: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
}

export const KNOWN_ITEM_METADATA: Record<string, DisplayMetadata> = {
  '1': {
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    rating: 8.9,
    votesCount: '48.2K',
    duration: '2h 45m',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    formats: ['IMAX 3D', '4DX', '2D'],
    languages: ['English', 'Spanish'],
    venue: 'Cineworld Dublin, Parnell St',
    priceFrom: 13.50,
    description: 'A mind-bending cinematic journey across unexplored interstellar reaches with state-of-the-art IMAX visuals and Dolby Atmos sound.',
  },
  '2': {
    posterUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    rating: 9.4,
    votesCount: '21.5K',
    duration: '3h 30m',
    genres: ['Electronic', 'Live Music', 'Festival'],
    formats: ['Standing GA', 'VIP Lounge'],
    languages: ['Live'],
    venue: '3Arena, North Wall Quay, Dublin',
    priceFrom: 45.00,
    description: 'Experience an electrifying night of rhythm, synths, and high-energy live performance featuring world-class visual production.',
  },
  'movie-001': {
    posterUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
    rating: 8.4,
    votesCount: '14.8K',
    duration: '2h 15m',
    genres: ['Mystery', 'Thriller', 'Drama'],
    formats: ['Standard 2D', 'Dolby Atmos'],
    languages: ['English'],
    venue: 'Odeon Point Square, Dublin',
    priceFrom: 11.50,
    description: 'An edge-of-your-seat psychological thriller with unexpected twists from acclaimed visionary directors.',
  },
  'concert-001': {
    posterUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    rating: 9.1,
    votesCount: '9.3K',
    duration: '2h 45m',
    genres: ['Indie Rock', 'Acoustic'],
    formats: ['General Admission'],
    languages: ['Live Audio'],
    venue: 'The Olympia Theatre, Dublin',
    priceFrom: 32.00,
    description: 'Intimate acoustic sets and roaring guitar anthems in historic Dublin city center.',
  },
  'movie-002': {
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    rating: 8.7,
    votesCount: '31.0K',
    duration: '2h 30m',
    genres: ['Sci-Fi', 'Space Fantasy'],
    formats: ['IMAX 2D', 'Standard'],
    languages: ['English'],
    venue: 'The Gate Cinema, Cork',
    priceFrom: 12.00,
    description: 'Mankind voyages beyond the solar frontier on a perilous mission to recover deep space artifacts.',
  },
}

/**
 * Featured spotlights for the Hero banner
 */
export const SPOTLIGHT_ITEMS: EventItem[] = [
  {
    id: 'spotlight-1',
    title: 'Interstellar: The Horizon Premiere',
    category: 'MOVIE',
    city: 'Dublin',
    date: '2026-11-08',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80',
    rating: 9.2,
    votesCount: '78.4K',
    duration: '2h 55m',
    genres: ['Sci-Fi', 'Adventure', 'Drama'],
    formats: ['IMAX 70MM', 'Dolby Cinema', '4DX'],
    languages: ['English'],
    venue: 'Cineworld IMAX, Dublin',
    priceFrom: 16.50,
    description: 'Experience the ultimate cinematic spectacle on Irelands largest IMAX screen. Tickets selling fast for opening weekend.',
    isBackendSource: false,
  },
  {
    id: 'spotlight-2',
    title: 'Dublin Neon Beats Live 2026',
    category: 'CONCERT',
    city: 'Dublin',
    date: '2026-11-14',
    posterUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80',
    rating: 9.6,
    votesCount: '45.1K',
    duration: '4h 00m',
    genres: ['Electronic', 'Synthwave', 'DJ Sets'],
    formats: ['General Admission', 'VIP Golden Circle'],
    languages: ['Live Audio'],
    venue: '3Arena Dublin',
    priceFrom: 49.00,
    description: 'The premier electronic and visual experience of the season featuring laser shows and world-touring headliners.',
    isBackendSource: false,
  },
  {
    id: 'spotlight-3',
    title: 'The Space Adventure: Odyssey Cork',
    category: 'MOVIE',
    city: 'Cork',
    date: '2026-11-20',
    posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    rating: 8.8,
    votesCount: '29.3K',
    duration: '2h 20m',
    genres: ['Sci-Fi', 'Thriller'],
    formats: ['Digital 2D', 'Recliner Screen'],
    languages: ['English'],
    venue: 'The Gate Cinema, Cork',
    priceFrom: 12.50,
    description: 'Critically acclaimed deep space exploration thriller now arriving at select premier theaters in Cork.',
    isBackendSource: false,
  },
]

export const POPULAR_CITIES = ['All Cities', 'Dublin', 'Cork', 'Galway', 'Limerick']

