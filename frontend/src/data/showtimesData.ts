import type { Showtime, Seat, SeatTier } from '../types/booking'

/**
 * ============================================================================
 * SHOWTIME & SEAT DATA GENERATOR
 * ============================================================================
 * Note: Until the backend event-service implements the /api/shows endpoints,
 * this generator provides structured cinema showtimes and seat matrices.
 * Selected showId and seatIds are directly sent to POST /api/bookings.
 * ============================================================================
 */

export interface VenueSchedule {
  venueId: string
  venueName: string
  city: string
  address: string
  screens: {
    name: string
    format: string
    times: string[]
    prices: Record<SeatTier, number>
  }[]
}

export function getVenuesForCity(city: string): VenueSchedule[] {
  const normCity = city.toLowerCase()

  if (normCity === 'cork') {
    return [
      {
        venueId: 'venue-cork-gate',
        venueName: 'The Gate Cinema',
        city: 'Cork',
        address: 'North Main Street, Cork',
        screens: [
          {
            name: 'Screen 1 (Laser 4K)',
            format: 'Digital 4K',
            times: ['14:00', '17:15', '20:30'],
            prices: { VIP: 16.5, PREMIUM: 13.5, STANDARD: 10.5 },
          },
          {
            name: 'Screen 3 (Recliner)',
            format: 'VIP Recliner',
            times: ['15:30', '18:45', '21:15'],
            prices: { VIP: 18.0, PREMIUM: 15.0, STANDARD: 12.0 },
          },
        ],
      },
      {
        venueId: 'venue-cork-omniplex',
        venueName: 'Omniplex Cinema Mahon Point',
        city: 'Cork',
        address: 'Mahon Point Shopping Centre, Cork',
        screens: [
          {
            name: 'MAXX Screen',
            format: 'OmniplexMAXX Dolby Atmos',
            times: ['13:45', '16:50', '20:10'],
            prices: { VIP: 17.5, PREMIUM: 14.0, STANDARD: 11.5 },
          },
        ],
      },
    ]
  }

  // Default to Dublin venues
  return [
    {
      venueId: 'venue-dub-cineworld',
      venueName: 'Cineworld Parnell Street',
      city: 'Dublin',
      address: 'Parnell St, Dublin 1',
      screens: [
        {
          name: 'IMAX Laser Screen',
          format: 'IMAX 3D Laser',
          times: ['13:30', '16:45', '20:00', '22:45'],
          prices: { VIP: 20.0, PREMIUM: 16.5, STANDARD: 13.0 },
        },
        {
          name: 'Screen 7 (Dolby)',
          format: 'Dolby Atmos 2D',
          times: ['14:15', '17:30', '20:45'],
          prices: { VIP: 17.0, PREMIUM: 14.0, STANDARD: 11.0 },
        },
      ],
    },
    {
      venueId: 'venue-dub-odeon',
      venueName: 'ODEON Point Square',
      city: 'Dublin',
      address: 'Point Village, East Wall, Dublin 1',
      screens: [
        {
          name: 'iSense Screen',
          format: 'iSense 4K & Dolby Atmos',
          times: ['14:30', '17:45', '21:00'],
          prices: { VIP: 18.5, PREMIUM: 15.0, STANDARD: 12.0 },
        },
      ],
    },
    {
      venueId: 'venue-dub-omniplex',
      venueName: 'Omniplex Rathmines',
      city: 'Dublin',
      address: 'Swan Shopping Centre, Rathmines, Dublin 6',
      screens: [
        {
          name: 'Screen 2',
          format: 'Standard 2D',
          times: ['15:00', '18:15', '20:30'],
          prices: { VIP: 16.0, PREMIUM: 13.0, STANDARD: 10.0 },
        },
      ],
    },
  ]
}

/**
 * Builds Showtime list for an event across available venues and the selected date.
 */
export function generateShowtimes(eventId: string, city: string, date: string): Showtime[] {
  const venues = getVenuesForCity(city)
  const showtimes: Showtime[] = []

  venues.forEach((venue) => {
    venue.screens.forEach((screen) => {
      screen.times.forEach((time) => {
        const timeKey = time.replace(':', '')
        showtimes.push({
          id: `show-${eventId}-${venue.venueId}-${timeKey}`,
          eventId,
          venueId: venue.venueId,
          venueName: venue.venueName,
          city: venue.city,
          date,
          time,
          screen: screen.name,
          format: screen.format,
          priceTiers: screen.prices,
        })
      })
    })
  })

  return showtimes
}

