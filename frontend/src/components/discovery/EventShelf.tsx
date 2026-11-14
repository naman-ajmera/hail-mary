import type { ReactNode } from 'react'
import type { EventItem } from '../../types/api'
import { EventCard } from './EventCard'

interface EventShelfProps {
  title: string
  subtitle?: string
  items: EventItem[]
  badge?: ReactNode
  onSelectItem: (item: EventItem) => void
}

export function EventShelf({
  title,
  subtitle,
  items,
  badge,
  onSelectItem,
}: EventShelfProps) {
  if (!items || items.length === 0) return null

  return (
    <section className="hm-shelf">
      <div className="hm-shelf__header">
        <div className="hm-shelf__titles">
          <div className="hm-shelf__title-row">
            <h2 className="hm-shelf__title">{title}</h2>
            {badge}
          </div>
          {subtitle && <p className="hm-shelf__subtitle">{subtitle}</p>}
        </div>
        <div className="hm-shelf__count">
          Showing {items.length} {items.length === 1 ? 'result' : 'results'}
        </div>
      </div>

      <div className="hm-shelf-grid">
        {items.map((item) => (
          <EventCard key={item.id} item={item} onSelect={onSelectItem} />
        ))}
      </div>
    </section>
  )
}

