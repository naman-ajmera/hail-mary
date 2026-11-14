import { request } from './apiClient'
import type { BackendEvent, EventItem } from '../types/api'
import { DEFAULT_POSTERS, KNOWN_ITEM_METADATA } from '../data/displayMetadata'

/**
 * Service to interact with the backend Event Service via API Gateway.
 */
export async function getEvents(): Promise<EventItem[]> {
  const backendEvents = await request<BackendEvent[]>('/api/events')

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
      posterUrl: meta?.posterUrl || fallbackPoster,
      backdropUrl: meta?.backdropUrl || fallbackPoster,
      rating: meta?.rating ?? 8.5,
      votesCount: meta?.votesCount ?? '1.2K',
      duration: meta?.duration ?? '2h 10m',
      genres: meta?.genres ?? [category],
      formats: meta?.formats ?? ['Standard 2D'],
      languages: meta?.languages ?? ['English'],
      venue: meta?.venue ?? `${evt.city || 'Central'} Cinema Hall`,
      priceFrom: meta?.priceFrom ?? 12.00,
      description: meta?.description ?? 'Experience top-tier entertainment and storytelling at your local venue.',
      isBackendSource: true,
    }
  })
}

