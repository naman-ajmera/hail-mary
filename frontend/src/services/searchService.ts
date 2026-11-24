import { request } from './apiClient'
import type { BackendSearchResult, EventItem } from '../types/api'
import { DEFAULT_POSTERS, KNOWN_ITEM_METADATA } from '../data/displayMetadata'

interface SearchParams {
  q?: string
  city?: string
  category?: string
}

/**
 * Service to query Search Service via API Gateway.
 */
export async function searchEvents(params: SearchParams = {}): Promise<EventItem[]> {
  const queryParts: string[] = []

  if (params.q && params.q.trim()) {
    queryParts.push(`q=${encodeURIComponent(params.q.trim())}`)
  }
  if (params.city && params.city !== 'All Cities') {
    queryParts.push(`city=${encodeURIComponent(params.city.trim())}`)
  }
  if (params.category && params.category !== 'ALL') {
    queryParts.push(`category=${encodeURIComponent(params.category.trim())}`)
  }

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''
  const searchResults = await request<BackendSearchResult[]>(`/api/search${queryString}`)

  return searchResults.map((result) => {
    const key = result.eventId
    const meta = KNOWN_ITEM_METADATA[key]
    const category = result.category ? result.category.toUpperCase() : 'EVENT'
    const fallbackPoster = DEFAULT_POSTERS[category] || DEFAULT_POSTERS.DEFAULT

    return {
      id: result.eventId,
      title: result.title,
      category,
      city: result.city,
      date: result.date || 'TBD',
      posterUrl: meta?.posterUrl || fallbackPoster,
      backdropUrl: meta?.backdropUrl || fallbackPoster,
      rating: meta?.rating ?? 8.3,
      votesCount: meta?.votesCount ?? '3.5K',
      duration: meta?.duration ?? '2h 00m',
      genres: meta?.genres ?? [category],
      formats: meta?.formats ?? ['General Admission'],
      languages: meta?.languages ?? ['English'],
      venue: meta?.venue ?? `${result.city} Central Arena`,
      priceFrom: meta?.priceFrom ?? 15.00,
      description: meta?.description ?? 'Exciting live experience and premier production.',
    }
  })
}

