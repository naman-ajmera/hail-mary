import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'warning'
  className?: string
  title?: string
}

export function Badge({ children, variant = 'primary', className = '', title }: BadgeProps) {
  return (
    <span className={`hm-badge hm-badge--${variant} ${className}`} title={title}>
      {children}
    </span>
  )
}