/**
 * Generates an interactive cinema seat matrix (Rows A through H, 12 seats per row).
 * Preset with realistic occupied/reserved seats for immersion.
 */
export function generateSeatMatrix(showtime: Showtime): Seat[] {
  const rows: { row: string; tier: SeatTier }[] = [
    { row: 'A', tier: 'STANDARD' },
    { row: 'B', tier: 'STANDARD' },
    { row: 'C', tier: 'STANDARD' },
    { row: 'D', tier: 'PREMIUM' },
    { row: 'E', tier: 'PREMIUM' },
    { row: 'F', tier: 'PREMIUM' },
    { row: 'G', tier: 'VIP' },
    { row: 'H', tier: 'VIP' },
  ]

  // Deterministic set of reserved seats based on showtime ID length/chars
  const reservedSeed = new Set([
    'B4', 'B5', 'B8', 'B9',
    'C5', 'C6', 'C7',
    'D3', 'D4', 'D9', 'D10',
    'E6', 'E7',
    'G5', 'G6', 'G7', 'G8',
  ])

  const seats: Seat[] = []

  rows.forEach(({ row, tier }) => {
    const price = showtime.priceTiers[tier]
    for (let num = 1; num <= 12; num++) {
      const id = `${row}${num}`
      const isReserved = reservedSeed.has(id)
      seats.push({
        id,
        row,
        number: num,
        tier,
        price,
        status: isReserved ? 'RESERVED' : 'AVAILABLE',
      })
    }
  })

  return seats
}

/**
 * Returns formatted upcoming calendar dates for the date picker strip.
 */
export function getUpcomingDates(daysCount = 6): { date: string; dayName: string; dayNumber: string; monthName: string }[] {
  const dates = []
  const today = new Date()

  for (let i = 0; i < daysCount; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)

    const dateISO = d.toISOString().split('T')[0]
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-IE', { weekday: 'short' })
    const dayNumber = d.getDate().toString()
    const monthName = d.toLocaleDateString('en-IE', { month: 'short' })

    dates.push({
      date: dateISO,
      dayName,
      dayNumber,
      monthName,
    })
  }

  return dates
}

/**
 * Resolves a showtime by eventId and showtimeId.
 * Searches across upcoming dates and venues, with a fallback reconstruction if not found.
 */
export function getShowtimeById(eventId: string, showtimeId: string, city?: string): Showtime {
  const targetCity = city && city !== 'All Cities' ? city : 'Dublin'
  const dates = getUpcomingDates(7)

  for (const d of dates) {
    const list = generateShowtimes(eventId, targetCity, d.date)
    const match = list.find((s) => s.id === showtimeId)
    if (match) return match
  }

  const otherCities = ['Cork', 'Galway', 'Limerick'].filter(
    (c) => c.toLowerCase() !== targetCity.toLowerCase()
  )
  for (const c of otherCities) {
    for (const d of dates) {
      const list = generateShowtimes(eventId, c, d.date)
      const match = list.find((s) => s.id === showtimeId)
      if (match) return match
    }
  }

  // Fallback: reconstruct a realistic Showtime from the ID
  const parts = showtimeId.split('-')
  let timeStr = '19:30'
  if (parts.length >= 4) {
    const rawTime = parts[parts.length - 1]
    if (rawTime && rawTime.length === 4) {
      timeStr = `${rawTime.slice(0, 2)}:${rawTime.slice(2)}`
    }
  }

  return {
    id: showtimeId,
    eventId,
    venueId: 'venue-fallback',
    venueName: `${targetCity} Grand Cinema`,
    city: targetCity,
    date: dates[0]?.date || 'Today',
    time: timeStr,
    screen: 'Screen 1 (Laser 4K)',
    format: 'Digital 4K',
    priceTiers: { VIP: 16.5, PREMIUM: 13.5, STANDARD: 10.5 },
  }
}


