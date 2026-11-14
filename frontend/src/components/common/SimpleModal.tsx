import type { ReactNode } from 'react'
import { XIcon } from './Icons'

interface SimpleModalProps {
  isOpen: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

export function SimpleModal({ isOpen, title, children, onClose }: SimpleModalProps) {
  if (!isOpen) return null

  return (
    <div className="hm-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="hm-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="hm-modal-header">
          <h3 className="hm-modal-title">{title}</h3>
          <button
            type="button"
            className="hm-icon-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XIcon width={20} height={20} />
          </button>
        </div>
        <div className="hm-modal-body">{children}</div>
      </div>
    </div>
  )
}

