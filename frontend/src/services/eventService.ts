import { request } from './apiClient'
import type { BackendEvent, EventItem } from '../types/api'
import { DEFAULT_POSTERS, KNOWN_ITEM_METADATA } from '../data/displayMetadata'

/**
 * Service to interact with the backend Event Service via API Gateway.
 */
export async function getEvents(city?: string, category?: string): Promise<EventItem[]> {
  const queryParams = new URLSearchParams()
  if (city && city !== 'All Cities') queryParams.set('city', city)
  if (category && category !== 'ALL') queryParams.set('category', category)

  const queryString = queryParams.toString()
  const endpoint = queryString ? `/api/events?${queryString}` : '/api/events'

  const backendEvents = await request<BackendEvent[]>(endpoint)

  return backendEvents.map((evt) => {
    const key = String(evt.id)
    const meta = KNOWN_ITEM_METADATA[key]
    const category = evt.category ? evt.category.toUpperCase() : 'MOVIE'
    const fallbackPoster = DEFAULT_POSTERS[category] || DEFAULT_POSTERS.DEFAULT

    return {
      id: key,
      title: evt.title || `Event #${evt.id}`,
      category,
      city: evt.city || 'Unknown City',
      date: 'Available Now',
      posterUrl: evt.posterUrl || meta?.posterUrl || fallbackPoster,
      backdropUrl: evt.backdropUrl || meta?.backdropUrl || evt.posterUrl || fallbackPoster,
      rating: evt.rating ?? meta?.rating ?? 8.5,
      votesCount: evt.votesCount ?? meta?.votesCount ?? '1.2K',
      duration: evt.duration ?? meta?.duration ?? '2h 10m',
      genres: evt.genres && evt.genres.length > 0 ? evt.genres : (meta?.genres ?? [category]),
      formats: evt.formats && evt.formats.length > 0 ? evt.formats : (meta?.formats ?? ['Standard 2D']),
      languages: evt.languages && evt.languages.length > 0 ? evt.languages : (meta?.languages ?? ['English']),
      venue: evt.venue ?? meta?.venue ?? `${evt.city || 'Central'} Cinema Hall`,
      priceFrom: evt.priceFrom ?? meta?.priceFrom ?? 12.00,
      description: evt.description ?? meta?.description ?? 'Experience top-tier entertainment and storytelling at your local venue.',
    }
  })
}

export async function getEventById(id: string): Promise<EventItem> {
  const evt = await request<BackendEvent>(`/api/events/${encodeURIComponent(id)}`)
  const key = String(evt.id)
  const meta = KNOWN_ITEM_METADATA[key]
  const category = evt.category ? evt.category.toUpperCase() : 'MOVIE'
  const fallbackPoster = DEFAULT_POSTERS[category] || DEFAULT_POSTERS.DEFAULT

  return {
    id: key,
    title: evt.title || `Event #${evt.id}`,
    category,
    city: evt.city || 'Unknown City',
    date: 'Available Now',
    posterUrl: evt.posterUrl || meta?.posterUrl || fallbackPoster,
    backdropUrl: evt.backdropUrl || meta?.backdropUrl || evt.posterUrl || fallbackPoster,
    rating: evt.rating ?? meta?.rating ?? 8.5,
    votesCount: evt.votesCount ?? meta?.votesCount ?? '1.2K',
    duration: evt.duration ?? meta?.duration ?? '2h 10m',
    genres: evt.genres && evt.genres.length > 0 ? evt.genres : (meta?.genres ?? [category]),
    formats: evt.formats && evt.formats.length > 0 ? evt.formats : (meta?.formats ?? ['Standard 2D']),
    languages: evt.languages && evt.languages.length > 0 ? evt.languages : (meta?.languages ?? ['English']),
    venue: evt.venue ?? meta?.venue ?? `${evt.city || 'Central'} Cinema Hall`,
    priceFrom: evt.priceFrom ?? meta?.priceFrom ?? 12.00,
    description: evt.description ?? meta?.description ?? 'Experience top-tier entertainment and storytelling at your local venue.',
  }
}
