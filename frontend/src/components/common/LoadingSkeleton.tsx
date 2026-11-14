export function CardSkeleton() {
  return (
    <div className="hm-card-skeleton">
      <div className="hm-card-skeleton__poster shimmer" />
      <div className="hm-card-skeleton__body">
        <div className="hm-card-skeleton__line shimmer" style={{ width: '80%' }} />
        <div className="hm-card-skeleton__line shimmer" style={{ width: '60%' }} />
        <div className="hm-card-skeleton__line shimmer" style={{ width: '40%' }} />
      </div>
    </div>
  )
}

export function ShelfSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="hm-shelf-grid">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

