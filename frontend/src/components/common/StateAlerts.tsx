import { AlertCircleIcon, RefreshCwIcon, SearchIcon } from './Icons'

interface ErrorAlertProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorAlert({ title = 'Unable to Load Events', message, onRetry }: ErrorAlertProps) {
  return (
    <div className="hm-alert hm-alert--error" role="alert">
      <div className="hm-alert__icon">
        <AlertCircleIcon width={24} height={24} />
      </div>
      <div className="hm-alert__content">
        <h4>{title}</h4>
        <p>{message}</p>
        {onRetry && (
          <button type="button" onClick={onRetry} className="hm-button hm-button--small hm-button--outline">
            <RefreshCwIcon width={14} height={14} /> Retry Connection
          </button>
        )}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  title?: string
  message?: string
  onReset?: () => void
}

export function EmptyState({
  title = 'No Events or Movies Found',
  message = 'Try modifying your search query or selecting a different city.',
  onReset,
}: EmptyStateProps) {
  return (
    <div className="hm-empty-state">
      <div className="hm-empty-state__icon">
        <SearchIcon width={36} height={36} />
      </div>
      <h3>{title}</h3>
      <p>{message}</p>
      {onReset && (
        <button type="button" onClick={onReset} className="hm-button hm-button--secondary">
          Reset Filters
        </button>
      )}
    </div>
  )
}

