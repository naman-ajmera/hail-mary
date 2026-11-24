import { useState, type FormEvent } from 'react'
import type { User } from '../../types/user'
import { login, register } from '../../services/authService'
import { UserIcon, XIcon } from '../common/Icons'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginSuccess: (user: User) => void
}

export function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }

    if (tab === 'REGISTER' && !name.trim()) {
      setError('Please provide your full name.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)

    try {
      if (tab === 'REGISTER') {
        const { user } = await register({
          name: name.trim(),
          email: email.trim(),
          password,
        })
        onLoginSuccess(user)
      } else {
        const { user } = await login({
          email: email.trim(),
          password,
        })
        onLoginSuccess(user)
      }
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed. Please try again.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="hm-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="hm-modal-card hm-modal-card--auth" onClick={(e) => e.stopPropagation()}>
        <div className="hm-modal-header">
          <div className="hm-modal-title">
            <UserIcon width={22} height={22} />
            <h3>Get Started</h3>
          </div>
          <button
            type="button"
            className="hm-icon-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <XIcon width={20} height={20} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="hm-auth-tabs">
          <button
            type="button"
            className={`hm-auth-tab ${tab === 'LOGIN' ? 'hm-auth-tab--active' : ''}`}
            onClick={() => {
              setTab('LOGIN')
              setError(null)
            }}
            disabled={isLoading}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`hm-auth-tab ${tab === 'REGISTER' ? 'hm-auth-tab--active' : ''}`}
            onClick={() => {
              setTab('REGISTER')
              setError(null)
            }}
            disabled={isLoading}
          >
            Create Account
          </button>
        </div>

        {error && <div className="hm-auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="hm-auth-form">
          {tab === 'REGISTER' && (
            <div className="hm-form-group">
              <label htmlFor="auth-name">Full Name</label>
              <input
                id="auth-name"
                type="text"
                placeholder="e.g. Sarah Connor"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="hm-input"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="hm-form-group">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              placeholder="e.g. sarah@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="hm-input"
              disabled={isLoading}
            />
          </div>

          <div className="hm-form-group">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="hm-input"
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="hm-button hm-button--primary hm-button--block"
            disabled={isLoading}
          >
            {isLoading
              ? 'Loading...'
              : tab === 'LOGIN'
                ? 'Sign In to Hail Mary'
                : 'Create Account & Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
